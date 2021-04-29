#!/bin/sh
# shellcheck shell=dash

main() {
  echo "🧹 Cleaning /dist directory"
  pwd
  ls dist
  rm -rf dist/*
}

main "$@"