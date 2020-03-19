#!/usr/bin/env bash

# ls -la
echo "test" > ./scripts/test.txt
git add ./scripts/test.txt
git commit -m "robots doing work"
git push
