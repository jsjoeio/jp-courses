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

# Source: https://gist.github.com/DarrenN/8c6a5b969481725a4413
get_version() {
  local VERSION=$(cat scripts.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

  echo "$VERSION"
}

main() {
  echo "Running release..."

  # Check that denon is installed
  check_for_cmd denon "Used to run scripts and generate release" "https://github.com/denosaurs/denon#install"

  # Check that gh is installed
  check_for_cmd gh "Used to create a release" "https://cli.github.com/"

  echo "$SUCCESS_CHECKMARK Environment meets requirements to generate release"

  # | xargs will trim any whitespace
  RELEASE_VERSION=$(get_version | xargs)
  read -r -p "Release notes? " RELEASE_NOTES

  # Make sure dist is empty
  denon clean
  # Compile project for various architectures
  denon build

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

