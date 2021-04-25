# jp-courses-install

Lil CLI for my courses written in Deno.

## Permissions

This CLI uses the following permissions:
- `--allow-net`: allow network access
  - the CLI sends a request to joeprevite.com to verify your purchase, then it downloads the course zip file from github.com.
- `--allow-write`
  - We unzip the course to your current directory (where you call the CLI).
- `--allow-read`: allow file system read access
  - Once we've downloaded the course as a zip to the system, we then need this to read the file and unzip it.
- `--allow-env`
  - When the CLI is used in dry run mode, we add an environment variable called `DRY_RUN` and set it to "0".
- `--unstable`
  - The CLI uses unstable Deno features so we must use this.

Read more about Deno's permissions list [here](https://deno.land/manual@v1.9.2/getting_started/permissions#permissions-list).

## Local Development

## Scripts

This project uses [`denon`](https://github.com/denosaurs/denon) to manage scripts. See [`scripts.json`](./scripts.json)

### `start`

Runs the script with a valid payment ID.

### `help`

Runs the script with the `--help` flag.

### `test`

To run the tests:
```sh
denon test
```