#!/usr/bin/env bash

# ls -la
echo "beepbeep boop" > ./scripts/test.txt

git config --global user.email "actions@github.com"
git config --global user.name "Robot Downloader"

git add ./scripts/test.txt
git commit -m "robots doing work"
git push
