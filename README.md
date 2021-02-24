# Show commit approvers on Bitbucket Pull Requests

Bitbucket recently released the new pull request "experience" (read: user interface). Sadly, the feature of commit
approvers was removed from the new UI. This user script utilizes the Bitbucket API to add this feature again.

## Installation

Visit [this page](https://github.com/DBX12/bitbucket-show-approvers/raw/master/bitbucket-show-approvers.user.js) and your
TamperMonkey should prompt you to install the script.

## Configuration

To work with the API, you will need to provide the script with your username and an app password. You can create one
[here](https://bitbucket.org/account/settings/app-passwords/). The script needs the scopes `pullrequest` (read) which
implies `repository` (read) to work correctly. The option `bb_displayName` is used to determine if the approval was made
by you or someone else (to show the checkmark in either green or grey). As nick name and display name can be a bit
confusing, you see your display name in the reviewer list in the right side bar.
