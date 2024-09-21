#!/bin/bash
rm -r ../lib/* ../dist/*
tsc --build tsconfig.json
python3 add-import-extension.py
rollup --config rollup.config.mjs ../lib/extensions/expandables/demo/DemoSidebar.js --format iife --name "Sidebar" --file ../dist/sidebar-bundle.js
rollup --config rollup.config.mjs ../lib/extensions/expandables/demo/DemoPaper.js --format iife --name "Paper" --file ../dist/paper-bundle.js
