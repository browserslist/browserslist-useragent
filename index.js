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
  ie: 'Explorer',
  ie_mob: 'ExplorerMobile',
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

  const strippedUA = uaString.replace(/((CriOS|OPiOS)\/(\d+)\.(\d+)\.(\d+)\.(\d+))/, '');
  const parsedUA = useragent.parse(strippedUA)

  // Case A: For Safari, Chrome and others browsers
  // that report as Safari after stripping tags
  if (parsedUA.family.includes('Safari')) {
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
    parsedUA.family.includes('Chromium') ||
    parsedUA.family.includes('HeadlessChrome')
  ) {
    return {
      family: 'Chrome',
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
const semverify = (version) => {
  if (typeof version === 'string' && semver.valid(version)) {
    return version
  }

  const split = version.toString().split('.')

  while (split.length < 3) {
    split.push('0')
  }

  return split.join('.')
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
  return browsersList.map(browser => {
    const [browserName, browserVersion] = browser.split(' ')

    let normalizedName = browserName
    let normalizedVersion = browserVersion

    if (browserName in browserNameMap) {
      normalizedName = browserNameMap[browserName]
    }

    try {
      // Browser version can return as "10.0-10.2"
      const splitVersion = browserVersion.split('-')[0]
      normalizedVersion = semverify(splitVersion)
    } catch (e) {
    }

    return {
      family: normalizedName,
      version: normalizedVersion,
    }
  })
}

const compareBrowserSemvers = (versionA, versionB, options) => {
  let referenceVersion = versionB

  if (options.ignorePatch) {
    referenceVersion = `~${versionB}`
  }

  if (options.ignoreMinor) {
    referenceVersion = `^${versionB}`
  }

  if (options._allowHigherVersions) {
    return semver.gte(versionA, versionB)
  } else {
    return semver.satisfies(versionA, referenceVersion)
  }
}

const matchesUA = (uaString, opts) => {
  let normalizedQuery
  if (opts && opts.browsers) {
    normalizedQuery = opts.browsers.map(normalizeQuery)
  }
  const browsers = browserslist(normalizedQuery, {
    env: opts.env,
    path: process.cwd()
  })
  const parsedBrowsers = parseBrowsersList(browsers)
  const resolvedUserAgent = resolveUserAgent(uaString)

  const options = {
    ignoreMinor: false,
    ignorePatch: true,
    ...opts
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

