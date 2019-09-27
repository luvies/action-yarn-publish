#!/bin/sh

if [ -z "$(git status -s)" ]; then
  exit 0
else
  exit 1
fi
