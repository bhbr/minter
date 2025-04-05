#!/bin/bash
rm -r ../lib/*
tsc --build standard/tsconfig.json
python3 aftercare.py
