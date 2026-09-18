#!/usr/bin/env bash
# Start production build with all env vars from .env
set -a
source "$(dirname "$0")/.env"
set +a
exec node "$(dirname "$0")/.output/server/index.mjs"
