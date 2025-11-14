# Debugging Server-Side Tracking Issue

## Problem
Facebook shows: "Your server is sending 64 fewer events than your pixel in the last 7 days"

This means:
- ✅ Client-side Pixel working (sending events)
- ❌ Server-side CAPI not working properly (missing events)

## Step 1: Check Netlify Function Logs

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site: **syzygyastro**
3. Click **Functions** in the left sidebar
4. Click on **track-conversion** function
5. Look at the **Logs** tab

### What to look for:

**Good (Working):**
```
Facebook CAPI Response: {"events_received":1,"events_processed":1}
```

**Bad (Not Working):**
```
Error tracking conversion: Invalid access token
Error: FB_CONVERSIONS_API_TOKEN not configured
Error: Cannot read property 'execute' of undefined
```

## Step 2: Test the Function Directly

Open your browser console and run this test:

```javascript
// Test the Netlify function directly
fetch('/.netlify/functions/track-conversion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'InitiateCheckout',
    eventId: 'test-' + Date.now(),
    fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] || null,
    fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1] || null,
    sourceUrl: window.location.href
  })
})
.then(r => r.json())
.then(data => console.log('Server response:', data))
.catch(err => console.error('Server error:', err));
```

### Expected Response (Good):
```json
{
  "success": true,
  "message": "Event tracked successfully",
  "eventName": "InitiateCheckout",
  "eventId": "test-1763095297428"
}
```

### Error Response (Bad):
```json
{
  "success": false,
  "error": "Server configuration error"
}
```

## Common Issues & Fixes

### Issue 1: "Server configuration error"

**Cause:** `FB_CONVERSIONS_API_TOKEN` not set or incorrect

**Fix:**
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select Pixel: 815934864526504
3. Click **Settings** > **Conversions API**
4. Generate a new access token
5. Copy the token (starts with "EAA...")
6. Go to Netlify → Site Settings → Environment Variables
7. Update `FB_CONVERSIONS_API_TOKEN` with the new token
8. Redeploy your site (or trigger a new deployment)

### Issue 2: "Invalid access token"

**Cause:** Token expired or doesn't have proper permissions

**Fix:**
1. Generate a new token from Facebook Events Manager
2. Make sure you select the correct Pixel (815934864526504)
3. Update Netlify environment variable
4. Redeploy

### Issue 3: Events sent but not showing in Facebook

**Cause:** Deduplication might be hiding server events, or test event code is active

**Fix:**
1. Check if `FB_TEST_EVENT_CODE` is set in Netlify
   - If YES: Events only go to Test Events, not real events
   - If NO: Events should appear in Events Manager > Overview
2. Remove `FB_TEST_EVENT_CODE` to send real events
3. Redeploy

### Issue 4: CORS errors in console

**Cause:** Netlify function not returning proper CORS headers

**Fix:** Already handled in your function code - if you see CORS errors, the function might not be deployed properly.

## Step 3: Verify Environment Variables

In Netlify dashboard:
1. Site Settings → Environment Variables
2. Verify these are set:
   - `FB_CONVERSIONS_API_TOKEN` = EAA... (your access token)
   - `FB_PIXEL_ID` = 815934864526504

3. If you're testing:
   - `FB_TEST_EVENT_CODE` = TEST12345 (optional)

**Important:** After changing environment variables, you MUST redeploy:
```bash
# Trigger a redeploy
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

Or click "Trigger deploy" in Netlify dashboard.

## Step 4: Check Facebook Events Manager

1. Go to [Events Manager](https://business.facebook.com/events_manager)
2. Click **Overview**
3. Look for events in the last hour
4. Click on an event to see details
5. Check **Event Source**:
   - Should show "Browser" (from Pixel)
   - Should show "Server" (from CAPI)
   - If only showing "Browser", server events aren't reaching Facebook

## Step 5: Check Test Events (If Using Test Code)

If you have `FB_TEST_EVENT_CODE` set:
1. Events Manager → **Test Events**
2. Select your test
3. You should see events appear in real-time
4. Click on an event to verify it's coming from "Server"

## Quick Diagnostic

Run this in your browser console after clicking "Book":

```javascript
// Wait for tracking to complete
setTimeout(() => {
  console.log('Checking last tracking call...');
  // The trackConversion function should have logged the response
}, 2000);
```

Look for the console log: `"Conversion tracked successfully: InitiateCheckout ..."`

If you DON'T see it, the fetch to Netlify function failed.

## Expected Event Flow

### When you click "Book a Reading":

1. ✅ Client-side Pixel fires immediately
   - Console: `fbq('track', 'InitiateCheckout', ...)`
2. ✅ Fetch to Netlify function starts
   - Network tab should show POST to `/.netlify/functions/track-conversion`
3. ✅ Netlify function calls Facebook CAPI
   - Should return `{success: true, ...}`
4. ✅ Console logs success
   - `"Conversion tracked successfully: InitiateCheckout ..."`

### What you should see in Facebook (after 1-2 minutes):

- Events Manager → Overview
- 1 InitiateCheckout event
- Event details show:
  - Source: Browser + Server
  - Deduplicated: Yes
  - Event ID: Same for both

## Still Not Working?

### Check Netlify Deploy Log

1. Netlify Dashboard → Deploys
2. Click on the latest deploy
3. Look for errors during build
4. Make sure the function was deployed:
   ```
   ◈ Functions bundled successfully
   ```

### Check Network Tab in DevTools

1. Open DevTools → Network tab
2. Click "Book a Reading"
3. Filter for "track-conversion"
4. Click on the request
5. Check **Response** tab:
   - Should be `{success: true, ...}`
   - If error, see what the error message says

## Solution Checklist

- [ ] FB_CONVERSIONS_API_TOKEN is set in Netlify
- [ ] Token is valid (not expired)
- [ ] Token has permissions for Pixel 815934864526504
- [ ] Environment variables saved
- [ ] Site redeployed after env var changes
- [ ] Netlify function deployed successfully
- [ ] Function logs show successful responses
- [ ] Network tab shows successful POST to function
- [ ] Console shows "Conversion tracked successfully"
- [ ] Facebook Events Manager shows server events

## Get Help

If still stuck, share:
1. Screenshot of Netlify function logs
2. Response from the test fetch (Step 2)
3. Network tab response for track-conversion request
4. Any errors in browser console (not browser extension errors)
