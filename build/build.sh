#!/bin/bash
tsc --build tsconfig.json
rollup ../lib/sidebar.js --format iife --name "Sidebar" --file ../dist/sidebar-bundle.js
rollup ../lib/paper.js --format iife --name "Paper" --file ../dist/paper-bundle.js
