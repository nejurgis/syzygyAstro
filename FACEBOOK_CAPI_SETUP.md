# Facebook Conversions API Setup Guide

This guide will help you complete the setup of Facebook Conversions API (CAPI) for server-side event tracking.

## What's Been Implemented

✅ Server-side tracking with Netlify Functions
✅ Event deduplication between client and server
✅ Automatic hashing of user data (email, IP, user agent)
✅ Support for Lead and InitiateCheckout events
✅ Facebook browser ID (_fbp) and click ID (_fbc) tracking

## Prerequisites

- Access to Facebook Business Manager
- Admin access to your Facebook Pixel (ID: 815934864526504)
- Access to Netlify dashboard for your site (syzygyastro.netlify.app)

## Step 1: Generate Facebook Conversions API Access Token

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel (815934864526504)
3. Click on **Settings** in the left sidebar
4. Scroll down to **Conversions API** section
5. Click **Generate Access Token**
6. Copy the generated token (starts with "EAA...")
7. Keep this token secure - you'll need it in Step 2

### Alternative Method (More Secure - Recommended)

1. Go to [Meta Business Settings](https://business.facebook.com/settings)
2. Click **Data Sources** > **Pixels**
3. Select your Pixel
4. Click **Settings**
5. Under **Conversions API**, click **Set up manually**
6. Generate a new access token with appropriate permissions
7. Copy the token

## Step 2: Configure Environment Variables in Netlify

1. Go to your [Netlify dashboard](https://app.netlify.com/)
2. Select your site: **syzygyastro**
3. Click **Site settings** > **Environment variables**
4. Add the following variables:

### Required Variables

```
FB_CONVERSIONS_API_TOKEN = [paste your access token from Step 1]
FB_PIXEL_ID = 815934864526504
```

### Optional Variables (for testing)

```
FB_TEST_EVENT_CODE = TEST12345
```

To get a test event code:
- Go to Events Manager > Test Events
- Create a new test
- Copy the test event code

## Step 3: Deploy to Netlify

Since the code has been updated, you need to deploy:

```bash
git add .
git commit -m "Add Facebook Conversions API integration"
git push
```

Netlify will automatically deploy the changes.

## Step 4: Test the Integration

### Method 1: Using Test Events (Recommended)

1. Add `FB_TEST_EVENT_CODE` to your Netlify environment variables
2. Go to Events Manager > Test Events
3. Visit your website: https://syzygyastro.netlify.app
4. Trigger an event (submit email or click booking)
5. Check Events Manager - you should see events appear in real-time

### Method 2: Live Testing

1. Visit https://syzygyastro.netlify.app
2. Open browser DevTools (F12) > Console
3. Submit an email or click a booking button
4. Check console for: "Conversion tracked successfully"
5. Go to Events Manager > Overview
6. Events should appear within a few minutes (may take up to 20 minutes)

### What to Look For

In Events Manager, you should see:
- **Event Name**: Lead or InitiateCheckout
- **Event Source**: Both "Website" (client) and "Server" (CAPI)
- **Matched Parameters**: Email (EM), IP (client_ip_address), User Agent (client_user_agent), FBP, FBC

## Step 5: Verify Deduplication is Working

1. Trigger an event on your website
2. In Events Manager, click on the event
3. Check the **Event Details**
4. You should see:
   - `event_id` present
   - "Deduplicated" status if both client and server events were received
5. Event count should be 1, not 2 (this confirms deduplication worked)

## Events Being Tracked

| Event Name | Trigger | Client-Side | Server-Side |
|------------|---------|-------------|-------------|
| PageView | Page load | ✅ | ✅ |
| Lead | Email submission | ✅ | ✅ |
| InitiateCheckout | Booking click | ✅ | ✅ |

## Troubleshooting

### Events not appearing in Events Manager

1. Check Netlify Function Logs:
   - Go to Netlify Dashboard > Functions > track-conversion
   - Check for errors in the logs
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Make sure Facebook Pixel is still loading correctly

### "Server configuration error" in console

- The `FB_CONVERSIONS_API_TOKEN` environment variable is not set in Netlify
- Go back to Step 2 and add the variable
- Redeploy the site

### Events appear twice (not deduplicated)

- Check that `event_id` is being sent with both client and server events
- Verify the event_id is the same for both events
- Check browser console logs for the event_id value

### "Invalid access token" error

- Your access token may have expired or is incorrect
- Generate a new token in Events Manager
- Update the `FB_CONVERSIONS_API_TOKEN` in Netlify

## Advanced: Adding More Events

To track additional events, use the `trackConversion` function:

```javascript
import { trackConversion } from './utils/tracking';

// Example: Track a purchase
trackConversion('Purchase', {
  email: customerEmail,
  customData: {
    value: 99.00,
    currency: 'EUR',
    contentName: 'Natal Chart Reading'
  }
});
```

## Benefits of Server-Side Tracking

- **iOS 14.5+ Tracking**: Bypasses ATT (App Tracking Transparency) limitations
- **Ad Blocker Proof**: Server-side events aren't blocked by ad blockers
- **Better Attribution**: More accurate conversion tracking for ad optimization
- **Improved Match Rates**: Better user matching with hashed data
- **Privacy Compliant**: Secure hashing of personal information

## 🎯 NEW: Enhanced Match Quality (8-10/10)

Your implementation now captures **8 user data parameters** for superior Facebook matching:

**Standard Parameters (Always sent):**
- ✅ IP Address
- ✅ User Agent
- ✅ _fbp (Facebook Browser ID)
- ✅ _fbc (Facebook Click ID)

**Enhanced Parameters (From Acuity bookings):**
- ✅ Email (hashed)
- ✅ Phone (hashed)
- ✅ First Name (hashed)
- ✅ Last Name (hashed)
- ✅ City/State/Country (if collected)

### Testing Your Match Quality

See **PAYLOAD_HELPER_GUIDE.md** for detailed instructions on:
- Using Facebook's Payload Helper tool
- Verifying your match quality score
- Troubleshooting low match rates
- Ensuring Acuity sends user data properly

## Support

If you encounter any issues:
1. Check Netlify Function logs
2. Check Facebook Events Manager > Diagnostics
3. Review browser console for error messages
4. Test with FB_TEST_EVENT_CODE enabled

## Next Steps

Once CAPI is working:
1. Monitor Events Manager for a few days
2. Check that conversion data flows to your Facebook Ads Manager
3. Ensure ad campaigns are optimizing correctly
4. Consider adding more conversion events (Purchase, CompleteRegistration, etc.)
