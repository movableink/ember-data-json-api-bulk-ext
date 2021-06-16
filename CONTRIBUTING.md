# How To Contribute

## Installation

- `git clone <repository-url>`
- `cd ember-data-json-api-bulk-ext`
- `yarn install`

## Linting

- `yarn lint:hbs`
- `yarn lint:js`
- `yarn lint:js --fix`

## Running tests

- `ember test` – Runs the test suite on the current Ember version
- `ember test --server` – Runs the test suite in "watch mode"
- `ember try:each` – Runs the test suite against multiple Ember versions

## Running the dummy application

- `ember serve`
- Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## Commit Formatting

Each commit should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) pattern, so that we can use tools that automatically generate a `CHANGELOG` for us.

## Publishing a Version

This project uses `standard-version` to leverage the Git history to find updates since the last version, determine the next version, and generate the `CHANGELOG` for us.

To create a new release, run the following:

```
yarn release --dry-run
```

And make sure that the version number and `CHANGELOG` look correct. Assuming they do, you can run

```
yarn release
git push --follow-tags origin master && npm publish
```

To push your changes to GitHub and `npm`.

Once complete, copy the recent `CHANGELOG` entry into the notes of the new release on GitHub.
