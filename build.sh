#!/bin/bash

# Exit on error
set -e

echo "==> Starting custom build process..."

# Build frontend first
echo "==> Building frontend..."
cd frontend

# Clean install frontend dependencies
echo "==> Cleaning frontend dependencies..."
rm -rf node_modules package-lock.json

echo "==> Installing frontend dependencies..."
npm install

echo "==> Building frontend for production..."
npm run build

# Navigate back to root and then to backend
cd ../backend

# Clean install backend dependencies
echo "==> Cleaning backend dependencies..."
rm -rf node_modules package-lock.json

echo "==> Installing backend dependencies..."
npm install --production

echo "==> Build completed successfully!"