const ua = require('useragent-generator')

const { resolveUserAgent, matchesUA, normalizeQuery } = require('../index')

const CustomUserAgentString = {
  YANDEX: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 YaBrowser/18.1.1.839 Yowser/2.5 Safari/537.36',
  SAMSUNG_BROWSER_7_2: 'Mozilla/5.0 (Linux; Android 6.0.1; SAMSUNG SM-N930F Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/7.2 Chrome/63.0.3239.111 Mobile Safari/537.36',
  FACEBOOK_WEBVIEW_CHROME_ANDROID: 'Mozilla/5.0 (Linux; Android 8.0.0; LG-H930 Build/OPR1.170623.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/69.0.3497.100 Mobile Safari/537.36 [FB_IAB/Orca-Android;FBAV/189.0.0.27.99;]',
  FACEBOOK_WEBVIEW_IOS: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12D508 [FBAN/FBIOS;FBAV/27.0.0.10.12;FBBV/8291884;FBDV/iPhone7,1;FBMD/iPhone;FBSN/iPhone OS;FBSV/8.2;FBSS/3; FBCR/vodafoneIE;FBID/phone;FBLC/en_US;FBOP/5]',
}

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

it('resolves desktop safari on osx properly', () => {
  expect(resolveUserAgent(ua.safari('10.1.0')))
    .toEqual({
      family: 'Safari',
      version: '10.1.0',
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


  expect(resolveUserAgent(ua.chrome('41.0.228.90').replace('Chrome', 'HeadlessChrome')))
    .toEqual({
      family: 'Chrome',
      version: '41.0.228',
    })

  expect(resolveUserAgent(ua.chromium('41.0.228.90')))
    .toEqual({
      family: 'Chrome',
      version: '41.0.228',
    })

  expect(matchesUA(CustomUserAgentString.YANDEX, { browsers: ['Chrome >= 63'] }))
    .toBeTruthy()

  expect(resolveUserAgent(CustomUserAgentString.FACEBOOK_WEBVIEW_CHROME_ANDROID))
    .toEqual({
      family: 'Chrome',
      version: '69.0.3497',
    })

  expect(matchesUA(CustomUserAgentString.FACEBOOK_WEBVIEW_CHROME_ANDROID, { browsers: ['Chrome >= 63'] }))
    .toBeTruthy()

  expect(resolveUserAgent(CustomUserAgentString.FACEBOOK_WEBVIEW_IOS))
    .toEqual({
      family: 'iOS',
      version: '8.2.0',
    })

  expect(matchesUA(CustomUserAgentString.FACEBOOK_WEBVIEW_IOS, { browsers: ['iOS >= 8'] }))
    .toBeTruthy()
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

it('resolves samsung browser properly', () => {
  expect(resolveUserAgent(CustomUserAgentString.SAMSUNG_BROWSER_7_2))
    .toEqual({
      family: 'Samsung',
      version: '7.2.0'
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

  expect(matchesUA(CustomUserAgentString.SAMSUNG_BROWSER_7_2, { browsers: ['Samsung >= 7'] }))
    .toBeTruthy()

  const modernList = [
    'Firefox >= 53',
    'Edge >= 15',
    'Chrome >= 58',
    'iOS >= 10',
    'Safari >= 11',
    'Samsung >= 7'
  ]

  expect(matchesUA(ua.safari.iOS(9), { browsers: modernList }))
    .toBeFalsy()

  expect(matchesUA(ua.chrome.androidPhone(57), { browsers: modernList }))
    .toBeFalsy()

  expect(matchesUA(ua.firefox.androidPhone(52), { browsers: modernList }))
    .toBeFalsy()

  expect(matchesUA(ua.firefox(56), { browsers: modernList }))
    .toBeTruthy()

  expect(matchesUA(ua.edge(14), { browsers: modernList }))
    .toBeFalsy()

  expect(matchesUA(ua.chrome(64), { browsers: modernList }))
    .toBeTruthy()

  expect(matchesUA(ua.chrome.androidWebview('4.3.3'), { browsers: modernList }))
    .toBeFalsy()

  expect(matchesUA(ua.safari('12.0.0'), { browsers: modernList }))
    .toBeTruthy()

  expect(matchesUA(ua.safari('10.0.0'), { browsers: modernList }))
    .toBeFalsy()

  expect(matchesUA(CustomUserAgentString.SAMSUNG_BROWSER_7_2, { browsers: modernList }))
    .toBeTruthy()
})

it('can interpret various variations in specifying browser names', () => {
  expect(matchesUA(ua.chrome(49), { browsers: ['and_chr >= 49'] }))
    .toBeTruthy()

  expect(matchesUA(ua.safari.iOS('10.3.0'), { browsers: ['ios_saf >= 10.1.0'] }))
    .toBeTruthy()

  expect(matchesUA(ua.firefox.androidPhone('46.0.0'), { browsers: ['FirefoxAndroid >= 41.1.0'] }))
    .toBeTruthy()
})

it('ignorePatch option works correctly', () => {
  expect(matchesUA(ua.firefox('49.0.1'), { browsers: ['ff >= 44'], ignorePatch: false }))
    .toBeFalsy()

  expect(matchesUA(ua.firefox('49.0.1'), { browsers: ['ff >= 44'], ignorePatch: true }))
    .toBeTruthy()

  expect(
    matchesUA(
      ua.firefox('49.1.1'),
      { browsers: ['ff >= 44'], ignorePatch: true, ignoreMinor: false },
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

it('allowHigherVersions works correctly', () => {
  expect(matchesUA(ua.chrome('99'), { browsers: ['chrome >= 60'], allowHigherVersions: false }))
    .toBeFalsy()

  expect(matchesUA(ua.chrome('66'), { browsers: ['chrome >= 60'], allowHigherVersions: true }))
    .toBeTruthy()
})

it('parses semvers liberally', () => {
  expect(
    matchesUA('Opera/9.80 (Windows NT 6.1; U; es-ES) Presto/2.9.181 Version/12.00', { browsers: ['opera >= 12'] }))
    .toBeTruthy()


  expect(
    matchesUA('Opera/9.80 (Windows NT 6.1; U; es-ES) Presto/2.9.181 Version/12.000.1', { browsers: ['opera >= 12'] }))
    .toBeTruthy()

  expect(
    matchesUA('Opera/9.80 (Windows NT 6.1; U; es-ES) Presto/2.9.181 Version/12.0.0001', { browsers: ['opera >= 12'] }))
    .toBeTruthy()

  expect(matchesUA('Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1b2pre) Gecko/20081015 Fennec/55.0a1', { browsers: ['firefox > 50'], allowHigherVersions: false }))
    .toBeTruthy()
})

it('can deal with version ranges (if returned by browserslist)', () => {
  expect(
    matchesUA(ua.safari.iOS('9.1.0'), { browsers: ['ios_saf >= 9'] }))
    .toBeTruthy()

  expect(
    matchesUA(ua.safari.iOS('9.0.0'), { browsers: ['ios_saf >= 9'] }))
    .toBeTruthy()

  // This should fail
  // see https://github.com/browserslist/browserslist/issues/402
  expect(
    matchesUA(ua.safari.iOS('9.1.0'), { browsers: ['ios_saf >= 9.2'] }))
    .toBeTruthy()  // <-- should actually be falsy

})

it('can deal with non-numerical version numbers returned by browserslist for safari technology preview', () => {
  expect(
    matchesUA(ua.safari('13.1.0'), {
      browsers: ['unreleased Safari versions'],
      ignorePatch: true,
      ignoreMinor: true,
      allowHigherVersions: true,
    }))
    .toBeTruthy()
})
