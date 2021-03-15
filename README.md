# Show commit approvers on Bitbucket Pull Requests

Bitbucket recently released the new pull request "experience" (read: user interface). Sadly, the feature of commit
approvers was removed from the new UI. This user script utilizes the Bitbucket API to add this feature again.

## Installation

Visit [this page](https://github.com/DBX12/bitbucket-show-approvers/raw/master/bitbucket-show-approvers.user.js) and
your TamperMonkey should prompt you to install the script.

## Configuration

To work with the API, you will need to provide the script with your username and an app password. You can create one
[here][app passwords]. The script needs the scopes `pullrequest` (read) which implies `repository` (read) to work
correctly. The option `bb_displayName` is used to determine if the approval was made by you or someone else (to show the
checkmark in either green or grey). As nick name and display name can be a bit confusing, you see your display name in
the reviewer list in the right side bar.

### Storage Tab

You can configure the script via the script's storage in the tampermonkey dashboard. Unfortunately, the tampermonkey
developers decided that the storage tab may only appear if you configured tampermonkey to use _advanced_ config mode.
There is an illustrated [step-by-step guide] on stackoverflow on how to activate it.

| Setting name    | Description                                                                                                                   |
|:----------------|:------------------------------------------------------------------------------------------------------------------------------|
| bb_displayName  | Determines if the approval was made by you or someone else. If you leave it unset, it shows every approval as grey checkmark. |
| bb_username     | Username required for the login, visible on your [profile settings]                                                           |
| bb_appPassword  | App password for the login, created [here][app passwords]                                                                     |
| activationDelay | Delay in milliseconds before the script attempts to modify the page.                                                          |
| removeEmptyTds  | Adds a call which removes empty `<td>` elements from the table. Defaults to true.                                             |

## Auto-Updates

The script supports auto-updates, however, when you edit a script via the TamperMonkey editor, the auto-update is
deactivated automatically (to preserve your changes). So, if you had to tamper (heh) with the script and now want to
receive updates again, make sure you checked the checkbox "Check for updates" on the script's settings page.

[step-by-step guide]: https://stackoverflow.com/a/56918709/6367716

[profile settings]: https://bitbucket.org/account/settings/

[app passwords]: https://bitbucket.org/account/settings/app-passwords/
