#!/bin/bash

# This script deploys the UniHub backend to Vercel

# Ensure we're in the Backend directory
cd "$(dirname "$0")"

# Clear npm cache (can help with deployment issues)
echo "Clearing npm cache..."
npm cache clean --force

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel --prod

echo "Deployment complete! Check the Vercel dashboard for details."
echo "Don't forget to set your environment variables in the Vercel dashboard."