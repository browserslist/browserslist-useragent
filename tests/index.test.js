const ua = require('useragent-generator')

const { resolveUserAgent, matchesUA, normalizeQuery } = require('../index')

it('normalizes queries properly', () => {
  expect(normalizeQuery('and_chr >= 61'))
    .toBe('Chrome >= 61')

  expect(normalizeQuery('ChromeAndroid >= 61'))
    .toBe('Chrome >= 61')

  expect(normalizeQuery('FirefoxAndroid < 54'))
    .toBe('Firefox < 54')

  expect(normalizeQuery('ff < 54'))
    .toBe('Firefox < 54')

  expect(normalizeQuery('ios_saf < 10.1.0'))
    .toBe('iOS < 10.1.0')

  expect(normalizeQuery('last 10 and_chr versions'))
    .toBe('last 10 Chrome versions')

  expect(normalizeQuery('>= 5%'))
    .toBe('>= 5%')
})

it('resolves all browsers in iOS to safari with correct platform version', () => {
  expect(resolveUserAgent(ua.chrome.iOS('10.3.0')))
    .toEqual({
      family: 'iOS',
      version: '10.3.0',
    })

  expect(resolveUserAgent(ua.firefox.iOS('10.3.0')))
    .toEqual({
      family: 'iOS',
      version: '10.3.0',
    })

  expect(resolveUserAgent(ua.safari.iOSWebview('10.3.0')))
    .toEqual({
      family: 'iOS',
      version: '10.3.0',
    })

  expect(resolveUserAgent(ua.safari.iOS('8.3.0')))
    .toEqual({
      family: 'iOS',
      version: '8.3.0',
    })
})

it('resolves IE/Edge properly', () => {
  expect(resolveUserAgent(ua.ie('11.0.0')))
    .toEqual({
      family: 'Explorer',
      version: '11.0.0',
    })

  expect(resolveUserAgent(ua.ie.windowsPhone('10.0.0')))
    .toEqual({
      family: 'ExplorerMobile',
      version: '10.0.0',
    })


  expect(resolveUserAgent(ua.edge('14.1.0')))
    .toEqual({
      family: 'Edge',
      version: '14.1.0',
    })
})

it('resolves chrome/android properly', () => {
  expect(resolveUserAgent(ua.chrome('41.0.228.90')))
    .toEqual({
      family: 'Chrome',
      version: '41.0.228',
    })

  expect(resolveUserAgent(ua.chrome.androidWebview('2.3.3')))
    .toEqual({
      family: 'Android',
      version: '2.3.3',
    })

  expect(resolveUserAgent(
    ua.chrome.androidWebview({
      androidVersion: '4.4.1', chromeVersion: '44.0.0',
    }),
  ))
    .toEqual({
      family: 'Chrome',
      version: '44.0.0',
    })

  expect(resolveUserAgent(
    ua.chrome.androidWebview({
      androidVersion: '6.0.0', chromeVersion: '60.0.0',
    }),
  ))
    .toEqual({
      family: 'Chrome',
      version: '60.0.0',
    })
})

it('resolves headless chrome properly', () => {
  expect(resolveUserAgent(ua.chrome('41.0.228.90').replace('Chrome', 'HeadlessChrome')))
    .toEqual({
      family: 'Chrome',
      version: '41.0.228',
    })
})

it('resolves firefox properly', () => {
  expect(resolveUserAgent(ua.firefox('41.0.0')))
    .toEqual({
      family: 'Firefox',
      version: '41.0.0',
    })

  expect(resolveUserAgent(ua.firefox.androidPhone('44.0.0')))
    .toEqual({
      family: 'Firefox',
      version: '44.0.0',
    })
})

it('detects if browserslist matches UA', () => {
  expect(matchesUA(ua.firefox.androidPhone('40.0.1'), { browsers: ['Firefox >= 40'] }))
    .toBeTruthy()

  expect(matchesUA(ua.firefox('30.0.0'), { browsers: ['Firefox >= 10.0.0'] }))
    .toBeTruthy()

  expect(matchesUA(ua.chrome.iOS('11.0.0'), { browsers: ['iOS >= 10.3.0'] }))
    .toBeTruthy()

  expect(matchesUA(ua.safari.iOS('11.0.0'), { browsers: ['iOS >= 10.3.0'] }))
    .toBeTruthy()

  const modernList = [
    "Firefox >= 53",
    "Edge >= 15",
    "Chrome >= 58",
    "iOS >= 10",
  ]

  expect(matchesUA(ua.safari.iOS(9), { browsers: modernList }))
    .toBeFalsy()

  expect(matchesUA(ua.chrome.androidPhone(57),  { browsers: modernList }))
    .toBeFalsy()

  expect(matchesUA(ua.firefox.androidPhone(52),  { browsers: modernList }))
    .toBeFalsy()

  expect(matchesUA(ua.edge(14),  { browsers: modernList }))
    .toBeFalsy()

  expect(matchesUA(ua.chrome(64),  { browsers: modernList }))
    .toBeTruthy()

  expect(matchesUA(ua.chrome.androidWebview('4.3.3'),  { browsers: modernList }))
    .toBeFalsy()
})

it('can interpret various variations in specifying browser names', () => {
  expect(matchesUA(ua.chrome(49), { browsers: ['and_chr >= 49'] }))
    .toBeTruthy()

  expect(matchesUA(ua.safari.iOS('10.3.0'), { browsers: ['ios_saf >= 10.1.0'] }))
    .toBeTruthy()

  expect(matchesUA(ua.safari('10.3.0'), { browsers: ['ios_saf >= 10.1.0'] }))
    .toBeTruthy()

  expect(matchesUA(ua.firefox.androidPhone('46.0.0'), { browsers: ['FirefoxAndroid >= 41.1.0'] }))
    .toBeTruthy()
})

it('ignorePatch option works correctly', () => {
  expect(matchesUA(ua.firefox('49.0.1'), { browsers: ['ff >= 44'] , ignorePatch: false }))
    .toBeFalsy()

  expect(matchesUA(ua.firefox('49.0.1'), { browsers: ['ff >= 44'] , ignorePatch: true }))
    .toBeTruthy()

  expect(
    matchesUA(
      ua.firefox('49.1.1'),
      { browsers: ['ff >= 44'] , ignorePatch: true, ignoreMinor: false },
    ),
  )
    .toBeFalsy()
})

it('ignoreMinor option works correctly', () => {
  expect(matchesUA(ua.firefox('49.1.0'), { browsers: ['ff >= 44'], ignoreMinor: false }))
    .toBeFalsy()

  expect(matchesUA(ua.firefox('49.1.0'), { browsers: ['ff >= 44'], ignoreMinor: true }))
    .toBeTruthy()

  expect(
    matchesUA(
      ua.firefox('49.1.3'),
      { browsers: ['ff >= 44'], ignoreMinor: true, ignorePatch: false },
    ),
  )
    .toBeTruthy()
})


it('_allowHigherVersions works correctly', () => {
  expect(matchesUA(ua.chrome('66'), { browsers: ['chrome >= 60'], _allowHigherVersions: false }))
    .toBeFalsy()

  expect(matchesUA(ua.chrome('66'), { browsers: ['chrome >= 60'], _allowHigherVersions: true }))
    .toBeTruthy()
})
