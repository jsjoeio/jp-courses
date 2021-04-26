#!/bin/sh

SUCCESS_CHECKMARK=$(printf '\342\234\224\n' | iconv -f UTF-8)
CROSS_MARK=$(printf '\342\235\214\n' | iconv -f UTF-8)

set -eu

check_for_cmd() {
  local cmd=$1
  local description=$2
  local install_link=$3

  if ! command -v $cmd &>/dev/null; then
    echo "$cmd could not be found."
    echo "$description"
    echo "Install here: $install_link"
    exit 1
  fi
}

compile_to_os() {
  local OS=$1
  local PATH_TO_OS_DIR="./dist/$OS"
  local CLI_NAME="jp-courses"

  mkdir -p "$PATH_TO_OS_DIR"

  denon compile --target "$OS" --quiet --output "$PATH_TO_OS_DIR/$CLI_NAME" main.ts
}

main() {
  echo "Running release..."

  # Check that denon is installed
  check_for_cmd denon "Used to run scripts and generate release" "https://github.com/denosaurs/denon#install"

  # Check that gh is installed
  check_for_cmd gh "Used to create a release" "https://cli.github.com/"

  # Check for mkdir
  check_for_cmd mkdir "Used to create directories" "https://linux.die.net/man/1/mkdir"

  echo "$SUCCESS_CHECKMARK Environment meets requirements to generate release"

  # Compile project for various architectures
  compile_to_os "x86_64-unknown-linux-gnu"
  compile_to_os "x86_64-pc-windows-msvc"
  compile_to_os "x86_64-apple-darwin"
  compile_to_os "aarch64-apple-darwin"

  echo "$SUCCESS_CHECKMARK Compiled CLI to various architectures"
}

# TODOS
# 3. Prompt for tag and release notes
# 4. Check for `gh` and then run `gh release create <tag> ./dist/* -n <notes>`
# 5. Success

main "$@"

