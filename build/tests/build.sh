#!/bin/bash
rm -r ../lib/* ../dist/*
tsc --build tests/tsconfig.json
python3 aftercare.py
rollup --config tests/rollup.config.mjs ../lib/core/_tests/all-tests.js --format iife --name "tests" --file ../dist/tests-bundle.js
