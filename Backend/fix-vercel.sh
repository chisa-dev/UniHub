#!/bin/bash

# This script fixes the Vercel deployment for uni-hub-backend

echo "Removing current Vercel project link..."
rm -rf .vercel

echo "Linking to existing project (uni-hub-backend)..."
npx vercel link --yes --project uni-hub-backend

# Create a temporary vercel.json that expliclty sets the root to .
echo "Creating temporary vercel configuration..."
cat > vercel.tmp.json << EOL
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOL

echo "Deploying to production with explicit root..."
npx vercel --prod --yes --cwd=.

# Restore original vercel.json
echo "Cleaning up..."
rm vercel.tmp.json

echo "Deployment process completed." 