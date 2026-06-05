#!/bin/bash
rm -r ../lib/*
tsc --build standard/tsconfig.json
python3 standard/adjust_import_paths.py
