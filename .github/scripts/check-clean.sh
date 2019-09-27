#!/bin/sh

STATUS=$(git status -s)
if [ -z "$STATUS" ]; then
  echo "Action build up to date"
  exit 0
else
  echo "Action build not up to date"
  echo "$STATUS"
  exit 1
fi
