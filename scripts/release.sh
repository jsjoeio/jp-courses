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

  echo "$SUCCESS_CHECKMARK Compiled to various architectures"

  read -r -p "What is the release version? " RELEASE_VERSION
  read -r -p "Release notes? " RELEASE_NOTES

  echo "Release version: $RELEASE_VERSION"
  echo "Notes for release: $RELEASE_NOTES"
  read -p "Confirm? [Y/n]" -n 1 -r
  echo    # (optional) move to a new line
  if [[ $REPLY =~ ^[Yy]$ ]]
  then
    echo "doing thing"
      gh release create "$RELEASE_VERSION" ./dist/* -n "$RELEASE_NOTES"
      echo "$SUCCESS_CHECKMARK Successfully released v${RELEASE_VERSION}!"
  fi
}

main "$@"

