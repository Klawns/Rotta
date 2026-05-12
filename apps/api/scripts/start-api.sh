#!/bin/sh
set -eu

RCLONE_CONFIG_FILE_PATH="${RCLONE_CONFIG_FILE:-/tmp/rclone/rclone.conf}"

if [ -n "${RCLONE_CONFIG_CONTENT_BASE64:-}" ]; then
  config_dir="$(dirname "$RCLONE_CONFIG_FILE_PATH")"
  mkdir -p "$config_dir"
  chmod 700 "$config_dir"
  printf '%s' "$RCLONE_CONFIG_CONTENT_BASE64" | base64 -d > "$RCLONE_CONFIG_FILE_PATH"
  chmod 600 "$RCLONE_CONFIG_FILE_PATH"
  export RCLONE_CONFIG_FILE="$RCLONE_CONFIG_FILE_PATH"
fi

exec node apps/api/dist/main.js
