# BillBuddy Deployment Guide

This guide will walk you through deploying all parts of the BillBuddy application to production.

## Architecture Overview

BillBuddy consists of three main components:
1. **Frontend** - React application (Vite)
2. **Backend** - Node.js/Express API
3. **AWS Services** - Cognito (authentication), DynamoDB (database), Textract (OCR)

---

## Prerequisites

Before deploying, ensure you have:
- AWS Account with appropriate permissions
- Node.js 18+ installed locally
- Git installed
- Domain name (optional, but recommended)

---

## Part 1: AWS Services Setup

### 1.1 AWS Cognito (Already Set Up)

Your Cognito User Pool is already configured. Note these values from your frontend `.env`:
- User Pool ID: `us-east-1_example`
- User Pool Client ID: `your-client-id`
- Region: `us-east-1`

### 1.2 AWS DynamoDB

#### Create the DynamoDB Table

1. Go to [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb)
2. Click "Create table"
3. Configure:
   - **Table name**: `BillBuddyReceipts`
   - **Partition key**: `userId` (String)
   - **Sort key**: `id` (String)
   - **Table settings**: Use default settings or customize based on expected traffic
4. Click "Create table"

### 1.3 AWS IAM User Permissions

Update your `billbuddy-textract-user` IAM user with these permissions:

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam)
2. Find user: `billbuddy-textract-user`
3. Add this policy (replace with your actual table ARN):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "textract:AnalyzeExpense",
        "textract:AnalyzeDocument"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/BillBuddyReceipts"
    }
  ]
}
```

---

## Part 2: Backend Deployment

You have several options for deploying the backend:

### Option A: AWS Elastic Beanstalk (Recommended for Beginners)

1. **Install EB CLI**:
   ```bash
   pip install awsebcli
   ```

2. **Navigate to backend**:
   ```bash
   cd /Users/nikhilpolepalli/BillBuddy/backend
   ```

3. **Initialize Elastic Beanstalk**:
   ```bash
   eb init
   ```
   - Select region: `us-east-1`
   - Create new application: `billbuddy-backend`
   - Select platform: Node.js
   - Setup SSH: Yes (optional)

4. **Create environment variables file** (`.env.production`):
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   RECEIPTS_TABLE_NAME=BillBuddyReceipts
   PORT=8080
   ```

5. **Create environment**:
   ```bash
   eb create billbuddy-backend-prod
   ```

6. **Set environment variables**:
   ```bash
   eb setenv AWS_REGION=us-east-1 \
     AWS_ACCESS_KEY_ID=your-access-key \
     AWS_SECRET_ACCESS_KEY=your-secret-key \
     RECEIPTS_TABLE_NAME=BillBuddyReceipts \
     PORT=8080
   ```

7. **Deploy**:
   ```bash
   eb deploy
   ```

8. **Get your backend URL**:
   ```bash
   eb status
   ```
   Note the URL (e.g., `http://billbuddy-backend-prod.us-east-1.elasticbeanstalk.com`)

### Option B: AWS EC2 with PM2

1. **Launch EC2 instance**:
   - Ubuntu Server 22.04 LTS
   - t2.micro or t2.small
   - Configure security group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3001

2. **SSH into instance**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

4. **Clone your repo** (or copy files):
   ```bash
   git clone your-repo-url
   cd BillBuddy/backend
   npm install
   ```

5. **Create `.env` file**:
   ```bash
   nano .env
   ```
   Add your environment variables

6. **Start with PM2**:
   ```bash
   pm2 start dist/server.js --name billbuddy-backend
   pm2 startup
   pm2 save
   ```

7. **Setup Nginx as reverse proxy** (optional but recommended):
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/billbuddy
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/billbuddy /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Option C: Railway / Render (Easiest)

**Using Railway**:
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Deploy from GitHub repo
4. Set root directory to `/backend`
5. Add environment variables in Railway dashboard
6. Deploy!

**Using Render**:
1. Go to [render.com](https://render.com)
2. New > Web Service
3. Connect your repo
4. Root directory: `backend`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Add environment variables
8. Create web service

---

## Part 3: Frontend Deployment

### Option A: Vercel (Recommended - Easiest)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend**:
   ```bash
   cd /Users/nikhilpolepalli/BillBuddy/frontend
   ```

3. **Update `.env.production`**:
   ```
   VITE_API_URL=https://your-backend-url.com
   VITE_AWS_REGION=us-east-1
   VITE_USER_POOL_ID=your-pool-id
   VITE_USER_POOL_CLIENT_ID=your-client-id
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   Follow prompts, then:
   ```bash
   vercel --prod
   ```

5. **Configure environment variables in Vercel**:
   - Go to Vercel dashboard
   - Project Settings > Environment Variables
   - Add all variables from `.env.production`

### Option B: Netlify

1. **Build the frontend**:
   ```bash
   cd /Users/nikhilpolepalli/BillBuddy/frontend
   npm run build
   ```

2. **Deploy**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

3. **Or use Netlify UI**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `dist` folder
   - Configure environment variables

### Option C: AWS S3 + CloudFront

1. **Build the frontend**:
   ```bash
   cd /Users/nikhilpolepalli/BillBuddy/frontend
   npm run build
   ```

2. **Create S3 bucket**:
   ```bash
   aws s3 mb s3://billbuddy-frontend
   aws s3 sync dist/ s3://billbuddy-frontend
   ```

3. **Enable static website hosting**:
   - Go to S3 bucket > Properties > Static website hosting
   - Index document: `index.html`
   - Error document: `index.html`

4. **Create CloudFront distribution**:
   - Origin: Your S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Default Root Object: `index.html`

5. **Configure custom error responses**:
   - Error code: 403
   - Response page path: `/index.html`
   - Response code: 200

---

## Part 4: Post-Deployment Configuration

### 4.1 CORS Configuration

Update your backend CORS settings in `backend/src/server.ts`:

```typescript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}))
```

### 4.2 AWS Cognito Callback URLs

1. Go to AWS Cognito Console
2. Select your User Pool
3. App integration > App client settings
4. Update:
   - Callback URLs: `https://your-frontend-domain.com`
   - Sign out URLs: `https://your-frontend-domain.com`

### 4.3 Update Frontend Environment

Ensure your frontend `.env.production` points to the correct backend:
```
VITE_API_URL=https://your-backend-domain.com
```

---

## Part 5: Monitoring & Maintenance

### Backend Monitoring

**If using Elastic Beanstalk**:
```bash
eb logs
```

**If using EC2 with PM2**:
```bash
pm2 logs billbuddy-backend
pm2 monit
```

### Frontend Monitoring

Check your hosting provider's dashboard:
- Vercel: Analytics tab
- Netlify: Analytics tab

### Database Monitoring

- Go to DynamoDB Console
- Monitor > Metrics
- Set up CloudWatch alarms for capacity

---

## Part 6: Custom Domain Setup (Optional)

### For Frontend (Vercel)
1. Go to Vercel project settings
2. Domains > Add domain
3. Follow DNS configuration instructions

### For Backend (Elastic Beanstalk)
1. Get SSL certificate from AWS Certificate Manager
2. Configure load balancer to use HTTPS
3. Point your domain to EB URL using Route 53 or your DNS provider

---

## Quick Deployment Checklist

- [ ] DynamoDB table created (`BillBuddyReceipts`)
- [ ] IAM user has correct permissions
- [ ] Backend deployed and running
- [ ] Backend URL noted
- [ ] Frontend environment variables updated with backend URL
- [ ] Frontend built and deployed
- [ ] CORS configured on backend
- [ ] Cognito callback URLs updated
- [ ] Test complete user flow (signup, login, upload receipt, view spending)

---

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Check AWS credentials are valid
- Check DynamoDB table exists in correct region

### Frontend can't connect to backend
- Check CORS settings on backend
- Verify `VITE_API_URL` points to correct backend URL
- Check backend is running and accessible

### Authentication issues
- Verify Cognito callback URLs include your frontend domain
- Check User Pool ID and Client ID are correct
- Ensure AWS region matches

### Receipt upload fails
- Verify IAM user has Textract permissions
- Check file size limits (10MB default)
- Ensure AWS credentials are valid

---

## Estimated Costs

**AWS Free Tier** (first 12 months):
- DynamoDB: 25 GB storage, 200M requests/month
- Textract: 1,000 pages/month
- Cognito: 50,000 MAUs

**After Free Tier** (approximate monthly costs for low traffic):
- DynamoDB: $1-5
- Textract: $5-10 (1.50 per 1,000 pages)
- Backend hosting: $5-15
- Frontend hosting: $0 (Vercel/Netlify free tier)

**Total**: ~$10-30/month for moderate usage

---

## Recommended Production Setup

For a production-ready deployment, I recommend:

1. **Frontend**: Vercel (easiest, free tier, automatic HTTPS, CDN)
2. **Backend**: Railway or Render (easiest) OR AWS Elastic Beanstalk (more control)
3. **Database**: AWS DynamoDB (already set up)
4. **Domain**: Custom domain with SSL certificate

This gives you a reliable, scalable setup with minimal maintenance.

---

## Need Help?

If you encounter issues during deployment:
1. Check the logs first (`eb logs`, `pm2 logs`, or hosting dashboard)
2. Verify all environment variables are set correctly
3. Test each component independently
4. Check AWS service quotas and limits

Good luck with your deployment! 🚀
