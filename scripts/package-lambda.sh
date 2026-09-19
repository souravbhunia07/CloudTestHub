#!/usr/bin/env bash

# Build and package the CloudTestHub Lambda function without relying on OS-specific ZIP tools.

set -e

# Resolve the backend directory relative to this script's location.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../backend" && pwd)"

# Define the Lambda staging directory and output ZIP inside the backend directory.
PACKAGE_DIR="$BACKEND_DIR/lambda-package"
ZIP_FILE="$BACKEND_DIR/lambda.zip"

echo "==> Backend directory: $BACKEND_DIR"

# Move into the backend project so npm uses the correct package.json.
cd "$BACKEND_DIR"

echo "==> Building CloudTestHub..."

# Compile the TypeScript application before packaging it.
npm run build

echo "==> Preparing Lambda package..."

# Remove artifacts from any previous packaging attempt.
rm -rf "$PACKAGE_DIR"
rm -f "$ZIP_FILE"

# Create a clean Lambda staging directory.
mkdir -p "$PACKAGE_DIR"

# Copy the compiled application into the Lambda package.
cp -r dist/src "$PACKAGE_DIR/src"

# Copy the compiled root-level configuration module required by the Lambda source imports.
cp "$BACKEND_DIR/dist/config.js" "$PACKAGE_DIR/config.js"

# Copy runtime dependencies required by the Lambda function.
cp -r node_modules "$PACKAGE_DIR/node_modules"

# Copy package metadata required by the deployed Lambda function.
cp package.json "$PACKAGE_DIR/package.json"

echo "==> Creating Lambda ZIP..."

# Use Node.js instead of the OS-specific zip command to create the deployment archive.
node "$SCRIPT_DIR/create-zip.js" "$PACKAGE_DIR" "$ZIP_FILE"

echo "==> Lambda package created: $ZIP_FILE"