#!/usr/bin/env bash

git config --global user.email "actions@github.com"
git config --global user.name "Robot Downloader"

curl -0 https://interactives.ap.org/delegate-tracker/live-data/delegates.json > ./data.json

git add ./data.json
git commit -m "GithubAction :: fetch new version of AP Delegate Data"
git push
