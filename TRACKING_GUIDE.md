# Facebook Event Tracking Guide

## Event Funnel Overview

Your booking funnel now tracks 3 key stages:

```
1. InitiateCheckout → User clicks "Book a Reading" button
                ↓
2. Schedule → User selects a date/time in Acuity scheduler ✅ OPTIMIZE FOR THIS
                ↓
3. Purchase → User completes payment in Acuity
```

## Events Being Tracked

| Event | Trigger | When to Optimize | Value |
|-------|---------|------------------|-------|
| **PageView** | Page loads | ❌ Never | Awareness |
| **InitiateCheckout** | Click "Book a Reading" | ❌ Too early in funnel | Intent signal |
| **Schedule** | Select date in Acuity | ✅ **YES - Best for Sales campaign** | Strong intent |
| **Purchase** | Complete payment | ✅ Only if you have 50+ per week | Actual conversion |

## Facebook Ad Campaign Setup

### Sales Campaign (Recommended)

**Objective:** Sales or Conversions

**Optimization Event:** **Schedule**

**Why Schedule and not InitiateCheckout?**
- InitiateCheckout = Just clicked a button (low commitment)
- Schedule = Picked an actual date/time (high commitment)
- Facebook learns from quality signals, not just clicks
- You'll get fewer but better quality leads

**Why not Purchase?**
- If you have <50 purchases per week, Facebook can't optimize properly
- Schedule gives Facebook more data to learn from
- Once you hit 50+ purchases/week, switch to Purchase optimization

### Lead Campaign Alternative

Since you removed the email popup, you have two options:

**Option 1: Skip Lead Campaign**
- Focus only on Sales campaign optimizing for Schedule
- Simpler, cleaner tracking
- Recommended if your goal is bookings

**Option 2: Use InitiateCheckout as Lead**
- Set up Lead campaign
- Optimize for InitiateCheckout event
- Target cold audiences who don't know you yet
- Good for top-of-funnel awareness

## Setting Up in Facebook Ads Manager

### Step 1: Add Custom Conversion (if needed)

If "Schedule" doesn't appear in your optimization options:

1. Go to [Events Manager](https://business.facebook.com/events_manager)
2. Click **Custom Conversions**
3. Click **Create Custom Conversion**
4. Name: "Appointment Scheduled"
5. Event: Select "Schedule"
6. Click **Create**

### Step 2: Create Sales Campaign

1. **Campaign Level:**
   - Objective: Sales or Conversions
   - Click Continue

2. **Ad Set Level:**
   - Conversion Location: Website
   - Conversion Event: **Schedule** (or "Appointment Scheduled" if you created custom conversion)
   - Budget: Start with €20-30/day minimum
   - Audience: Your target demographics

3. **Ad Level:**
   - Create your ad
   - The ad will optimize for people likely to schedule appointments

### Step 3: Monitor Performance

Check Events Manager daily for the first week:

1. Go to Events Manager > Overview
2. Look at event counts:
   - InitiateCheckout: Should be highest
   - Schedule: Should be 20-40% of InitiateCheckout
   - Purchase: Should be 50-80% of Schedule

**Example healthy funnel:**
- 100 InitiateCheckout
- 30 Schedule (30% conversion rate)
- 20 Purchase (67% conversion rate from Schedule)

## Testing the Updated Tracking

### Test 1: InitiateCheckout Event

1. Visit https://syzygyastro.netlify.app
2. Open DevTools (F12) > Console
3. Click "Book a Reading" button
4. Console should show: `"Conversion tracked successfully: InitiateCheckout ..."`
5. Check Facebook Events Manager > Test Events

### Test 2: Schedule Event (Most Important!)

1. Stay on the booking page
2. In the Acuity scheduler, pick a date and time
3. Fill out the form
4. Click "Schedule Appointment" or "Reserve without paying"
5. Console should show: `"Conversion tracked successfully: Schedule ..."`
6. Check Facebook Events Manager - you should see **Schedule** event appear

### Test 3: Purchase Event

1. Complete a real booking with payment
2. Console should show: `"Conversion tracked successfully: Purchase ..."`
3. Facebook will receive the purchase amount and currency

## Troubleshooting

### Schedule event not firing

**Issue:** Acuity postMessage not working

**Solution 1: Enable Acuity postMessage**
1. Log into your Acuity account
2. Go to Settings > Embed Options
3. Enable "Send appointment data via postMessage"
4. Save

**Solution 2: Manual tracking**
If Acuity doesn't support postMessage for your plan, track on thank you page:
- Add tracking code to Acuity's "After Appointment" redirect page
- Or use Acuity webhook to trigger tracking server-side

### Events appearing twice in Facebook

- This is expected initially (client + server)
- Deduplication should merge them into 1 count
- Check that event_id is present in both events

### Too few Schedule events

If Schedule events are <10% of InitiateCheckout:
- Check Acuity postMessage is enabled
- Check browser console for errors
- Verify Acuity iframe is same origin policy compliant

## Advanced: Tracking by Service Type

To track which service is being booked:

```javascript
trackSchedule({
  contentName: 'Natal Chart Reading', // or 'Timing Consultation', 'Astrocartography'
  contentCategory: 'Booking',
  value: 99, // service price
  currency: 'EUR'
});
```

This data will appear in Facebook Events Manager under "Content Name" and help you see which services convert best.

## Next Steps

1. ✅ Deploy the updated code
2. ✅ Test all 3 events (InitiateCheckout, Schedule, Purchase)
3. ✅ Verify events in Facebook Events Manager
4. ✅ Create Sales campaign optimizing for **Schedule**
5. ✅ Monitor for 3-7 days to gather baseline data
6. ✅ Adjust budget and targeting based on Schedule conversion rate

## Event Match Quality Tips

To improve event match quality scores in Facebook:

1. **High Priority:**
   - ✅ IP address (already tracked)
   - ✅ User agent (already tracked)
   - ✅ FBP cookie (already tracked)
   - ✅ FBC cookie (already tracked)

2. **Optional (if you collect):**
   - Email (when they book)
   - Phone number (from Acuity form)
   - Name (from Acuity form)
   - Location (from Acuity form)

Currently your match quality should be "Good" with IP, User Agent, FBP, and FBC.

## Summary

- ✅ Track 3 events: InitiateCheckout, Schedule, Purchase
- ✅ Optimize Sales campaign for **Schedule** event
- ✅ Test that Schedule event fires when date is picked
- ✅ Monitor event counts in Facebook Events Manager
- ✅ Expect 20-40% conversion from InitiateCheckout → Schedule
- ✅ Facebook will optimize for people likely to actually schedule
