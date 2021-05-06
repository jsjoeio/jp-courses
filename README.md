# jp-courses-install

Lil CLI for my courses written in Deno.

## Quickstart

To get started, run the install script which will download the project into a directory called `jp-courses`:

```sh
curl -fsSL https://raw.githubusercontent.com/jsjoeio/jp-courses-install/main/scripts/install.sh | sh

cd jp-courses

./jp-courses --help
```


### Download Manually

1. Go to [Releases](https://github.com/jsjoeio/jp-courses-install/releases)
2. Download for your OS (aarch64-apple-darwin is for macOS with M1)
3. Unzip
4. `chmod +x jp-courses`
5. Run `--help` or `--dryRun` to get started

## Permissions

This CLI uses the following permissions:
- `--allow-net`: allow network access
  - the CLI sends a request to joeprevite.com to verify your purchase, then it downloads the course zip file from raw.githubusercontent.com. We also serve the course content on localhost:3000
- `--allow-write`
  - We unzip the course to your current directory (where you call the CLI).
- `--allow-read`: allow file system read access
  - Once we've downloaded the course as a zip to the system, we then need this to read the file and unzip it. We also need it to serve the course files on the course server which runs on localhost:3000
- `--allow-env`
  - When the CLI is used in dry run mode, we add an environment variable called `DRY_RUN` and set it to "0".
- `--unstable`
  - The CLI uses unstable Deno features so we must use this.

Read more about Deno's permissions list [here](https://deno.land/manual@v1.9.2/getting_started/permissions#permissions-list).

## Local Development

## Scripts

This project uses [`denon`](https://github.com/denosaurs/denon) to manage scripts. See [`scripts.json`](./scripts.json)

### `start`

Starts the course on http://localhost:3000. Note: this will fail if there is not a directory with `/content` at the root.
### `download`

Runs the script with a valid payment ID to download the course.

### `help`

Runs the script with the `--help` flag.

### `test`

Runs all the tests.
```sh
denon test
```

### `unit`

Runs only the `tests/unit.test.ts`

### `integration`

Runs only the `tests/integration.test.ts`

### `e2e`

Runs only the `tests/e2e.test.ts`

## Release

To generate a new release, follow these steps:

1. Bump version in `scripts.json`
2. Commit and push to remote
3. Run `denon release`
4. Type in release notes
5. Press Enter