#!/bin/bash
rm -r ../lib/* ../dist/*
tsc --build standard/tsconfig.json
python3 aftercare.py
rollup --config standard/rollup.config.mjs ../lib/startSidebar.js --format iife --name "Sidebar" --file ../dist/sidebar-bundle.js
rollup --config standard/rollup.config.mjs ../lib/startPaper.js --format iife --name "Paper" --file ../dist/paper-bundle.js
