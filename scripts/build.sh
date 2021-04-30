#!/bin/sh

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
    echo "📁 Made folder: $FOLDER"
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
    echo "🆗 chmod'ing file: $FILE"
    # take action on each file. $f store current file name
    chmod +x "$FILE"
  done

  # Zip folder so file permissions are preserved
  # when uploading to GitHub releases
  echo "🤐 Zipping up folder"
  zip -qq -r "$FOLDER".zip "$FOLDER"

  echo "🧹 Removing folder"
  # Delete the folder
  rm -rf "$FOLDER"
}

get_target_os() {
  local OS_NAME="linux"

  # Credit: https://stackoverflow.com/a/18434831/3015595
  case $(uname | tr '[:upper:]' '[:lower:]') in
    linux*)
      OS_NAME="linux"
      ;;
    darwin*)
      OS_NAME="osx"
      ;;
    msys*)
      OS_NAME="windows"
      ;;
    *)
      OS_NAME="notset"
      ;;
  esac

  echo "$OS_NAME"
}

handle_compile_to_target_os() {
  local OS_NAME=$1
  local VERSION=$2

  if [ "$OS_NAME" = "linux" ]; then
    echo "🔍 Detected $OS_NAME-like OS."
    local OS_VERSION="x86_64-unknown-linux-gnu"
    echo "📦 Compiling $OS_VERSION version of project"
    compile_to_os "$OS_VERSION" "$VERSION"
  elif [ "$OS_NAME" = "osx" ]; then
    if [ "$(uname -m)" = 'arm64' ]; then
      echo "🔍 Detected $OS_NAME-like OS."
      local OS_VERSION="aarch64-apple-darwin"
      echo "📦 Compiling $OS_VERSION version of project"
      compile_to_os "aarch64-apple-darwin" "$VERSION"
    else
      echo "🔍 Detected $OS_NAME-like OS."
      local OS_VERSION="x86_64-apple-darwin"
      echo "📦 Compiling $OS_VERSION version of project"
      compile_to_os "x86_64-apple-darwin" "$VERSION"
    fi
  elif [ "$OS_NAME" = "windows" ]; then
    echo "🔍 Detected $OS_NAME-like OS."
    local OS_VERSION="x86_64-pc-windows-msvc"
    echo "📦 Compiling $OS_VERSION version of project"
    compile_to_os "x86_64-pc-windows-msvc" "$VERSION"
  elif [ "$OS_NAME" = "notset" ]; then
    echo "❓ Couldn't determine OS. Assuming linux-like"
    local OS_VERSION="x86_64-unknown-linux-gnu"
    echo "📦 Compiling $OS_VERSION version of project"
    compile_to_os "x86_64-unknown-linux-gnu" "$VERSION"
  else
    echo "❓ Couldn't determine OS. Assuming linux-like"
    local OS_VERSION="x86_64-unknown-linux-gnu"
    echo "📦 Compiling $OS_VERSION version of project"
    compile_to_os "x86_64-unknown-linux-gnu" "$VERSION"
  fi

}

main() {
  # Check for environment requirements
  check_for_cmd denon "Used to run scripts and generate release" "https://github.com/denosaurs/denon#install"
  check_for_cmd jq "Used to parse JSON" "https://stedolan.github.io/jq/download/"
  check_for_cmd zip "Used to create zip" "https://linux.die.net/man/1/zip"
  check_for_cmd mkdir "Used to create a folder" "https://linux.die.net/man/1/mkdir"
  check_for_cmd chmod "Used to give file permissions" "https://linux.die.net/man/1/chmod"

  echo "✅ Environment meets requirements to build project"
  echo "🛠️  Building project"

  # | xargs will trim any whitespace
  VERSION=$(get_version | xargs)

  if [ "$1" = "local" ];
  then
    echo "🚲 Only building for local OS"
    OS_NAME=$(get_target_os)
    handle_compile_to_target_os "$OS_NAME" "$VERSION"
    echo "✅ Built and compiled project"
    exit 0
  fi

  # Compile project for various architectures
  compile_to_os "x86_64-unknown-linux-gnu" "$VERSION"
  compile_to_os "x86_64-pc-windows-msvc" "$VERSION"
  compile_to_os "x86_64-apple-darwin" "$VERSION"
  compile_to_os "aarch64-apple-darwin" "$VERSION"


  echo "✅ Built and compiled project"
}

main "$@"

