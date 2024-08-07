# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9] - 2024-07-08
### Fixed
- Approvers do not appear when returning to commits view after visiting it once
- Approvers do not appear when returning to commits view when starting the visit on the commits tab

## [0.8] - 2024-05-29
### Added
- Setting `decorateDelay`. This setting determines how long the script waits
before it starts adding buttons on the commit tab

### Changed
- Default value for `activationDelay` is now 1000. It is recommended to update
  your settings accordingly to avoid unnecessary long waiting.

## [0.7] - 2023-02-24
### Added
- This changelog
- Column header for the approvals

### Fixed
- Script no longer adds multiple cells containing the approvers

## [0.6] - 2022-09-29
### Added
- "Load all commits" and "Stop loading commits" buttons

## [0.5] - 2021-11-16
### Fixed
- Update button

## [0.4] - 2021-04-08
### Added
- Functionality and configuration option `debugOutput`
- Refresh button

## [0.3] - 2021-03-15
### Added
- Feature "remove empty table cells"
- Feature and configuration option `activationDelay`
- Documentation for configuration and auto-update

### Fixed
- Script no longer adds multiple `colgroup` elements

## [0.2] - 2021-02-24
### Added
- Installation instructions
- Tampermonkey annotation declaring connection to bitbucket.org

### Changed
- Disabled request caching

## [0.1] - 2021-02-24
### Added
- Initial version

[Unreleased]: https://github.com/DBX12/bitbucket-show-approvers/compare/0.9...HEAD
[0.9]: https://github.com/DBX12/bitbucket-show-approvers/compare/0.8...0.9
[0.8]: https://github.com/DBX12/bitbucket-show-approvers/compare/0.7...0.8
[0.7]: https://github.com/DBX12/bitbucket-show-approvers/compare/0.6...0.7
[0.6]: https://github.com/DBX12/bitbucket-show-approvers/compare/0.5...0.6
[0.5]: https://github.com/DBX12/bitbucket-show-approvers/compare/0.4...0.5
[0.4]: https://github.com/DBX12/bitbucket-show-approvers/compare/0.3...0.4
[0.3]: https://github.com/DBX12/bitbucket-show-approvers/compare/0.2...0.3
[0.2]: https://github.com/DBX12/bitbucket-show-approvers/compare/0.1...0.2
[0.1]: https://github.com/DBX12/bitbucket-show-approvers/releases/tag/0.1
