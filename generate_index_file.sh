#!/bin/bash
{
    echo '// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.'
    echo '// Generated automatically from the TypeScript source files.'
    echo

    find src -name '*.ts' \
        ! -name 'index.ts' \
        ! -name '*.d.ts' \
        ! -path '*/_tests/*' \
        -exec grep -lE '^[[:space:]]*export[[:space:]{]' {} + \
        | sort \
        | sed -e 's|^src/|./|' \
              -e 's|\.ts$|.js|' \
              -e "s|^|export * from '|" \
              -e "s|$|'|"
} > src/index.ts
