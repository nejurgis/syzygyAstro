const bizSdk = require('facebook-nodejs-business-sdk');

const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const Content = bizSdk.Content;
const CustomData = bizSdk.CustomData;

// Environment variables
const ACCESS_TOKEN = process.env.FB_CONVERSIONS_API_TOKEN;
const PIXEL_ID = process.env.FB_PIXEL_ID || '815934864526504';
const TEST_EVENT_CODE = process.env.FB_TEST_EVENT_CODE; // Optional, for testing

// Hash email using SHA256
const crypto = require('crypto');
function hashData(data) {
  if (!data) return null;
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Check if access token is configured
  if (!ACCESS_TOKEN) {
    console.error('FB_CONVERSIONS_API_TOKEN not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const {
      eventName,
      eventId,
      email,
      userData = {},
      customData = {}
    } = body;

    // Validate required fields
    if (!eventName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'eventName is required' })
      };
    }

    // Get client info from headers
    const clientIpAddress = event.headers['x-forwarded-for'] ||
                           event.headers['client-ip'] ||
                           null;
    const clientUserAgent = event.headers['user-agent'] || null;
    const fbp = body.fbp || null; // Facebook browser ID (_fbp cookie)
    const fbc = body.fbc || null; // Facebook click ID (_fbc cookie)

    // Build UserData
    const user = new UserData()
      .setClientIpAddress(clientIpAddress)
      .setClientUserAgent(clientUserAgent)
      .setFbp(fbp)
      .setFbc(fbc);

    // Add hashed email if provided
    if (email) {
      user.setEmail(hashData(email));
    }

    // Add additional user data if provided (all hashed for privacy)
    if (userData.firstName) user.setFirstName(hashData(userData.firstName));
    if (userData.lastName) user.setLastName(hashData(userData.lastName));
    if (userData.phone) user.setPhone(hashData(userData.phone));
    if (userData.city) user.setCity(hashData(userData.city));
    if (userData.state) user.setState(hashData(userData.state));
    if (userData.zip) user.setZipCode(hashData(userData.zip));
    if (userData.country) user.setCountryCode(hashData(userData.country));
    if (userData.dateOfBirth) user.setDateOfBirth(hashData(userData.dateOfBirth)); // Format: YYYYMMDD

    // Log what user data we're sending (for debugging)
    console.log('User data being sent to Facebook:', {
      hasEmail: !!email,
      hasFirstName: !!userData.firstName,
      hasLastName: !!userData.lastName,
      hasPhone: !!userData.phone,
      hasCity: !!userData.city,
      hasCountry: !!userData.country,
      hasDateOfBirth: !!userData.dateOfBirth
    });

    // Build CustomData for the event
    const custom = new CustomData();
    if (customData.value) custom.setValue(customData.value);
    if (customData.currency) custom.setCurrency(customData.currency);
    if (customData.contentName) custom.setContentName(customData.contentName);
    if (customData.contentCategory) custom.setContentCategory(customData.contentCategory);

    // Create Server Event
    const serverEvent = new ServerEvent()
      .setEventName(eventName)
      .setEventTime(Math.floor(Date.now() / 1000))
      .setUserData(user)
      .setCustomData(custom)
      .setEventSourceUrl(body.sourceUrl || event.headers.referer || 'https://syzygyastro.netlify.app')
      .setActionSource('website');

    // Add event_id for deduplication (matches client-side pixel event)
    if (eventId) {
      serverEvent.setEventId(eventId);
    }

    // Create Event Request
    const eventRequest = new EventRequest(ACCESS_TOKEN, PIXEL_ID)
      .setEvents([serverEvent]);

    // Add test event code if in test mode
    if (TEST_EVENT_CODE) {
      eventRequest.setTestEventCode(TEST_EVENT_CODE);
    }

    // Send event to Facebook
    const response = await eventRequest.execute();

    console.log('Facebook CAPI Response:', JSON.stringify(response));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        message: 'Event tracked successfully',
        eventName,
        eventId
      })
    };

  } catch (error) {
    console.error('Error tracking conversion:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
