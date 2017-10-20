Checks if the given user agent string satisfies a  browserlist query.

## Installation
```bash
npm install browserlist-useragent
```

## Usage
```js
const matchUA = require('browserlist-useragent')
matchUA(userAgentString, browslistQuery, options)
```

## Example
```js
const matchUA = require('browserlist-useragent')
const uaString = 'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'

matchUA(uaString, ['Explorer >= 10'])
// returns true
```

## Options
 - `ignoreMinor` (default: `false`) - Ignore differences in minor browser version
 - `ignorePatch` (default: `true`) - Ignore differences in patch browser versions
 - `allowHigherVersions` (default: `false`) - Returns a match even if the browser version in user agent string is more than those specified in the browserlist query. This option can be helpful when targeting unreleased browsers or browsers for which the `caniuse-lite` database hasn'nt yet been updated.  

 
