const browserslist = require('browserslist')
const semver = require('semver')
const useragent = require('useragent')

// @see https://github.com/ai/browserslist#browsers

// The Ideal map would be this, but we
// cant use it due to https://github.com/ai/browserslist/issues/156
/*
const browserNameMap = {
  bb: 'BlackBerry',
  and_chr: 'ChromeAndroid',
  and_ff: 'ChromeAndroid',
  ie: 'Explorer',
  ie_mob: 'ExplorerMobile',
  ff: 'Firefox',
  ios_saf: 'iOS',
  op_mini: 'OperaMini',
  op_mob: 'OperaMobile',
  and_qq: 'QQAndroid',
  and_uc: 'UCAndroid',
}
*/

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
  const parsedUA = useragent.parse(uaString)

  if (parsedUA.os.family === 'iOS') {
    return {
      family: 'iOS',
      version: [parsedUA.os.major, parsedUA.os.minor,
                parsedUA.os.patch].join('.'),
    }
  }

  // This should ideally be parsed to ChromeAndroid, but due to this bug
  // https://github.com/ai/browserslist/issues/156
  // we use Chrome instead. Anyways, they are in-sync
  if (parsedUA.family.indexOf('Chrome Mobile') > -1) {
    return {
      family: 'Chrome',
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


  // This should ideally be parsed to FirefoxAndroid, but due to this bug
  // https://github.com/ai/browserslist/issues/156
  // we use Firefox instead. Anyways, they are in-sync
  if (parsedUA.family === 'Firefox Mobile') {
    return {
      family: 'Firefox',
      version: [parsedUA.major, parsedUA.minor, parsedUA.patch].join('.'),
    }
  }

  return {
    family: parsedUA.family,
    version: [parsedUA.major, parsedUA.minor, parsedUA.patch].join('.'),
  }
}

const validBrowserslistTargets = [
  ...Object.keys(browserslist.data),
  ...Object.keys(browserslist.aliases),
]

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

const semverMin = (first, second) =>
  (first && semver.lt(first, second) ? first : second)


const parseBrowsersList = (browsersList) => {
  return browsersList.map(browser => {
    const [browserName, browserVersion] = browser.split(' ')

    let normalizedName = browserName
    let normalizedVersion = browserVersion

    if (browserName in browserNameMap) {
      normalizedName = browserNameMap[browserName]
    }

    // TODO: Needed?
    try {
      // Browser version can return as "10.0-10.2"
      const splitVersion = browserVersion.split('-')[0]
      normalizedVersion = semverify(splitVersion)
    } catch (e) {}

    return {
      family: normalizedName,
      version: normalizedVersion,
    }
  })
}

const getLowestVersions = browsers =>
  browsers.reduce((all, browser) => {
    const [browserName, browserVersion] = browser.split(' ')
    const normalizedBrowserName = browserNameMap[browserName]

    if (!normalizedBrowserName) {
      return all
    }

    try {
      // Browser version can return as "10.0-10.2"
      const splitVersion = browserVersion.split('-')[0]
      const parsedBrowserVersion = semverify(splitVersion)

      // eslint-disable-next-line no-param-reassign
      all[normalizedBrowserName] = semverMin(
        all[normalizedBrowserName],
        parsedBrowserVersion,
      )
    } catch (e) {}

    return all
  }, {})

const compareBrowserSemvers = (versionA, versionB, options) => {
  let referenceVersion = versionB

  if (options.ignorePatch) {
    referenceVersion = `~${versionB}`
  }

  if (options.ignoreMinor) {
    referenceVersion = `^${versionB}`
  }

  if (options.allowHigherVersions) {
    return semver.gte(versionA, versionB)
  } else {
    return semver.satisfies(versionA, referenceVersion)
  }
}

const matchesUA = (uaString, browserlistQuery, opts) => {
  // Parse browsers target via browserslist;
  const browsers = browserslist(browserlistQuery, { path: process.cwd() })
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
}

