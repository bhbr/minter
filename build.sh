
#!/bin/bash
set -e

cd "$(dirname "$0")"

rm -rf ./dist
tsc --project tsconfig.json

