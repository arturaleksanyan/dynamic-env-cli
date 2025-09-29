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


#Register with monitoring service
if [ -n "$APP_NAME" ] && [ -n "$SERVICE_NAME" ] && [ -n "$HOST" ] && [ -n "$MONITORING_HOST" ]; then
  CONF=$(cat <<EOF
{
  "app_name": "$APP_NAME",
  "service_name": "$SERVICE_NAME",
  "host": "$HOST"
}
EOF
)

  RESPONSE=$(curl -s -w "
HTTP_CODE:%{http_code}" -X POST "$MONITORING_HOST/api/register"     -H "Content-Type: application/json"     -d "$CONF")

  HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1 | cut -d':' -f2)

  echo "Response Body:"
  echo "$HTTP_BODY"
  echo "HTTP Status Code: $HTTP_CODE"

  touch "healthchecks"
else
  echo "Skipping monitoring registration: missing required env vars."
fi

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
