# Authentication Configuration Guide

## Problem: Authentication works on localhost but not in production

This document explains how to properly configure authentication for both localhost and production environments.

---

## ✅ Recent Fixes Applied

The following improvements have been made to fix production authentication:

1. **Enhanced middleware cookie detection** - Now checks multiple cookie name formats (`authjs.session-token`, `next-auth.session-token`, and fallback)
2. **Explicit cookie configuration** - Added proper cookie settings with Secure flag and SameSite='lax'
3. **Improved client-side callback URL handling** - Better cookie parsing with regex-based extraction
4. **Secure cookie flags** - All production cookies now use Secure flag (HTTPS only)
5. **Fixed cookie domain scoping** - Removed hardcoded `.vercel.app` domain; cookies now scoped to current host automatically

### Critical Fix:
**Removed `domain: '.vercel.app'`** from cookie configuration. This was causing cookies to be incorrectly scoped across all Vercel projects. Cookies now correctly scope to `cur10us-sm.vercel.app` only.

---

## Required Configuration

### 1. Environment Variables (.env)

Ensure these variables are set correctly:

```bash
# Application URL - MUST match your deployed URL exactly
AUTH_URL=https://cur10us-sm.vercel.app

# Auth secret (generate with: openssl rand -base64 32)
AUTH_SECRET=vQmxPkJgEsVnFBye8KDzYjIDAVGPQOOHRUc4HcuuNqY=
```

**Important Notes:**
- `AUTH_URL` must be the exact URL of your deployed application
- No trailing slash at the end
- Must use `https://` for production
- For local development, change to: `http://localhost:3000`

---

### 2. Google OAuth Configuration

#### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project
3. Go to "Credentials"
4. Find your OAuth 2.0 Client ID

#### Step 2: Configure Authorized Redirect URIs

You MUST add BOTH localhost AND production URLs:

```
http://localhost:3000/api/auth/callback/google
https://cur10us-sm.vercel.app/api/auth/callback/google
```

**⚠️ CRITICAL:** 
- You must add ALL environments you plan to use
- The URLs must match EXACTLY (including http vs https)
- Missing or incorrect redirect URIs will cause authentication failures

#### Step 3: Verify Configuration

- Client ID: `714020487554-s7r2k2f6qfqr0bs95kgu4dt2ponqfpu1.apps.googleusercontent.com`
- Make sure the OAuth consent screen is properly configured
- Ensure your app is in "Production" status (not "Testing") in Google Cloud Console

---

### 3. Vercel Environment Variables

If deploying to Vercel, you must add environment variables in the Vercel dashboard:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add these variables:
   - `AUTH_URL` = `https://cur10us-sm.vercel.app`
   - `AUTH_SECRET` = (same value as local .env)
   - `GOOGLE_CLIENT_ID` = (your Google client ID)
   - `GOOGLE_CLIENT_SECRET` = (your Google client secret)
   - `DATABASE_URL` = (your database URL)
   - `RESEND_API_KEY` = (your Resend API key)

**Important:** Make sure variables are set for the correct environment (Production, Preview, Development)

---

### 4. Common Issues and Solutions

#### Issue: Google OAuth redirects to localhost in production

**Solution:** 
- Check Google Cloud Console redirect URIs include production URL
- Verify `AUTH_URL` is set correctly in Vercel environment variables
- Clear browser cookies and cache

#### Issue: Authentication works on localhost but not production

**Checklist:**
- [ ] `AUTH_URL` is set to production URL in Vercel
- [ ] Google Cloud Console has production redirect URI
- [ ] `AUTH_SECRET` is the same in all environments
- [ ] SSL certificate is valid (https:// required)
- [ ] No trailing slash in `AUTH_URL`

#### Issue: Session not persisting

**Solutions:**
- Check browser console for cookie-related errors
- Verify your site is served over HTTPS (not HTTP)
- Check Vercel deployment domain matches `AUTH_URL`
- Ensure `trustHost: true` is set in auth config (already configured)

---

## Testing Your Configuration

### 1. Test Google OAuth Flow

1. Visit your production URL
2. Click "Continuar com Google"
3. Complete Google sign-in
4. Verify you're redirected back to your application (not localhost)
5. Check that session is created successfully

### 2. Test Credentials Login

1. Login with email and password
2. Verify session persists after page refresh
3. Check cookies in browser DevTools → Application → Cookies
4. Should see `authjs.session-token` cookie

### 3. Verify in Browser DevTools

Open DevTools and check:
- **Console**: No authentication errors
- **Network**: Auth API routes return 200 status
- **Application → Cookies**: `authjs.session-token` exists with correct domain
- **Application → Cookies**: Domain should match your production URL

---

## Deployment Checklist

Before deploying to production:

- [ ] `AUTH_URL` updated to production URL in .env
- [ ] `AUTH_URL` added to Vercel environment variables
- [ ] Production redirect URI added to Google Cloud Console
- [ ] All other environment variables added to Vercel
- [ ] Test OAuth flow in production after deployment
- [ ] Verify session persistence works
- [ ] Test forgot password email flow
- [ ] Test email verification flow

---

## Support

If issues persist:
1. Enable debug mode by setting `NODE_ENV=development` temporarily
2. Check Vercel deployment logs
3. Review browser console for errors
4. Verify all environment variables are set correctly
5. Test in incognito/private browsing mode
