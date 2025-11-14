# Facebook Conversions API Payload Helper Guide

## What's Been Improved

Your tracking now captures **8 user data parameters** instead of 4, dramatically improving Facebook's ability to match events to users:

### Before (Match Quality: ~4-5/10)
- ✅ IP Address
- ✅ User Agent
- ✅ _fbp (Facebook Browser ID)
- ✅ _fbc (Facebook Click ID)

### After (Match Quality: Expected ~8-10/10)
- ✅ IP Address
- ✅ User Agent
- ✅ _fbp (Facebook Browser ID)
- ✅ _fbc (Facebook Click ID)
- ➕ **Email** (from Acuity booking)
- ➕ **Phone** (from Acuity booking)
- ➕ **First Name** (from Acuity booking)
- ➕ **Last Name** (from Acuity booking)
- ➕ **City/State/Country** (from Acuity booking, if collected)

## Step 1: Deploy the Enhanced Tracking

First, push these changes to Netlify:

```bash
cd astrology-portfolio
git add .
git commit -m "Enhance Facebook CAPI with Acuity user data for better match quality"
git push
```

Wait for Netlify to deploy (usually 1-2 minutes).

## Step 2: Access the Payload Helper Tool

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel: **815934864526504**
3. Click **Test Events** in the left sidebar
4. You'll see options:
   - **Test Server Events** - For testing Conversions API
   - **Test Browser Events** - For testing Pixel

## Step 3: Set Up Test Event Code (Optional but Recommended)

Testing with a test event code ensures events don't affect your real data:

1. In Test Events tab, click **Create Test**
2. Name it: "CAPI Match Quality Test"
3. Copy the **Test Event Code** (e.g., `TEST12345`)
4. Add it to your Netlify environment variables:
   ```
   FB_TEST_EVENT_CODE = TEST12345
   ```
5. Redeploy your site

## Step 4: Test Enhanced Events

### Option A: Real Booking Test (Recommended)

This tests the actual user flow:

1. Visit https://syzygyastro.netlify.app
2. Open browser DevTools (F12) > Console
3. Click "Book a Reading" button
4. Fill out the Acuity booking form with REAL data:
   - Email: your-email@example.com
   - First Name: John
   - Last Name: Doe
   - Phone: +1234567890
5. Select a date/time
6. Submit the booking (you can cancel it after testing)
7. Watch the console for: `"Conversion tracked successfully: Schedule"`

### Option B: Manual Payload Test

If you can't do a real booking, test using the Payload Helper directly:

1. Go to Events Manager > Test Events
2. Click **Test Server Events**
3. Enter this example payload:

```json
{
  "data": [
    {
      "event_name": "Schedule",
      "event_time": 1699999999,
      "event_id": "test-123-456",
      "event_source_url": "https://syzygyastro.netlify.app",
      "action_source": "website",
      "user_data": {
        "em": "4c9184f37cff01bcdc32dc486ec36961",
        "ph": "2c7d2fe7175f6c4e67c5d92e87ca5c07",
        "fn": "96d9632f363564cc3032521409cf22a852f2032eec099ed5967c0d000cec607a",
        "ln": "799ef92a11af918e3fb741df42934f3b568ed2d93ac1df74f1b8d41a27932a6f",
        "client_ip_address": "123.123.123.123",
        "client_user_agent": "Mozilla/5.0...",
        "fbp": "fb.1.1699999999999.123456789",
        "fbc": "fb.1.1699999999999.ClickID123"
      },
      "custom_data": {
        "content_name": "Natal Chart Reading",
        "content_category": "Booking"
      }
    }
  ]
}
```

Note: The em, ph, fn, ln values should be SHA256 hashed. Use real hashed values for testing.

## Step 5: Verify Match Quality Score

After sending a test event:

1. In **Test Events**, you should see your event appear within seconds
2. Click on the event to see details
3. Look for **Event Match Quality** score (0-10 scale)
4. Check **Matched Parameters** section - you should see:
   - ✅ em (Email)
   - ✅ ph (Phone)
   - ✅ fn (First Name)
   - ✅ ln (Last Name)
   - ✅ client_ip_address
   - ✅ client_user_agent
   - ✅ fbp
   - ✅ fbc

### What the Scores Mean

- **0-3**: Poor - Missing critical data
- **4-5**: Fair - Basic tracking (your old setup)
- **6-7**: Good - Multiple parameters matched
- **8-10**: Excellent - Comprehensive data (your new setup!)

## Step 6: Check Real Events in Events Manager

After 15-30 minutes, check your real events:

1. Go to Events Manager > Overview
2. Look at recent **Schedule** or **Purchase** events
3. Click on any event to see details
4. Check the **Event Match Quality** score
5. Verify **Deduplication** is working (should see 1 event, not 2)

## Step 7: Verify in Facebook Ads Manager

Once events are flowing:

1. Go to [Facebook Ads Manager](https://business.facebook.com/adsmanager)
2. Create or edit a Sales campaign
3. At Ad Set level, click **Conversion Event** dropdown
4. You should see **Schedule** event with high match quality
5. Check if the event shows a higher match rate percentage

## Troubleshooting

### Events show low match quality even with new code

**Cause:** Acuity might not be sending all user data via postMessage

**Fix 1:** Enable Acuity postMessage
1. Log into Acuity Scheduling
2. Go to **Settings** > **Embed Options**
3. Enable **"Send appointment data via postMessage"**
4. Save and test again

**Fix 2:** Check what Acuity is actually sending
1. Open DevTools console
2. Add this temporary debug code:
```javascript
window.addEventListener('message', (e) => {
  if (e.origin === 'https://app.acuityscheduling.com') {
    console.log('Acuity data:', JSON.parse(e.data));
  }
});
```
3. Make a test booking
4. Check console to see what fields Acuity provides
5. Adjust the userData extraction in App.jsx based on actual field names

### No userData being sent to Facebook

**Check the browser console logs:**
1. Look for: `"Conversion tracked successfully: Schedule ..."`
2. Check the Netlify Function logs:
   - Go to Netlify Dashboard > Functions > track-conversion
   - Look for the event payload in logs
   - Verify `user_data` object contains hashed email, phone, etc.

### Hash format errors

Your Netlify function automatically hashes data using SHA256. If you see errors:
- Email, phone, and names are automatically lowercased and trimmed before hashing
- This happens server-side in `/netlify/functions/track-conversion.js:16-19`

### Match quality still low after improvements

If you're still seeing low scores:

1. **Check if email is being captured:**
   - Make a test booking
   - Check browser console for the tracked event
   - Verify email appears in the payload

2. **Use Facebook's Event Debugger:**
   - Events Manager > Diagnostics
   - Look for warnings about missing parameters

3. **Compare with Payload Helper:**
   - Test an event manually with Payload Helper
   - Compare the match quality score
   - Identify which parameters are missing

## Expected Results

After implementation:

- **Match Quality Score**: 8-10 (up from 4-5)
- **Matched Parameters**: 8+ (up from 4)
- **Attribution Accuracy**: Significantly improved
- **Ad Performance**: Better optimization for Sales campaigns
- **iOS 14.5+ Tracking**: More resilient to ATT restrictions

## Next Steps

1. ✅ Monitor match quality for 7 days
2. ✅ Check that ad campaigns are receiving better data
3. ✅ Look for improved ROAS (Return on Ad Spend)
4. ✅ Consider adding more events if needed (ViewContent, AddToCart, etc.)

## Understanding the Implementation

### How the data flows:

```
User books on Acuity
       ↓
Acuity sends postMessage with booking data
       ↓
App.jsx extracts: email, phone, firstName, lastName, etc.
       ↓
trackSchedule() sends to:
  1. Facebook Pixel (client-side)
  2. Netlify Function (server-side CAPI)
       ↓
Netlify Function hashes user data (SHA256)
       ↓
Sends to Facebook with event_id for deduplication
       ↓
Facebook matches user and assigns Match Quality score
       ↓
Events appear in Events Manager with 8-10/10 quality
```

## Additional Resources

- [Facebook Events Manager](https://business.facebook.com/events_manager)
- [Conversions API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api/)
- [Event Match Quality Guide](https://www.facebook.com/business/help/765081237991954)

## Support

If match quality is still low after following this guide:
1. Check Netlify Function logs for errors
2. Verify Acuity is sending user data via postMessage
3. Test with the Payload Helper tool
4. Review browser console for JavaScript errors
