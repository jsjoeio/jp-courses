#!/bin/sh
# shellcheck shell=dash

main() {
  echo "⬇️ Downloading jp-courses tool"

  # TODO check local OS

  # Download latest release from GitHub
  # TODO write function to get latest release then update URL
  curl https://github.com/jsjoeio/jp-courses-install/releases/download/0.0.3/jp-courses-v0.0.3-x86_64-apple-darwin.zip -L -o jp-courses.zip

  # Unzip it
  unzip jp-courses.zip

  # Make it executable
  chmod +x dist/jp-courses-v0.0.3-x86_64-apple-darwin/jp-courses

  # Remove zip
  rm jp-courses.zip

  echo "✅ Complete"
}

main "$@"