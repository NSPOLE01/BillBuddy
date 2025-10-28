# Post-Deployment Configuration Checklist

After deploying your backend to Elastic Beanstalk, follow these steps to complete the setup.

## Step 1: Get Your Backend URL

After deploying to Elastic Beanstalk, run:
```bash
eb status
```

Look for the line that says:
```
CNAME: billbuddy-backend-prod.us-east-1.elasticbeanstalk.com
```

Your backend URL will be: `http://billbuddy-backend-prod.eba-p7im42mz.us-east-1.elasticbeanstalk.com`

---

## Step 2: Update Elastic Beanstalk Environment Variables

Set the `ALLOWED_ORIGINS` environment variable to allow your frontend domain:

```bash
# For localhost testing (before deploying frontend):
eb setenv ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# After deploying frontend (replace with your actual Vercel URL):
eb setenv ALLOWED_ORIGINS="https://your-app.vercel.app,http://localhost:5173"
```

Make sure you've also set these variables (you should have done this during initial deployment):
```bash
eb setenv AWS_REGION=us-east-1 \
  AWS_ACCESS_KEY_ID=your-access-key \
  AWS_SECRET_ACCESS_KEY=your-secret-key \
  RECEIPTS_TABLE_NAME=BillBuddyReceipts \
  PORT=8080
```

---

## Step 3: Update Frontend Environment Variables

**File**: `/Users/nikhilpolepalli/BillBuddy/frontend/.env.production`

Update this file (already created with template):
```env
# Backend API URL - UPDATE THIS
VITE_API_URL=http://billbuddy-backend-prod.us-east-1.elasticbeanstalk.com

# AWS Cognito Configuration (already set correctly)
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_9PI7HTvhL
VITE_USER_POOL_CLIENT_ID=5sf5idq7pbta7q0h0utc1vomr3
VITE_COGNITO_DOMAIN=us-east-19pi7htvhl.auth.us-east-1.amazoncognito.com

# OAuth Redirect URLs - UPDATE AFTER DEPLOYING FRONTEND
VITE_REDIRECT_SIGN_IN=https://your-app.vercel.app
VITE_REDIRECT_SIGN_OUT=https://your-app.vercel.app
```

**YOU ONLY NEED TO UPDATE**:
- `VITE_API_URL` - Replace with your actual EB URL
- `VITE_REDIRECT_SIGN_IN` and `VITE_REDIRECT_SIGN_OUT` - Update after deploying frontend

---

## Step 4: Test Backend Locally with New URL

Before deploying frontend, test that the backend is accessible:

```bash
# Test health endpoint
curl http://billbuddy-backend-prod.us-east-1.elasticbeanstalk.com/health

# Should return: {"status":"ok"}
```

---

## Step 5: Rebuild and Deploy Backend (if CORS was updated)

Since we updated the CORS configuration, rebuild and redeploy:

```bash
cd /Users/nikhilpolepalli/BillBuddy/backend
npm run build
eb deploy
```

Wait for deployment to complete.

---

## Step 6: Deploy Frontend to Vercel

```bash
cd /Users/nikhilpolepalli/BillBuddy/frontend

# Make sure .env.production is updated with your backend URL
cat .env.production

# Deploy to Vercel
vercel --prod
```

After deployment, Vercel will give you a URL like: `https://billbuddy-abc123.vercel.app`

---

## Step 7: Update CORS with Frontend URL

Now that you have your frontend URL, update the backend CORS:

```bash
cd /Users/nikhilpolepalli/BillBuddy/backend

# Update ALLOWED_ORIGINS with your Vercel URL
eb setenv ALLOWED_ORIGINS="https://billbuddy-abc123.vercel.app,http://localhost:5173"
```

---

## Step 8: Update AWS Cognito Callback URLs

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito)
2. Select your User Pool
3. Go to **App integration** tab
4. Click on your app client name
5. Scroll to **Hosted UI settings**
6. Update **Allowed callback URLs**:
   ```
   http://localhost:5173
   https://your-app.vercel.app
   ```
7. Update **Allowed sign-out URLs**:
   ```
   http://localhost:5173
   https://your-app.vercel.app
   ```
8. Click **Save changes**

---

## Step 9: Verify Everything Works

### Test Frontend → Backend Connection

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Open browser DevTools (F12) → Network tab
3. Try to sign up or log in
4. Check that API calls are going to your backend URL
5. Verify no CORS errors in console

### Test Complete Flow

- [ ] Sign up with new account
- [ ] Verify email
- [ ] Log in
- [ ] Upload a receipt
- [ ] View receipt results
- [ ] Create a group
- [ ] Split bill
- [ ] View final tab
- [ ] Check spending patterns page
- [ ] Verify charts display
- [ ] Test pagination
- [ ] Delete a receipt

---

## Step 10: Enable HTTPS (Recommended)

For production, you should use HTTPS for your backend:

1. **Get SSL Certificate**:
   - Go to AWS Certificate Manager
   - Request a public certificate
   - Add your domain (or use Elastic Beanstalk subdomain)

2. **Configure Load Balancer**:
   ```bash
   eb console
   ```
   - Go to Configuration → Load Balancer
   - Add HTTPS listener
   - Select your SSL certificate

3. **Update Frontend .env.production**:
   ```env
   VITE_API_URL=https://billbuddy-backend-prod.us-east-1.elasticbeanstalk.com
   ```

4. **Redeploy Frontend**:
   ```bash
   cd /Users/nikhilpolepalli/BillBuddy/frontend
   vercel --prod
   ```

---

## Quick Reference

### Files Updated:
1. ✅ `/Users/nikhilpolepalli/BillBuddy/backend/src/server.ts` (CORS config)
2. ✅ `/Users/nikhilpolepalli/BillBuddy/frontend/.env.production` (Backend URL)

### Environment Variables Set:
1. ✅ Elastic Beanstalk: `ALLOWED_ORIGINS`
2. ✅ Elastic Beanstalk: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `RECEIPTS_TABLE_NAME`, `PORT`

### AWS Console Updates:
1. ✅ Cognito User Pool → Callback URLs
2. ✅ Cognito User Pool → Sign-out URLs

---

## Troubleshooting

### CORS Errors
**Error**: "Access to fetch at 'http://...' from origin 'https://...' has been blocked by CORS"

**Solution**:
1. Check `ALLOWED_ORIGINS` environment variable includes your frontend URL
2. Rebuild and redeploy backend: `npm run build && eb deploy`
3. Clear browser cache and try again

### Backend Not Responding
**Error**: Network timeout or 504 error

**Solution**:
1. Check backend logs: `eb logs`
2. Verify environment variables: `eb printenv`
3. Check Elastic Beanstalk health: `eb health`

### Authentication Not Working
**Error**: Redirect loop or "Invalid redirect URI"

**Solution**:
1. Verify Cognito callback URLs match your frontend URL exactly
2. Make sure frontend `.env.production` has correct User Pool ID and Client ID
3. Check browser console for specific error messages

---

## Summary Checklist

- [ ] Got backend URL from `eb status`
- [ ] Set `ALLOWED_ORIGINS` on Elastic Beanstalk
- [ ] Updated frontend `.env.production` with backend URL
- [ ] Rebuilt and redeployed backend with new CORS config
- [ ] Deployed frontend to Vercel
- [ ] Got frontend URL from Vercel
- [ ] Updated `ALLOWED_ORIGINS` with Vercel URL
- [ ] Updated Cognito callback URLs
- [ ] Tested complete user flow
- [ ] (Optional) Configured HTTPS on backend

---

## Your Specific URLs (Fill these in)

**Backend URL**: _______________________________________________

**Frontend URL**: _______________________________________________

**User Pool ID**: _______________________________________________

**Client ID**: _______________________________________________

---

You're all set! 🚀
