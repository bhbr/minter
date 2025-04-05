#!/bin/bash
rm -r ../lib/*
tsc --build tests/tsconfig.json
python3 aftercare.py