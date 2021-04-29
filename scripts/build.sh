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

# This function does three things
# 1. compiles CLI to target OS
# 2. makes file executable
# 3. zips up folder
compile_to_os() {
  local OS=$1
  local CLI_VERSION=$2
  local PATH_TO_DIST_DIR="./dist"
  local CLI_NAME="jp-courses"
  local FOLDER="$PATH_TO_DIST_DIR/$CLI_NAME-v$CLI_VERSION-$OS"
  local OUTPUT_PATH="$FOLDER/$CLI_NAME"

  # If folder doesn't exist, make it
  if [ ! -d "$FOLDER" ];
  then
    mkdir -p "$FOLDER"
    echo "Made folder: $FOLDER"
  fi

  denon compile --target "$OS" --quiet --output "$OUTPUT_PATH" main.ts

  # Make file executable
  # We loop because we don't know the direct file path
  # i.e. Windows has .exe but mac doesn't
  # By quoting it, we read the folder name right, but our loop
  # only runs once.
  # that's
  # shellcheck disable=SC2066
  for FILE in "$FOLDER"
  do
    echo "chmod'ing file: $FILE"
    # take action on each file. $f store current file name
    chmod +x "$FILE"
  done

  # Zip folder so file permissions are preserved
  # when uploading to GitHub releases
  zip -r "$FOLDER".zip "$FOLDER"

  # Delete the folder
  rm -rf "$FOLDER"
}

main() {
  echo "Running release..."

  # Check for environment requirements
  check_for_cmd denon "Used to run scripts and generate release" "https://github.com/denosaurs/denon#install"
  check_for_cmd jq "Used to parse JSON" "https://stedolan.github.io/jq/download/"

  echo "$SUCCESS_CHECKMARK Environment meets requirements to build project"

  # | xargs will trim any whitespace
  VERSION=$(get_version | xargs)

  # Compile project for various architectures
  compile_to_os "x86_64-unknown-linux-gnu" "$VERSION"
  compile_to_os "x86_64-pc-windows-msvc" "$VERSION"
  compile_to_os "x86_64-apple-darwin" "$VERSION"
  compile_to_os "aarch64-apple-darwin" "$VERSION"


  echo "$SUCCESS_CHECKMARK Built and compiled project"
}

main "$@"

