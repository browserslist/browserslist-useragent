# v3.0.0
- **Fix**: Don't crash when `options` parameter is not specified
- **Fix**: Use `loose` option to parse browsers versions. Doesn't crash on versions like `6.00.1` or 6.0.0005` etc.

- **Feature**: Added support for Samsung Internet

- **Breaking**: Safari on desktop and on iOS are now considered as separate browsers. 
You'll need to use separate browserslist queries to target both of them - `['Safari >= 10', 'iOS >= 10.1']`. See #23
- **Breaking**: Removing support for undocumented option to `matchesUA` - `all`. 
This was used internally, and shouldn't be breaking change for you unless you poked around code to discover it.
- **Breaking**: Remove deprecated `_allowHigherVersions` flag. This has been replaced by `allowHigherVersions` in the past.

# v2.0.1
- Remove deprecated _allowHigherVersions option from README

# v2.0.0
- **Feature**: Added Yandex to list of supported browsers
- **Feature**: Added support for Yandex Browser
- **Deprecation**: Deprecated `_allowHigherVersions`

#v1.2.1
- Fixed build link

#v1.2.0
- **Feature**: Updated packages and added support for headless chrome and chromium
- Fixed links in badges

#v1.1.0
- **Feature**: Added support for selecting environment
- Updated browserslist version

#v1.0.4
- delete gitignore

#v1.0.3
- Update README.md

#v1.0.2
- Second try at fixing logo

#v1.0.1
- Updated browserslist version

#v1.0.0
- Create LICENSE
- /browserlist/ => browserslist
- Refactored code and rewrote Readme

#v0.0.2
- Added install instructions
- Initial commit
