# Tracking Verification Guide

## ✅ Current Setup Status

Your booking form now tracks conversions to **3 platforms**:

1. **Facebook Pixel** (client-side)
2. **Facebook Conversions API** (server-side)
3. **Google Analytics 4**

---

## How to Verify Tracking Works

### 1. Check Console Logs

When you submit the booking form, you should see:

```
📊 Tracking SubmitApplication event with Facebook Pixel...
User Data: {email: '...', firstName: '...', lastName: '...', phone: '...'}
Service: Natal Chart Reading
🎯 Firing Facebook Pixel: SubmitApplication
✅ Facebook Pixel fired successfully
📊 Firing Google Analytics: submit_application
✅ Google Analytics event fired successfully
📡 Sending to Facebook Conversions API (server-side)...
✅ Server-side conversion tracked successfully: SubmitApplication [event-id]
✅ Facebook tracking completed
Submitting form to Netlify...
Netlify response: 200
✅ Booking inquiry submitted successfully to Netlify
```

---

### 2. Facebook Events Manager

**Check Test Events (Real-time):**
1. Go to: https://business.facebook.com/events_manager2/
2. Select Pixel ID: **815934864526504**
3. Click **Test Events** tab
4. Submit a booking form
5. You should see **SubmitApplication** event appear within 20 seconds with:
   - Value: €99 or €75
   - Currency: EUR
   - Content name: Service name
   - Event ID: Matching client and server events (deduplication working)

**Check Overview (After 15-30 min):**
1. Go to **Overview** tab
2. View **SubmitApplication** event count
3. See total conversion value

---

### 3. Google Analytics 4

**Check Realtime (Immediate):**
1. Go to: https://analytics.google.com
2. Select property (GA4 ID: **G-V333F0GNXX**)
3. Navigate to **Reports** → **Realtime**
4. Submit a booking form
5. Look for **submit_application** event (appears within 10-30 seconds)

**Event Parameters to Verify:**
- value: 99 or 75
- currency: EUR
- service_name: Service name
- event_category: engagement
- event_label: booking_form_submission
- content_category: Consultation

**Check Events Report (After 24-48 hours):**
1. Go to **Reports** → **Engagement** → **Events**
2. Find **submit_application** event
3. Click to see detailed metrics

---

### 4. Netlify Forms

**Check Form Submissions:**
1. Go to: https://app.netlify.com
2. Select your site
3. Click **Forms** → **booking** form
4. See all submissions with full data

**Set Up Email Notifications:**
1. In the booking form page, click **Settings and usage**
2. Scroll to **Form notifications**
3. Click **Add notification** → **Email notification**
4. Enter your email
5. Save

---

## Testing Without Real Submissions

Use the console test function:

```javascript
window.testSubmitApplication()
```

This fires:
- ✅ Facebook SubmitApplication event (value: €99)
- ✅ Google Analytics submit_application event (value: €99)

Check both platforms' real-time reports to confirm.

---

## Set Up Conversions in Google Analytics

### Method 1: Manual Creation (Immediate)

1. Go to **GA4 Admin** → **Conversions**
2. Click **"New conversion event"**
3. Enter: `submit_application`
4. Click **Save**
5. Done! It's now a conversion goal

### Method 2: Mark Existing Event (After 24-48 hours)

1. Go to **GA4 Admin** → **Events**
2. Wait for `submit_application` to appear in the list
3. Toggle **"Mark as conversion"** to ON

---

## Event Parameters Sent

### Facebook SubmitApplication Event

```javascript
{
  value: 99,              // €99 for Natal, €75 for others
  currency: 'EUR',
  content_name: 'Natal Chart Reading',
  content_category: 'Consultation Inquiry',
  content_type: 'product',
  predicted_ltv: 99
}
```

**User Data (hashed via Conversions API):**
- Email (SHA256 hashed)
- First name (SHA256 hashed)
- Last name (SHA256 hashed)
- Phone (SHA256 hashed)
- IP address
- User agent
- fbp cookie (_fbp)
- fbc cookie (_fbc)

### Google Analytics submit_application Event

```javascript
{
  event_category: 'engagement',
  event_label: 'booking_form_submission',
  value: 99,
  currency: 'EUR',
  service_name: 'Natal Chart Reading',
  content_category: 'Consultation'
}
```

---

## Troubleshooting

### Facebook Pixel not firing?

**Check console for:**
```
⚠️ Facebook Pixel (fbq) not found on window object
```

**Causes:**
- Ad blocker enabled
- Privacy browser settings
- Pixel script blocked

**Solution:** Test in incognito mode with ad blocker disabled

---

### Google Analytics not firing?

**Check console for:**
```
⚠️ Google Analytics (gtag) not loaded - event not sent to GA4
Expected event: submit_application {...}
```

**Causes:**
- GA script blocked
- Privacy settings
- Script loading issue

**Solution:**
- Check Network tab for gtag.js loading
- Wait 2-3 seconds after page load before submitting

---

### Server-side tracking failing?

**Check console for:**
```
❌ Server-side tracking failed: [error message]
```

**Common causes:**
1. `FB_CONVERSIONS_API_TOKEN` not set in Netlify
2. Invalid or expired access token
3. Network error

**Solution:**
1. Go to Netlify → Site settings → Environment variables
2. Verify `FB_CONVERSIONS_API_TOKEN` exists
3. Generate new token if needed: Facebook Events Manager → Settings → Conversions API
4. Redeploy site after adding/updating

---

## Using Events in Facebook Ads

Your **SubmitApplication** event is ready for:

### Campaign Objectives
- ✅ Lead generation campaigns
- ✅ Conversions (optimize for SubmitApplication)
- ✅ Traffic with conversion tracking

### Optimization
- Optimize for **SubmitApplication** event
- Use **value** for ROAS optimization (€99/€75)
- Target people likely to complete applications

### Custom Audiences
1. Create audience of people who triggered **SubmitApplication**
2. Build lookalike audiences from converters
3. Exclude converters from prospecting campaigns
4. Retarget non-converters

### Performance Tracking
- View **Cost per SubmitApplication**
- Track **ROAS** (Return on Ad Spend) using event value
- See conversion attribution in Ads Manager

---

## Using Events in Google Analytics

### Reports Available

**Realtime:**
- See conversions as they happen
- Monitor booking form activity live

**Events Report:**
- Total submit_application count
- Event value (sum of all bookings)
- Users who converted
- Conversion rate

**Conversions Report:**
- After marking as conversion
- Track conversion funnel
- Attribution analysis
- Multi-channel analysis

### Creating Reports

**Exploration (Custom Reports):**
1. Go to **Explore** → **Free form**
2. Add dimension: **Event name**
3. Add metrics: **Event count**, **Event value**
4. Filter: Event name = submit_application
5. Add breakdown by: service_name

**Funnel Analysis:**
1. Track journey: page_view → form_start → submit_application
2. See drop-off rates
3. Optimize form based on insights

---

## Summary Checklist

- [x] Facebook Pixel tracking SubmitApplication
- [x] Facebook Conversions API with hashed user data
- [x] Google Analytics submit_application event
- [x] Netlify Forms receiving submissions
- [ ] Email notifications set up in Netlify
- [ ] submit_application marked as conversion in GA4
- [ ] Facebook ad campaign using SubmitApplication event

---

## Support

If you see any errors or tracking isn't working:
1. Check browser console for error messages
2. Verify all scripts loaded in Network tab
3. Test in incognito mode
4. Check Netlify function logs: Site settings → Functions → track-conversion
