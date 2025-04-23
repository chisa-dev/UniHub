#!/bin/bash

# Script to navigate to parent directory and deploy from there

# Get the absolute path of the current directory 
CURRENT_DIR="$(pwd)"
# Get the parent directory
PARENT_DIR="$(dirname "$CURRENT_DIR")"

echo "Current directory: $CURRENT_DIR"
echo "Parent directory: $PARENT_DIR"

echo "Navigating to the parent directory..."
cd "$PARENT_DIR"

echo "Creating temporary project for deployment..."
echo '{
  "version": 2,
  "builds": [
    {
      "src": "Backend/src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/Backend/src/app.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}' > vercel.json

echo "Linking to existing project..."
npx vercel link --yes --project uni-hub-backend

echo "Setting environment variables..."
# Check if API_URL is already set in Vercel
API_URL=$(npx vercel env ls | grep API_URL || echo "")
if [ -z "$API_URL" ]; then
  echo "Setting API_URL environment variable..."
  npx vercel env add API_URL "https://uni-hub-backend.vercel.app/api"
fi

# Check if FRONTEND_URL is already set in Vercel
FRONTEND_URL=$(npx vercel env ls | grep FRONTEND_URL || echo "")
if [ -z "$FRONTEND_URL" ]; then
  echo "Setting FRONTEND_URL environment variable..."
  npx vercel env add FRONTEND_URL "https://unihub-frontend.vercel.app"
fi

echo "Deploying to production from parent directory..."
npx vercel --prod

echo "Cleaning up..."
rm vercel.json

echo "Navigating back to the original directory..."
cd "$CURRENT_DIR"

echo "Deployment process completed." 