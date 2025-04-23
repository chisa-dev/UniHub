# Deploying UniHub Backend to Vercel

This guide will help you deploy the UniHub backend to Vercel.

## Prerequisites

1. Create a Vercel account: [https://vercel.com/signup](https://vercel.com/signup)
2. Install Vercel CLI: `npm install -g vercel`
3. Set up a cloud MySQL database (PlanetScale, AWS RDS, etc.)

## Environment Variables

Set these environment variables in your Vercel project:

- `NODE_ENV`: `production`
- `DATABASE_URL`: Your MySQL connection string (if using connection string format)
- `DB_HOST`: Database hostname
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret for JWT token generation
- `API_URL`: Your full API URL (e.g., `https://your-app.vercel.app/api`)
- `FRONTEND_URL`: Your frontend application URL for CORS

## Steps to Deploy

1. Login to Vercel CLI:
   ```bash
   vercel login
   ```

2. Deploy to Vercel:
   ```bash
   cd Backend
   vercel
   ```

3. To deploy to production:
   ```bash
   vercel --prod
   ```

## Troubleshooting

If you encounter a 500 error or "Function Invocation Failed":

1. Check Vercel logs: Go to your project dashboard > Deployments > Latest Deployment > Functions > api/index.js > View Logs

2. Make sure your database connection is working:
   - Ensure your database accepts connections from Vercel's IP ranges
   - Check that your database credentials are correct
   - If using PlanetScale, make sure you've allowed connections from all IPs

3. Test API locally with production settings:
   ```bash
   NODE_ENV=production vercel dev
   ```

## Database Migration

For the first deployment, you may need to set up your database tables. Consider creating a migration script or manually setting up tables in your database dashboard.

## Accessing API Documentation

Your Swagger API documentation will be available at:
`https://your-vercel-app.vercel.app/api-docs` 