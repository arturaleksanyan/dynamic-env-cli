#!/bin/sh

TEMP_FILE="/tmp/env_string.txt"
> "$TEMP_FILE"

# Escape environment variables and write to temp file
env | while IFS='=' read -r key value; do
  echo "\${key}>><<\${value}" | sed 's/[&/\]/\\&/g'
done > "$TEMP_FILE"

variables=$(paste -sd '<<>>' "$TEMP_FILE")

# Replace placeholder in JS files
find /usr/share/nginx/html -type f -name "*.js" | while IFS= read -r file; do
  sed -i "s|___ENV-VARIABLES___|$variables|g" "$file"
done

rm -f "$TEMP_FILE"

# Register with monitoring service
if [ -n "$APP_NAME" ] && [ -n "$SERVICE_NAME" ] && [ -n "$HOST" ] && [ -n "$MONITORING_HOST" ]; then
  CONF=$(cat <<EOF
{
  "app_name": "$APP_NAME",
  "service_name": "$SERVICE_NAME",
  "host": "$HOST"
}
EOF
)

  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$MONITORING_HOST/api/register" \
    -H "Content-Type: application/json" \
    -d "$CONF")

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