#!/bin/bash
tsc --build tsconfig.json
python3 add-import-extension.py
rollup ../lib/sidebar.js --format iife --name "Sidebar" --file ../dist/sidebar-bundle.js
rollup ../lib/paper.js --format iife --name "Paper" --file ../dist/paper-bundle.js
