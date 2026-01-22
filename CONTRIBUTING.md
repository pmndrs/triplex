# Contributing to Triplex

Thank you for considering a contribution to Triplex! Pull requests, issues and comments are welcome. Everything in Triplex is open source so dive into what you think would be fun to work on!

If you're looking for an issue to work on have a look for the "[Contribution ready](https://github.com/pmndrs/triplex/labels/Contribution%20ready)" labelled issues or reach out on the Poimandres [Discord community](https://discord.gg/mfJJPZ4deK).

## Local Setup

1. Clone this repository `git clone https://github.com/pmndrs/triplex.git`

2. Install [Volta](https://docs.volta.sh/guide/getting-started) and [corepack](https://nodejs.org/api/corepack.html) for managing package manager versions and Node.js. They both automatically use the declared version of Node.js / package manager in the root package.json so you don't have to worry about it.

3. Install dependencies by running `pnpm`.

```bash
➜  pnpm i
Scope: all 38 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date
Done in 2s using pnpm v10.11.0
```

4. You're now ready to start developing!

## Starting Triplex for VS Code

1. Go to the `Run and Debug` panel inside Visual Studio Code
1. Select `Run Triplex for VS Code` from the select menu
1. Hit the play button! You're now running everything.

### Using your own project

You can develop Triplex using your own projects instead of the example packages by opening your projects folder after starting Triplex for VS Code locally.

- `File` > `Open Folder...` > Find and select your projects folder!
