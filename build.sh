
#!/bin/bash
set -e

cd "$(dirname "$0")"

rm -rf ./dist
sh generate_index_file.sh
tsc --project tsconfig.json
