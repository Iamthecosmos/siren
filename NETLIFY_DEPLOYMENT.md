# Netlify Deployment Guide

## ✅ **Fixed Issues**

### 1. **Missing UUID Dependency** ✅
- **Problem**: `uuid` package was missing from root `package.json`
- **Solution**: Added `"uuid": "^9.0.1"` and `"@types/uuid": "^9.0.8"` to dependencies

### 2. **Server Import Issue** ✅
- **Problem**: Netlify function was importing wrong server file
- **Solution**: Updated to import from `server/server.js` instead of `server/index.ts`

### 3. **Module System Mismatch** ✅
- **Problem**: Server uses CommonJS, Netlify function uses ES modules
- **Solution**: Used `require()` in Netlify function to import CommonJS server

## 🚀 **Deployment Steps**

### 1. **Environment Variables**
Set these in Netlify dashboard:
```
NODE_ENV=production
JWT_SECRET=your-secret-jwt-key
DATABASE_URL=./database/siren.db
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://your-domain.netlify.app
```

### 2. **Build Command**
The build command is already configured in `netlify.toml`:
```bash
npm run build:client
```

### 3. **Publish Directory**
```
dist/spa
```

### 4. **Functions Directory**
```
netlify/functions
```

## 🔧 **Troubleshooting**

### **If you still get "uuid not found" error:**

1. **Check package.json**: Ensure `uuid` is in dependencies
2. **Clear Netlify cache**: Go to Site settings > Build & deploy > Clear cache
3. **Redeploy**: Trigger a new deployment

### **If API routes don't work:**

1. **Check function logs**: Go to Functions tab in Netlify dashboard
2. **Test locally**: Use `netlify dev` to test locally
3. **Check redirects**: Ensure `/api/*` redirects to `/.netlify/functions/api/:splat`

### **If database issues occur:**

1. **SQLite in serverless**: SQLite might not work in serverless environment
2. **Consider alternatives**: Use PostgreSQL (Supabase) or MongoDB (MongoDB Atlas)
3. **File system**: Serverless functions have read-only file system

## 📋 **Pre-Deployment Checklist**

- [x] All dependencies in root `package.json`
- [x] Netlify function imports correct server file
- [x] Environment variables configured
- [x] Build command working locally
- [x] API routes tested locally

## 🎯 **Expected Result**

After deployment, your app should:
- ✅ Build successfully without "uuid not found" error
- ✅ Serve the React app at your domain
- ✅ Handle API requests through Netlify Functions
- ✅ Support PWA features (installable, offline, etc.)

## 🆘 **Still Having Issues?**

1. **Check Netlify logs**: Go to Functions tab and check error logs
2. **Test locally**: Run `netlify dev` to test locally
3. **Simplify**: Try deploying just the frontend first, then add API

**Your Siren Safety App should now deploy successfully on Netlify! 🎉**
