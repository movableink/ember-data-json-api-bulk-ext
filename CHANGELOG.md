# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/movableink/ember-data-json-api-bulk-ext/compare/v1.0.0...v2.0.0) (2021-06-17)

### ⚠ BREAKING CHANGES

- Support for Node 10 is no longer claimed. In practice, the tests were never run against Node 10, but now we don't claim support to support it, either. Tests are run against Node 12 and should work with later versions without issue, too, since there's nothing Node-specific going on in this package.
- Support is no longer guaranteed for Ember versions below the latest LTS, 3.24. The package will probably still work, but tests are not run against versions older than this.

### Features

- add bulk update & add bulk update tests ([ba3eadd](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/ba3eaddfa40472de0501dc16316379fcf667e82f))
- allow for providing custom adapter options ([228c024](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/228c0245ad3879da8c3a3ad3df281346bb19d3b7))
- optionally send correct MIME type on requests ([68beaa7](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/68beaa7e8c395efb833f25545a5873ee77e2ef37))
- support `bulkDestroy` and `bulkDelete` ([1c83bd0](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/1c83bd04e13880cad49b0f5ac5c7d91f5f411f90))
- support `bulkSave` to create and delete ([4966070](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/496607002bce7e5e1578944862219ada70ca8b61))

### Bug Fixes

- avoid choking on an empty array ([21a927a](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/21a927a76b552a990ddb0a2a81ffaf3d97f3a8fa))
- remove debbuger ([6d87bf3](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/6d87bf38f8c7c7dffb2c1572058c43982a5f8d13))
- run lint ([020b010](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/020b0106527028bb887e5fe8e010c7b156810231))

- bump stated Node.js support policy ([d6d8567](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/d6d85672b7dd6c2f9bff76a6914e61a5b63915cf))
- run tests on Ember 3.24+ ([2ef40fc](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/2ef40fc3c7f5be487cc5bc72bf6108bdb51a3017))

## [1.1.0](https://github.com/movableink/ember-data-json-api-bulk-ext/compare/v1.0.0...v1.1.0) (2020-03-20)

### Features

- optionally send correct MIME type on requests ([68beaa7](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/68beaa7e8c395efb833f25545a5873ee77e2ef37))

## 1.0.0 (2020-03-19)

### Features

- support bulk create ([df4f143](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/df4f1439fe5a462fdfc4ca5f0bef70ecd48089e5))

### Bug Fixes

- relocate `ember-cli-htmlbars` to dev dependencies ([cb63198](https://github.com/movableink/ember-data-json-api-bulk-ext/commit/cb631987e8edd9c02148add54ad9e4a150b41e6c))
