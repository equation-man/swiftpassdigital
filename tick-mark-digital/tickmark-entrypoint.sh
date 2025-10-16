#!/bin/sh

# Exit immediately if a command fails.
set -e

echo "Running sqlx migrations..."
sqlx migrate run

echo "Starting application..."
exec ./tick-mark-digital
