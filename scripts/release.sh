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

main() {
  echo "Running release..."

  # Check that denon is installed
  check_for_cmd denon "Used to run scripts and generate release" "https://github.com/denosaurs/denon#install"

  # Check that gh is installed
  check_for_cmd gh "Used to create a release" "https://cli.github.com/"
  echo "$SUCCESS_CHECKMARK Environment meets requirements to generate release"

  # Compile project for various architectures
  denon compile
}

# TODOS
# 1. Compile project for various archiectures x86_64-unknown-linux-gnu, x86_64-pc-windows-msvc, x86_64-apple-darwin, aarch64-apple-darwin
# 2. Move files into /dist folder
# 3. Prompt for tag and release notes
# 4. Check for `gh` and then run `gh release create <tag> ./dist/* -n <notes>`
# 5. Success

main "$@"

