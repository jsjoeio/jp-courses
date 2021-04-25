#!/bin/sh

SUCCESS_CHECKMARK=$(printf '\342\234\224\n' | iconv -f UTF-8)
CROSS_MARK=$(printf '\342\235\214\n' | iconv -f UTF-8)

set -eu

main() {
  echo "Running release..."
  pwd
}

# TODOS
# 1. Compile project for various archiectures x86_64-unknown-linux-gnu, x86_64-pc-windows-msvc, x86_64-apple-darwin, aarch64-apple-darwin
# 2. Move files into /dist folder
# 3. Prompt for tag and release notes
# 4. Check for `gh` and then run `gh release create <tag> ./dist/* -n <notes>`
# 5. Success

main "$@"