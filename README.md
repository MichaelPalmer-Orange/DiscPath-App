# DiscPath-App

This is an attempt to create a web app based off the single page application of [discpath](http://discpath.haxor.fi/) as I love the functionality of that site, but am always disappointed at how far behind the disc selection is.  The logic and the basic code to draw the paths all come from his single page html5 application, but I am taking that and blowing it out to a React/Redux application that will load the disc data from data files (currently just JSON files) that can be updated independently of rebuilding the site.

The end goal is to have something that looks similar to and functions similar to the original, but with a more robust and expandable set of components, and an easier way to update the existing disc data (possibly even adding an add/update discs capability through the UI).

## For More Information
Visit the [documentation](https://discpath.readme.io/) for all the current features and future projected features.

This is being build using Node.js and can be started by calling:

`npm run start`

Tests have been added and can be run with:

`npm run test`  - runs ALL tests

`npm run test-reducers` - runs just the reducer tests

`npm run test-actions` - runs just the action tests


If interested in collaborating on this project, providing feedback on this project, or general communication on this project, feel free to join the [Slack Workspace](https://join.slack.com/t/discpath/shared_invite/enQtODczMDIzOTI5NTIzLTQ5MjgwZmUzMjA4OWE4MWY5YWFlYjRkYzJjN2Y0Yjk3ZDM1MDBkODViZDQxNjdmNDkwZWViNzZmYzI5MDVmZGI) for this project
