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
  local CLI_VERSION=$2
  local PATH_TO_DIST_DIR="./dist"
  local CLI_NAME="jp-courses"


  denon compile --target "$OS" --quiet --output "$PATH_TO_DIST_DIR/$CLI_NAME-v$CLI_VERSION-$OS" main.ts
}

main() {
  echo "Running release..."

  # Check that denon is installed
  check_for_cmd denon "Used to run scripts and generate release" "https://github.com/denosaurs/denon#install"

  # Check that gh is installed
  check_for_cmd gh "Used to create a release" "https://cli.github.com/"

  echo "$SUCCESS_CHECKMARK Environment meets requirements to generate release"

  read -r -p "What is the release version? " RELEASE_VERSION
  read -r -p "Release notes? " RELEASE_NOTES

  # Compile project for various architectures
  compile_to_os "x86_64-unknown-linux-gnu" "$RELEASE_VERSION"
  compile_to_os "x86_64-pc-windows-msvc" "$RELEASE_VERSION"
  compile_to_os "x86_64-apple-darwin" "$RELEASE_VERSION"
  compile_to_os "aarch64-apple-darwin" "$RELEASE_VERSION"

  # We need to make sure the executables are _actually_ executable
  for FILE in "./dist"; do chmod +x $FILE; done

  echo "$SUCCESS_CHECKMARK Compiled to various architectures"

  echo "Release version: $RELEASE_VERSION"
  echo "Notes for release: $RELEASE_NOTES"
  read -p "Confirm? [Y/n] " -n 1 -r
  echo    # (optional) move to a new line
  if [[ $REPLY =~ ^[Yy]$ ]]
  then
    gh release create "$RELEASE_VERSION" ./dist/* -n "$RELEASE_NOTES"
    echo "$SUCCESS_CHECKMARK Successfully released v${RELEASE_VERSION}!"
  fi
}

main "$@"

