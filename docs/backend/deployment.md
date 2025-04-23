# Backend Deployment

This document provides detailed instructions for deploying the UniHub backend to Vercel.

## Prerequisites

Before deploying the backend, ensure you have:

1. A [Vercel account](https://vercel.com/signup)
2. The [Vercel CLI](https://vercel.com/docs/cli) installed (`npm install -g vercel`)
3. A cloud MySQL database (such as [PlanetScale](https://planetscale.com/), [AWS RDS](https://aws.amazon.com/rds/), etc.)
4. Your environment variables ready (see [Environment Variables](../setup/environment-variables.md))

## Deployment Options

### Option 1: Deployment via Vercel Dashboard (GitHub Integration)

1. **Connect your GitHub repository to Vercel**:
   - Go to the [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." > "Project"
   - Select your GitHub repository
   - Select the Backend directory as the project root

2. **Configure the project**:
   - **Framework Preset**: Select "Other"
   - **Root Directory**: Set to the Backend directory path
   - **Build Command**: `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

3. **Set environment variables**:
   - Add all required environment variables (see [Environment Variables](../setup/environment-variables.md))
   - Be sure to set `NODE_ENV` to `production`

4. **Deploy the project**:
   - Click "Deploy"
   - Wait for the deployment to complete

### Option 2: Deployment via Vercel CLI (Recommended)

1. **Navigate to the Backend directory**:
   ```bash
   cd /path/to/UniHub/Backend
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Use the deployment script**:
   ```bash
   # Make the script executable if needed
   chmod +x vercel-deploy.sh
   
   # Run the deployment script
   ./vercel-deploy.sh
   ```

   The `vercel-deploy.sh` script handles:
   - Navigating to the correct directory
   - Creating the proper vercel.json configuration
   - Linking to the existing project
   - Setting up essential environment variables
   - Deploying to production

4. **Set additional environment variables**:
   - After deployment, set any additional environment variables through the Vercel dashboard
   - Go to your project settings > Environment Variables

## Vercel Configuration

The backend uses the following `vercel.json` configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/app.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

This configuration:
- Uses the Node.js runtime
- Sets the entry point to `src/app.js`
- Routes all requests to the main Express app
- Sets the environment to production

## Database Setup

Before deploying, ensure your database is properly set up:

1. **Create a cloud MySQL database**:
   - Create an account with a cloud database provider
   - Set up a MySQL database
   - Configure network access settings to allow connections from Vercel's IP ranges

2. **Run database migrations**:
   - Either manually create the required tables
   - Or run migration scripts (if available)

3. **Update environment variables**:
   - Set the database connection details in Vercel environment variables

## Monitoring and Troubleshooting

### View Deployment Logs

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on the latest deployment
4. Click on "Functions" to see serverless function logs
5. Click on "View Logs" for detailed logs

### Common Issues and Solutions

1. **Function Invocation Failed Error**:
   - Check database connection details
   - Verify all required environment variables are set
   - Check for syntax errors in the code

2. **Database Connection Issues**:
   - Ensure the database allows connections from Vercel's IP ranges
   - Check that SSL configuration is correct
   - Verify database credentials

3. **Environment Variable Issues**:
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify that sensitive variables are properly secured

## Updating the Deployment

To update the deployed backend:

1. **Make changes to your code**:
   - Update the necessary files

2. **Commit changes to the repository**:
   ```bash
   git add .
   git commit -m "[Feat/Fix]: Description of changes"
   git push
   ```

3. **Redeploy using the script**:
   ```bash
   ./vercel-deploy.sh
   ```

4. **Verify the deployment**:
   - Check the deployment status in the Vercel dashboard
   - Test the API endpoints to ensure they work as expected

## Continuous Deployment

For automated deployments:

1. **Enable GitHub Integration**:
   - Link your GitHub repository to Vercel
   - Configure auto-deployments for specific branches

2. **Set up Production Branch**:
   - Configure your main branch (e.g., `main` or `master`) to deploy to production
   - Configure other branches to deploy to preview environments

## Custom Domains

To set up a custom domain:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Domains"
3. Add your custom domain
4. Follow the instructions to configure DNS settings
5. Update your frontend and any other services to use the new domain 