# Setup Guide: Email Notifications & Facebook Pixel Tracking

## 1. Email Notifications for Form Submissions

### Option A: Netlify Dashboard (Recommended - 2 minutes)

1. Go to **https://app.netlify.com**
2. Select your **syzygyastro** site
3. Click **Forms** in the left sidebar
4. Click on the **"booking"** form
5. Go to **Settings and usage** tab
6. Scroll to **Form notifications** section
7. Click **Add notification** → **Email notification**
8. Enter your email address
9. Save!

**You're done!** You'll now get an email every time someone submits the booking form.

---

### Option B: Slack/Discord Notifications

Netlify also supports sending form submissions to Slack or Discord:

1. Same steps as above, but choose **Slack notification** or **Webhook notification**
2. For Discord: Use a Discord webhook URL
3. For Slack: Connect your Slack workspace

---

## 2. Facebook Pixel Tracking

### Your Current Setup ✅

Your Facebook Pixel is **already implemented** with:
- **Pixel ID**: `815934864526504`
- **Client-side tracking**: Browser pixel fires on form submit
- **Server-side tracking**: Facebook Conversions API (higher match quality)
- **Event deduplication**: Uses matching event IDs to prevent double-counting

### How to Verify It's Working

#### Step 1: Deploy Your Latest Changes

```bash
git add .
git commit -m "Add Facebook Pixel debugging"
git push
```

Wait for Netlify to deploy (~1-2 minutes).

#### Step 2: Test on Your Live Site

1. Open your site: **https://syzygyastro.netlify.app**
2. Open browser DevTools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. You should see:
   ```
   ✅ Facebook Pixel loaded successfully!
   📊 Pixel ID: 815934864526504
   💡 TIP: To test Lead event, use: window.testFacebookLead()
   ```

#### Step 3: Test the Lead Event

In the browser console, type:
```javascript
window.testFacebookLead()
```

You should see:
```
🧪 Testing Facebook Lead event...
🎯 Firing Facebook Pixel: Lead
✅ Facebook Pixel fired successfully
📡 Sending to Facebook Conversions API (server-side)...
✅ Server-side conversion tracked successfully
```

#### Step 4: Check Facebook Events Manager

1. Go to **https://business.facebook.com/events_manager2/**
2. Select your Pixel ID: **815934864526504**
3. Click **Test Events** tab
4. Open your website in another tab
5. Run `window.testFacebookLead()` in console
6. You should see the "Lead" event appear in Test Events within 20 seconds

---

### Why Facebook Pixel Helper Doesn't Work

**Facebook Pixel Helper** browser extension may not detect your pixel because:

1. **Your pixel loads AFTER page load** (for performance)
   - The extension checks for pixels immediately on page load
   - Your pixel loads inside `window.addEventListener('load', ...)` which is slightly delayed

2. **Solution**: Use Facebook Events Manager instead
   - Go to Events Manager → Test Events
   - This shows real-time events as they fire
   - More reliable than the browser extension

---

## 3. Set Up Facebook Conversions API (Server-Side Tracking)

For the **server-side tracking** to work, you need to add your Facebook API token:

### Step 1: Get Your Conversions API Access Token

1. Go to **https://business.facebook.com/events_manager2/**
2. Select your Pixel (**815934864526504**)
3. Click **Settings** tab
4. Scroll to **Conversions API** section
5. Click **Generate Access Token**
6. Copy the token (starts with `EAA...`)

### Step 2: Add Token to Netlify

1. Go to **https://app.netlify.com**
2. Select your **syzygyastro** site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Name: `FB_CONVERSIONS_API_TOKEN`
6. Value: Paste your access token
7. Click **Save**

### Step 3: Redeploy

After adding the environment variable:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for deployment to finish

**Now both client-side AND server-side tracking will work!**

---

## 4. Testing the Complete Flow

### Test a Real Form Submission

1. Go to your live site
2. Open DevTools → Console tab
3. Click **"Book a Reading"** button
4. Fill out the form with test data:
   - First Name: Test
   - Last Name: User
   - Email: your-email@example.com (use your real email to test)
   - Service: Select any service
   - Birth info: Use any date/time/place
5. Click **Submit**

### What Should Happen

**In the console**, you should see:
```
📊 Tracking Lead event with Facebook Pixel...
🎯 Firing Facebook Pixel: Lead
✅ Facebook Pixel fired successfully
📡 Sending to Facebook Conversions API (server-side)...
✅ Server-side conversion tracked successfully
Submitting form to Netlify...
Netlify response: 200 OK
✅ Booking inquiry submitted successfully to Netlify
```

**In Facebook Events Manager**:
- Go to Events Manager → Overview
- You should see 1 "Lead" event within 1-2 minutes
- If you set up Test Events, you'll see it immediately

**In Your Email**:
- You should receive an email from Netlify with the form submission details

---

## 5. Troubleshooting

### Facebook Pixel Not Firing?

**Check console for errors:**
```javascript
if (window.fbq) {
  console.log('✅ Pixel loaded');
} else {
  console.log('❌ Pixel NOT loaded');
}
```

**Common issues:**
- Ad blocker is blocking the pixel → Disable ad blocker
- Browser privacy settings blocking trackers → Test in incognito mode
- Pixel ID is wrong → Verify it's `815934864526504`

### Server-Side Tracking Failing?

**Check for this error in console:**
```
❌ Server-side tracking failed: ...
```

**Common causes:**
1. `FB_CONVERSIONS_API_TOKEN` not set in Netlify
   - Go to Netlify → Environment variables
   - Make sure `FB_CONVERSIONS_API_TOKEN` exists
   - Redeploy after adding it

2. Invalid token
   - Token might have expired
   - Generate a new one in Facebook Events Manager

3. Network error
   - Check if `/.netlify/functions/track-conversion` returns 200 OK
   - Look in Network tab for the request

### Not Receiving Email Notifications?

1. **Check spam folder**
2. **Verify email is set up in Netlify**:
   - Forms → booking → Settings and usage → Form notifications
   - Make sure your email is listed
3. **Test with a real submission**
   - Sometimes test events don't trigger emails

---

## 6. Monitoring Your Tracking

### View All Form Submissions

**Netlify Dashboard:**
- Forms → booking form
- See all submissions with timestamp, email, service selected, etc.

**Facebook Events Manager:**
- Events Manager → Overview
- See Lead events, conversion rate, etc.
- Data & Reports → Event Source Groups → Create reports

### Analytics

Your site also has:
- **Google Analytics**: Tag ID `G-V333F0GNXX`
- **Contentsquare**: User behavior analytics

Check these platforms for additional insights.

---

## Summary Checklist

- [ ] Set up email notifications in Netlify
- [ ] Deploy latest code with debugging
- [ ] Verify Facebook Pixel loads (check console)
- [ ] Test Lead event with `window.testFacebookLead()`
- [ ] Add `FB_CONVERSIONS_API_TOKEN` to Netlify
- [ ] Test a real form submission
- [ ] Verify email notification received
- [ ] Check Facebook Events Manager for Lead event

---

## Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Share the console logs
3. Check Netlify function logs: Site settings → Functions → track-conversion
