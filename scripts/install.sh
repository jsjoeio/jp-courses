#!/bin/sh
# shellcheck shell=dash

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

handle_install_to_target_os() {
    local OS_NAME=$1
    local VERSION=$2

  if [ "$OS_NAME" = "linux" ]; then
    echo "🔍 Detected $OS_NAME-like OS."
    local OS_VERSION="x86_64-unknown-linux-gnu"
    echo "⬇️  Downloading jp-courses from GitHub"
    download_cli "$OS_VERSION" "$VERSION"
  elif [ "$OS_NAME" = "osx" ]; then
    if [ "$(uname -m)" = 'arm64' ]; then
      echo "🔍 Detected $OS_NAME-like OS."
      local OS_VERSION="aarch64-apple-darwin"
      echo "⬇️  Downloading jp-courses from GitHub"
      download_cli "$OS_VERSION" "$VERSION"
    else
      echo "🔍 Detected $OS_NAME-like OS."
      local OS_VERSION="x86_64-apple-darwin"
      echo "⬇️  Downloading jp-courses from GitHub"
      download_cli "$OS_VERSION" "$VERSION"
    fi
  elif [ "$OS_NAME" = "windows" ]; then
    echo "🔍 Detected $OS_NAME-like OS."
    local OS_VERSION="x86_64-pc-windows-msvc"
    echo "⬇️  Downloading jp-courses from GitHub"
    download_cli "$OS_VERSION" "$VERSION"
  elif [ "$OS_NAME" = "notset" ]; then
    echo "❓ Couldn't determine OS. Assuming linux-like"
    local OS_VERSION="x86_64-unknown-linux-gnu"
    echo "⬇️  Downloading jp-courses from GitHub"
    download_cli "$OS_VERSION" "$VERSION"
  else
    echo "❓ Couldn't determine OS. Assuming linux-like"
    local OS_VERSION="x86_64-unknown-linux-gnu"
    echo "⬇️  Downloading jp-courses from GitHub"
    download_cli "$OS_VERSION" "$VERSION"
  fi
}

download_cli() {
  local OS_VERSION=$1
  local CLI_VERSION=$2
  curl -s "https://github.com/jsjoeio/jp-courses-install/releases/download/$CLI_VERSION/jp-courses-v$CLI_VERSION-$OS_VERSION.zip" -L -o jp-courses.zip
}

# Credit: https://gist.github.com/lukechilds/a83e1d7127b78fef38c2914c4ececc3c#gistcomment-2758860
get_latest_release_version() {
  local VERSION=$(curl -fsSLI -o /dev/null -w %{url_effective} https://github.com/jsjoeio/jp-courses-install/releases/latest | sed 's@.*/@@' | xargs)
  echo "$VERSION"
}

main() {
  echo "🔍 Checking local OS"
  OS_NAME=$(get_target_os)
  VERSION=$(get_latest_release_version)

  handle_install_to_target_os "$OS_NAME" "$VERSION"

  # Unzip it
  unzip -qq jp-courses.zip -d jp-courses

  # TODO don't put it inside dist/
  # Make it executable
  chmod +x jp-courses/jp-courses

  # Remove zip
  rm jp-courses.zip

  echo "🎉 Downloaded v$VERSION"
  echo "✅ Complete."
}

main "$@"