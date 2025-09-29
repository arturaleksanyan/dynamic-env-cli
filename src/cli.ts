#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config();



let targetPath = '';

// Bash script string
const sh = `#!/bin/sh

TEMP_FILE="/tmp/env_string.txt"
> "$TEMP_FILE"

env | while IFS='=' read -r key value; do
    echo "\${key}>><<\${value}" >> "$TEMP_FILE"
done

variables=$(awk '{printf "%s<<>>", $0}' "$TEMP_FILE")
variables=\${variables%<<>>}

# Replace ONLY the single occurrence (avoid recursion)
find /usr/share/nginx/html -type f -name "*.js" | while IFS= read -r file; do
    sed -i "s|___ENV-VARIABLES___|$variables|" "$file"
done

rm -f "$TEMP_FILE"


# Handle arguments
for arg in "$@"; do
  case $arg in
    --nginx)
      echo "Running nginx..."
      nginx -g 'daemon off;'
      ;;
    *)
      echo "Unknown argument: $arg"
      ;;
  esac
done
`;
const rootPath = process.cwd();

const buildPath = path.join(rootPath, 'build');
const distPath = path.join(rootPath, 'dist');


if (fs.existsSync(buildPath)) {
  targetPath = path.join(buildPath, 'run.sh');
} else if (fs.existsSync(distPath)) {
  targetPath = path.join(distPath, 'run.sh');
} else {
  throw new Error('No build or dist folder found');
}

fs.writeFileSync(targetPath, sh, { mode: 0o755 }); // Add executable permission

console.log(`✅ run.sh created at ${targetPath}`);
