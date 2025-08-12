#!/bin/bash

# Exit on error
set -e

echo "==> Starting custom build process..."

# Navigate to backend directory
cd backend

# Clean install dependencies
echo "==> Cleaning old dependencies..."
rm -rf node_modules package-lock.json

echo "==> Installing backend dependencies..."
npm install --production

echo "==> Build completed successfully!"