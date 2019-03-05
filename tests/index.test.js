const ua = require('useragent-generator')

const { resolveUserAgent, matchesUA, normalizeQuery } = require('../index')

const CustomUserAgentString = {
  YANDEX: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 YaBrowser/18.1.1.839 Yowser/2.5 Safari/537.36",
  SAMSUNG_BROWSER_7_2: "Mozilla/5.0 (Linux; Android 6.0.1; SAMSUNG SM-N930F Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/7.2 Chrome/63.0.3239.111 Mobile Safari/537.36",
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

it('resolves bots properly', () => {
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.1.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Googlebot-News/2.1; +http://www.google.com/bot.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.1.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Googlebot-Image/1.0; +http://www.google.com/bot.html)"))
    .toEqual({
      family: 'Bot',
      version: '1.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Googlebot-Video/1.0; +http://www.google.com/bot.html)"))
    .toEqual({
      family: 'Bot',
      version: '1.0.0'
    })
  expect(resolveUserAgent("SAMSUNG-SGH-E250/1.0 Profile/MIDP-2.0 Configuration/CLDC-1.1 UP.Browser/6.2.3.3.c.1.101 (GUI) MMP/2.0 (compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.1.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.1.0'
    })
  expect(resolveUserAgent("(compatible; Mediapartners-Google/2.1; +http://www.google.com/bot.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.1.0'
    })
  expect(resolveUserAgent("Mediapartners-Google"))
    .toEqual({
      family: 'Bot',
      version: '0.0.0'
    })
  expect(resolveUserAgent("AdsBot-Google (+http://www.google.com/adsbot.html)"))
    .toEqual({
      family: 'Bot',
      version: '0.0.0'
    })
  expect(resolveUserAgent("AdsBot-Google-Mobile-Apps"))
    .toEqual({
      family: 'Bot',
      version: '0.0.0'
    })
  expect(resolveUserAgent("Google (+https://developers.google.com/+/web/snippet/)"))
    .toEqual({
      family: 'Bot',
      version: '0.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)"))
    .toEqual({
      family: 'Bot',
      version: '0.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)"))
    .toEqual({
      family: 'Bot',
      version: '0.0.0'
    })
  expect(resolveUserAgent("DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)"))
    .toEqual({
      family: 'Bot',
      version: '1.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Baiduspider-image/2.0; +http://www.baidu.com/search/spider.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Baiduspider-video/2.0; +http://www.baidu.com/search/spider.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Baiduspider-news/2.0; +http://www.baidu.com/search/spider.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Baiduspider-favo/2.0; +http://www.baidu.com/search/spider.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Baiduspider-cpro/2.0; +http://www.baidu.com/search/spider.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Baiduspider-ads/2.0; +http://www.baidu.com/search/spider.html)"))
    .toEqual({
      family: 'Bot',
      version: '2.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)"))
    .toEqual({
      family: 'Bot',
      version: '3.0.0'
    })
  expect(resolveUserAgent("Sogou Pic Spider/3.0( http://www.sogou.com/docs/help/webmasters.htm#07)"))
    .toEqual({
      family: 'Bot',
      version: '3.0.0'
    })
  expect(resolveUserAgent("Sogou head spider/3.0( http://www.sogou.com/docs/help/webmasters.htm#07)"))
    .toEqual({
      family: 'Bot',
      version: '3.0.0'
    })
  expect(resolveUserAgent("Sogou web spider/4.0(+http://www.sogou.com/docs/help/webmasters.htm#07)"))
    .toEqual({
      family: 'Bot',
      version: '4.0.0'
    })
  expect(resolveUserAgent("Sogou Orion spider/3.0( http://www.sogou.com/docs/help/webmasters.htm#07)"))
    .toEqual({
      family: 'Bot',
      version: '3.0.0'
    })
  expect(resolveUserAgent("Sogou-Test-Spider/4.0 (compatible; MSIE 5.5; Windows 98)"))
    .toEqual({
      family: 'Bot',
      version: '4.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Konqueror/3.5; Linux) KHTML/3.5.5 (like Gecko) (Exabot-Thumbnails)"))
    .toEqual({
      family: 'Bot',
      version: '0.0.0'
    })
  expect(resolveUserAgent("Mozilla/5.0 (compatible; Exabot/3.0; +http://www.exabot.com/go/robot)"))
    .toEqual({
      family: 'Bot',
      version: '3.0.0'
    })
  expect(resolveUserAgent("facebot"))
    .toEqual({
      family: 'Bot',
      version: '0.0.0'
    })
  expect(resolveUserAgent("facebookexternalhit/1.0 (+http://www.facebook.com/externalhit_uatext.php)"))
    .toEqual({
      family: 'Bot',
      version: '1.0.0'
    })
  expect(resolveUserAgent("facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"))
    .toEqual({
      family: 'Bot',
      version: '1.1.0'
    })
  expect(resolveUserAgent("ia_archiver (+http://www.alexa.com/site/help/webmasters; crawler@alexa.com)"))
    .toEqual({
      family: 'Bot',
      version: '0.0.0'
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
    "Firefox >= 53",
    "Edge >= 15",
    "Chrome >= 58",
    "iOS >= 10",
    "Safari >= 11",
    "Samsung >= 7"
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

it('allowBots works correctly', () => {
  expect(matchesUA("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"))
    .toBeFalsy();
  expect(matchesUA(ua.chrome('59'), { browsers: ['chrome >= 60'] }))
    .toBeFalsy();
  expect(matchesUA(ua.chrome('66'), { browsers: ['chrome >= 60'] }))
    .toBeTruthy();
  expect(matchesUA("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", { allowBots: false }))
    .toBeFalsy();
  expect(matchesUA(ua.chrome('59'), { browsers: ['chrome >= 60'], allowBots: false }))
    .toBeFalsy();
  expect(matchesUA(ua.chrome('66'), { browsers: ['chrome >= 60'], allowBots: false }))
    .toBeTruthy();
  expect(matchesUA("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", { allowBots: true }))
    .toBeTruthy();
  expect(matchesUA(ua.chrome('66'), { browsers: ['chrome >= 60'], allowBots: true }))
    .toBeTruthy();
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
})
