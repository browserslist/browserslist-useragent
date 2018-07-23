# Browserslist Useragent

[![Travis](https://img.shields.io/travis/browserslist/browserslist-useragent.svg)](https://travis-ci.org/pastelsky/browserslist-useragent)
[![npm](https://img.shields.io/npm/v/browserslist-useragent.svg)](https://www.npmjs.com/package/browserslist-useragent)

<img align="right" width="120" height="120"
     src="https://cdn.rawgit.com/pastelsky/browserslist-useragent/master/logo.svg" alt="Browserslist Useragent logo (original by Anton Lovchikov)" />
     

Find if a given user agent string satisfies a [browserslist](https://github.com/ai/browserslist) query. 

It automatically reads the browserslist configuration specified in your project, 
but you can also specify the same using the `options` parameter.

**If you're targeting modern browsers, read [this](#when-querying-for-modern-browsers).**

## Installation
```bash
npm install browserslist-useragent
```

## Usage
```js
const { matchesUA } = require('browserslist-useragent')
matchesUA(userAgentString, options)

// example
matchesUA('Mozilla/5.0 (Windows NT 10.0; rv:54.0) Gecko/20100101 Firefox/54.0', { browsers: ['Firefox > 53']})
// returns true
```

| Option | Default Value | Description |
|--------|---------------|------------ |
| browsers | — | Manually provide a browserslist query (or an array of queries). Specifying this overrides the browserslist configuration specified in your project. |
| env | — | When multiple browserslist [enviroments](https://github.com/ai/browserslist#environments) are specified, pick the config belonging to this environment.|
| ignorePatch | `true` | Ignore differences in patch browser numbers |
| ignoreMinor | `false` | Ignore differences in minor browser versions |
| allowHigherVersions | `false` | For all the browsers in the browserslist query, return a match if the user agent version is equal to or higher than the one specified in browserslist. See [why] this might be useful (#when-querying-for-modern-browsers)

## Supported browsers
 - Chrome (Chrome / Chromium / Yandex)
 - Firefox
 - Safari
 - IE
 - Edge
 
 PRs to add more _browserslist supported_ browsers are welcome 👋
 
## Notes
 - All browsers on iOS (Chrome, Firefox etc) use Safari's WebKit as the underlying engine, and hence will be resolved to Safari. Since `browserslist` is usually used for
  transpiling / autoprefixing for browsers, this behaviour is what's intended in most cases, but might surprise you otherwise.
  
 - Right now, Chrome for Android and Firefox for Android are resolved to their desktop equivalents. The `caniuse` database does not currently store historical data for these browsers separately (except the last version) See [#156](https://github.com/ai/browserslist/issues/156)

## When querying for modern browsers
 - It is a good idea to update this package often so that browser definitions are upto date. 
 - It is also a good idea to add `unreleased versions` to your browserslist query, and set `ignoreMinor` and `ignorePatch` to true so that alpha / beta / canary versions of browsers are matched.
 - In case you're unable to keep this package up-to-date, you can set the `allowHigherVersions` to `true`. For all the browsers specified in your browserslist query, this will return a match if the user agent version is equal to or higher than those specified in your browserslist query. Use this with care though, since it's a wildcard, and only lightly tested. 
