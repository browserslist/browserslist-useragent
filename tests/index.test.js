const userAgents = {
  SAFARI_IOS: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/603.1.23 (KHTML, like Gecko) Version/10.0 Mobile/14E5239e Safari/602.1',
  SAFARI_IOS_9: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X) AppleWebKit/603.1.23 (KHTML, like Gecko) Version/10.0 Mobile/14E5239e Safari/602.1',
  SAFARI_IOS_WEBVIEW: 'User-Agent: Mozilla/5.0 (iPad; U; CPU OS 4_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Mobile',

  ANDROID_WEBVIEW_OLD: 'Mozilla/5.0 (Linux; U; Android 4.1.1; en-gb; Build/KLP) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30',
  ANDROID_CHROME_WEBVIEW_OLD: 'Mozilla/5.0 (Linux; Android 4.4; Nexus 5 Build/_BuildID_) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36',
  ANDROID_CHROME_WEBVIEW_NEW: 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36',
  ANDROID_CHROME_57: 'Mozilla/5.0 (Linux; Android 7.1.1; Moto E (4) Plus Build/NDR26.58-21) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.132 Mobile Safari/537.36',
  ANDROID_CHROME_64: 'Mozilla/5.0 (Linux; Android 7.1.1; Moto E (4) Plus Build/NDR26.58-21) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.2987.132 Mobile Safari/537.36',
  CHROME_DESKTOP: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
  CHROME_IOS: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1',

  IE: 'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko',
  IE_MOBILE: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; HTC; Windows Phone 8X by HTC)',
  EDGE: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393',

  FIREFOX_MOBILE_ANDROID: 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0',
  FIREFOX_MOBILE_ANDROID_52: 'Mozilla/5.0 (Android 4.4.2; Mobile; rv:52.0) Gecko/52.0 Firefox/52.0',
  FIREFOX_MOBILE_IOS: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4',
  FIRFOX_DESKTOP: 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:10.0) Gecko/20100101 Firefox/10.0',
}

const { resolveUserAgent, matchesUA } = require('../index')

it('resolves all browsers in iOS to safari with correct platform version', () => {
  expect(resolveUserAgent(userAgents.CHROME_IOS))
    .toEqual({
      family: 'iOS',
      version: '10.3.0',
    })

  expect(resolveUserAgent(userAgents.SAFARI_IOS))
    .toEqual({
      family: 'iOS',
      version: '10.3.0',
    })

  expect(resolveUserAgent(userAgents.SAFARI_IOS_WEBVIEW))
    .toEqual({
      family: 'iOS',
      version: '4.3.0',
    })

  expect(resolveUserAgent(userAgents.FIREFOX_MOBILE_IOS))
    .toEqual({
      family: 'iOS',
      version: '8.3.0',
    })
})

it('resolves IE/Edge properly', () => {
  expect(resolveUserAgent(userAgents.IE))
    .toEqual({
      family: 'Explorer',
      version: '11.0.0',
    })

  expect(resolveUserAgent(userAgents.IE_MOBILE))
    .toEqual({
      family: 'ExplorerMobile',
      version: '10.0.0',
    })


  expect(resolveUserAgent(userAgents.EDGE))
    .toEqual({
      family: 'Edge',
      version: '14.14393.0',
    })
})

it('resolves chrome properly', () => {
  expect(resolveUserAgent(userAgents.CHROME_DESKTOP))
    .toEqual({
      family: 'Chrome',
      version: '41.0.2228',
    })

  expect(resolveUserAgent(userAgents.ANDROID_CHROME_WEBVIEW_NEW))
    .toEqual({
      family: 'Chrome',
      version: '43.0.2357',
    })

  expect(resolveUserAgent(userAgents.ANDROID_CHROME_WEBVIEW_OLD))
    .toEqual({
      family: 'Chrome',
      version: '30.0.0',
    })

  expect(resolveUserAgent(userAgents.ANDROID_WEBVIEW_OLD))
    .toEqual({
      family: 'Android',
      version: '4.1.1',
    })
})


it('resolves firefox properly', () => {
  expect(resolveUserAgent(userAgents.FIREFOX_MOBILE_ANDROID))
    .toEqual({
      family: 'Firefox',
      version: '41.0.0',
    })

  expect(resolveUserAgent(userAgents.FIRFOX_DESKTOP))
    .toEqual({
      family: 'Firefox',
      version: '10.0.0',
    })
})

it('detects if browserlist matches UA', () => {
  expect(matchesUA(userAgents.FIREFOX_MOBILE_ANDROID, ['Firefox >= 40']))
    .toBeTruthy()

  expect(matchesUA(userAgents.FIRFOX_DESKTOP, ['Firefox >= 10.0.0']))
    .toBeTruthy()

  expect(matchesUA(userAgents.CHROME_IOS, ['iOS >= 10.3.0']))
    .toBeTruthy()

  expect(matchesUA(userAgents.SAFARI_IOS, ['iOS >= 10.3.0']))
    .toBeTruthy()

  const modernList = [
    "Firefox >= 53",
    "Edge >= 15",
    "Chrome >= 58",
    "iOS >= 10",
  ]

  expect(matchesUA(userAgents.SAFARI_IOS_9, modernList))
    .toBeFalsy()

  expect(matchesUA(userAgents.ANDROID_CHROME_57, modernList))
    .toBeFalsy()

  expect(matchesUA(userAgents.FIREFOX_MOBILE_ANDROID_52, modernList))
    .toBeFalsy()

  expect(matchesUA(userAgents.EDGE, modernList))
    .toBeFalsy()

  expect(matchesUA(userAgents.ANDROID_CHROME_64, modernList, { allowHigherVersions: true }))
    .toBeTruthy()
})