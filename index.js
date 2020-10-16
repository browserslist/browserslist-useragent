const browserslist = require('browserslist')
const semver = require('semver')
const useragent = require('useragent')

// @see https://github.com/ai/browserslist#browsers

// map of equivalent browsers,
// see https://github.com/ai/browserslist/issues/156

const browserNameMap = {
  bb: 'BlackBerry',
  and_chr: 'Chrome',
  ChromeAndroid: 'Chrome',
  FirefoxAndroid: 'Firefox',
  ff: 'Firefox',
  ie_mob: 'ExplorerMobile',
  ie: 'Explorer',
  and_ff: 'Firefox',
  ios_saf: 'iOS',
  op_mini: 'OperaMini',
  op_mob: 'OperaMobile',
  and_qq: 'QQAndroid',
  and_uc: 'UCAndroid',
}

function resolveUserAgent(uaString) {
  // Chrome and Opera on iOS uses a UIWebView of the underlying platform to render
  // content, by stripping the CriOS or OPiOS strings the useragent parser will alias the
  // user agent to ios_saf for the UIWebView, which is closer to the actual
  // renderer
  // @see https://github.com/Financial-Times/polyfill-service/pull/416

  let strippedUA = uaString.replace(/((CriOS|OPiOS)\/(\d+)\.(\d+)\.(\d+)\.(\d+))/, '')

  // Yandex Browser uses Chromium as the udnerlying engine
  strippedUA = strippedUA.replace(/YaBrowser\/(\d+\.?)+/g, '')

  // Facebook Webview
  strippedUA = strippedUA.replace(/FB_IAB/g, '').replace(/FBAN\/FBIOS/g, '');

  const parsedUA = useragent.parse(strippedUA)

  // Case A: For Safari, Chrome and others browsers on iOS
  // that report as Safari after stripping tags
  if (parsedUA.family.includes('Safari') && parsedUA.os.family === 'iOS') {
    return {
      family: 'iOS',
      version: [parsedUA.major, parsedUA.minor, parsedUA.patch].join('.'),
    }
  }

  // Case B: The browser on iOS didn't report as safari,
  // so we use the iOS version as a proxy to the browser
  // version. This is based on the assumption that the
  // underlying Safari Engine used will be *atleast* equal
  // to the iOS version it's running on.
  if (parsedUA.os.family === 'iOS') {
    return {
      family: 'iOS',
      version: [parsedUA.os.major, parsedUA.os.minor,
        parsedUA.os.patch].join('.'),
    }
  }


  // Case C: The caniuse database does not contain
  // historical browser versions for so called `minor`
  // browsers like Chrome for Android, Firefox for Android etc
  // In this case, we proxy to the desktop version
  // @see https://github.com/Fyrd/caniuse/issues/3518

  if (
    parsedUA.family.includes('Chrome Mobile') ||
    parsedUA.family.includes('Chrome Mobile WebView') ||
    parsedUA.family.includes('Chromium') ||
    parsedUA.family.includes('HeadlessChrome')
  ) {
    return {
      family: 'Chrome',
      version: [parsedUA.major, parsedUA.minor, parsedUA.patch].join('.'),
    }
  }

  if (parsedUA.family === 'Samsung Internet') {
    return {
      family: 'Samsung',
      version: [parsedUA.major, parsedUA.minor, parsedUA.patch].join('.'),
    }
  }

  if (parsedUA.family === 'Firefox Mobile') {
    return {
      family: 'Firefox',
      version: [parsedUA.major, parsedUA.minor, parsedUA.patch].join('.'),
    }
  }

  if (parsedUA.family === 'IE') {
    return {
      family: 'Explorer',
      version: [parsedUA.major, parsedUA.minor, parsedUA.patch].join('.'),
    }
  }

  if (parsedUA.family === 'IE Mobile') {
    return {
      family: 'ExplorerMobile',
      version: [parsedUA.major, parsedUA.minor, parsedUA.patch].join('.'),
    }
  }

  return {
    family: parsedUA.family,
    version: [parsedUA.major, parsedUA.minor, parsedUA.patch].join('.'),
  }
}

// Convert version to a semver value.
// 2.5 -> 2.5.0; 1 -> 1.0.0;
const semverify = (version) => semver.coerce(version, { loose: true }).version;

function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

// 10.0-10.2 -> 10.0, 10.1, 10.2
function generateSemversInRange(versionRange) {
  const [start, end] = versionRange.split('-')
  const startSemver = semverify(start)
  const endSemver = semverify(end)
  const versionsInRange = [];
  let curVersion = startSemver;

  while (semver.gte(endSemver, curVersion)) {
    versionsInRange.push(curVersion)
    curVersion = semver.inc(curVersion, 'minor')
  }

  return versionsInRange;
}

function normalizeQuery(query) {
  let normalizedQuery = query
  const regex = `(${Object.keys(browserNameMap).join('|')})`
  const match = query.match(new RegExp(regex))

  if (match) {
    normalizedQuery = query.replace(match[0], browserNameMap[match[0]])
  }

  return normalizedQuery
}

const parseBrowsersList = (browsersList) => {
  const browsers = browsersList
    .map(browser => {
      const [name, version] = browser.split(' ')
      return { name, version }
    })
    // #38 Filter out non-numerical browser versions
    .filter(browser => browser.version !== 'TP')
    .map(browser => {

      let normalizedName = browser.name
      let normalizedVersion = browser.version

      if (browser.name in browserNameMap) {
        normalizedName = browserNameMap[browser.name]
      }

      // browserslist might return ranges (9.0-9.2), unwrap them
      // see https://github.com/browserslist/browserslist-useragent/issues/41
      if (browser.version.indexOf('-') > 0) {
        return generateSemversInRange(browser.version).map(version => ({
          family: normalizedName,
          version,
        }))
      } else {
        return {
          family: normalizedName,
          version: normalizedVersion,
        }
      }
    })

  return flatten(browsers);
}

const compareBrowserSemvers = (versionA, versionB, options) => {
  const semverifiedA = semverify(versionA)
  const semverifiedB = semverify(versionB)
  let referenceVersion = semverifiedB

  if (options.ignorePatch) {
    referenceVersion = `~${semverifiedB}`
  }

  if (options.ignoreMinor) {
    referenceVersion = `^${semverifiedB}`
  }

  if (options.allowHigherVersions) {
    return semver.gte(semverifiedA, semverifiedB)
  } else {
    return semver.satisfies(semverifiedA, referenceVersion)
  }
}

const matchesUA = (uaString, opts = {}) => {
  let normalizedQuery
  if (opts.browsers) {
    normalizedQuery = opts.browsers.map(normalizeQuery)
  }
  const browsers = browserslist(normalizedQuery, {
    env: opts.env,
    path: opts.path || process.cwd()
  })
  const parsedBrowsers = parseBrowsersList(browsers)

  const resolvedUserAgent = resolveUserAgent(uaString)

  const options = {
    ignoreMinor: false,
    ignorePatch: true,
    ...opts,
  }

  return parsedBrowsers.some(browser => {
    return (
      browser.family.toLowerCase() === resolvedUserAgent.family.toLocaleLowerCase() &&
      compareBrowserSemvers(resolvedUserAgent.version, browser.version, options)
    )
  })
}

module.exports = {
  matchesUA,
  resolveUserAgent,
  normalizeQuery,
}

