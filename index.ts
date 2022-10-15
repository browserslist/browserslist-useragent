import browserslist from 'browserslist';
import semver from 'semver';
import UAParser from 'ua-parser-js';

// @see https://github.com/ai/browserslist#browsers

// map of equivalent browsers,
// see https://github.com/ai/browserslist/issues/156

const browserNameMap: Record<string, string> = {
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

function resolveUserAgent(uaString: string): { family: string | null, version: string | null } {
  const parsedUANew = UAParser(uaString)
  const parsedBrowserVersion = semverify(parsedUANew.browser.version)
  const parsedOSVersion = semverify(parsedUANew.os.version)
  const parsedEngineVersion = semverify(parsedUANew.engine.version)

  // Case A: For Safari on iOS, the use the browser version
  if (
    parsedUANew.browser.name === 'Safari' && parsedUANew.os.name === 'iOS') {
    return {
      family: 'iOS',
      version: parsedBrowserVersion,
    }
  }

  // Case B: The browser on iOS didn't report as safari,
  // so we use the iOS version as a proxy to the browser
  // version. This is based on the assumption that the
  // underlying Safari Engine used will be *atleast* equal
  // to the iOS version it's running on.
  if (parsedUANew.os.name === 'iOS') {
    return {
      family: 'iOS',
      version: parsedOSVersion
    }
  }

  if (
    (parsedUANew.browser.name === 'Opera' && parsedUANew.device.type === 'mobile') ||
    parsedUANew.browser.name === 'Opera Mobi'
  ) {
    return {
      family: 'OperaMobile',
      version: parsedBrowserVersion
    }
  }

  if (parsedUANew.browser.name === 'Samsung Browser') {
    return {
      family: 'Samsung',
      version: parsedBrowserVersion
    }
  }

  if (parsedUANew.browser.name === 'IE') {
    return {
      family: 'Explorer',
      version: parsedBrowserVersion
    }
  }

  if (parsedUANew.browser.name === 'IEMobile') {
    return {
      family: 'ExplorerMobile',
      version: parsedBrowserVersion
    }
  }

  // Use engine version for gecko-based browsers
  if (parsedUANew.engine.name === 'Gecko') {
    return {
      family: 'Firefox',
      version: parsedEngineVersion
    }
  }

  // Use engine version for blink-based browsers
  if (parsedUANew.engine.name === 'Blink') {
    return {
      family: 'Chrome',
      version: parsedEngineVersion
    }
  }

  if (parsedUANew.browser.name === 'Android Browser') {
    // Versions prior to Blink were based
    // on the OS version. Only after this
    // did android start using system chrome for web-views
    return {
      family: 'Android',
      version: parsedOSVersion
    }
  }

  return {
    family: parsedUANew.browser.name || null,
    version: parsedBrowserVersion
  }
}

// Convert version to a semver value.
// 2.5 -> 2.5.0; 1 -> 1.0.0;
const semverify = (version: string | undefined | null) => {
  if (!version) {
    return null
  }
  const cooerced = semver.coerce(version, { loose: true })
  if (!cooerced) {
    return null
  }
  return cooerced.version
}

// 10.0-10.2 -> 10.0, 10.1, 10.2
function generateSemversInRange(versionRange: string) {
  const [start, end] = versionRange.split('-')
  const startSemver = semverify(start)
  const endSemver = semverify(end)

  if(!startSemver || !endSemver) {
    return []
  }
  const versionsInRange = []
  let curVersion = startSemver

  while (semver.gte(endSemver, curVersion)) {
    versionsInRange.push(curVersion)
    curVersion = semver.inc(curVersion, 'minor') as string
  }

  return versionsInRange
}

function normalizeQuery(query: string) {
  let normalizedQuery = query
  const regex = `(${Object.keys(browserNameMap).join('|')})`
  const match = query.match(new RegExp(regex))

  if (match) {
    normalizedQuery = query.replace(match[0], browserNameMap[match[0]])
  }

  return normalizedQuery
}

const parseBrowsersList = (browsersList: string[]): { family: string, version: string | null }[] => {
  const browsers = browsersList
    .map((browser) => {
      const [name, version] = browser.split(' ')
      return { name, version }
    })
    // #38 Filter out non-numerical browser versions
    .filter((browser) => browser.version !== 'TP')
    .map((browser) => {
      let normalizedName = browser.name
      let normalizedVersion = browser.version

      if (browser.name in browserNameMap) {
        normalizedName = browserNameMap[browser.name]
      }

      // browserslist might return ranges (9.0-9.2), unwrap them
      // see https://github.com/browserslist/browserslist-useragent/issues/41
      if (browser.version.indexOf('-') > 0) {
        return generateSemversInRange(browser.version).map((version) => ({
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

  return browsers.flat()
}

const compareBrowserSemvers = (versionA: string, versionB: string, options: Options) => {
  const semverifiedA = semverify(versionA)
  const semverifiedB = semverify(versionB)

  if(!semverifiedA || !semverifiedB) {
    return false
  }
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

type Options = {
  browsers?: string[],
  env?: string,
  path?: string,
  ignoreMinor?: boolean,
  ignorePatch?: boolean,
  allowHigherVersions?: boolean
}

const matchesUA = (uaString: string, opts: Options = {}) => {
  // bail out early if the user agent is invalid
  if (!uaString) {
    return false
  }

  let normalizedQuery
  if (opts.browsers) {
    normalizedQuery = opts.browsers.map(normalizeQuery)
  }
  const browsers = browserslist(normalizedQuery, {
    env: opts.env,
    path: opts.path || process.cwd(),
  })


  const parsedBrowsers = parseBrowsersList(browsers)


  const resolvedUserAgent = resolveUserAgent(uaString)

  const options = {
    ignoreMinor: false,
    ignorePatch: true,
    ...opts,
  }

  return parsedBrowsers.some((browser) => {
    if (!resolvedUserAgent.family) return false
    if (!resolvedUserAgent.version) return false
    if(!browser.version) return false


    return (
      browser.family.toLowerCase() ===
      resolvedUserAgent.family.toLocaleLowerCase() &&
      compareBrowserSemvers(resolvedUserAgent.version, browser.version, options)
    )
  })
}

export {
  matchesUA,
  resolveUserAgent,
  normalizeQuery,
}
