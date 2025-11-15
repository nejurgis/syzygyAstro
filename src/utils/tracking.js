// Utility functions for tracking conversions with Facebook Pixel and Conversions API

// Generate a unique event ID for deduplication between client and server events
function generateEventId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get Facebook cookies for better user matching
function getFacebookCookies() {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  return {
    fbp: cookies._fbp || null,
    fbc: cookies._fbc || null
  };
}

// Track conversion event with both client-side pixel and server-side API
export async function trackConversion(eventName, eventData = {}) {
  const eventId = generateEventId();
  const { fbp, fbc } = getFacebookCookies();

  // 1. Track with client-side Facebook Pixel (with event_id for deduplication)
  if (window.fbq) {
    console.log(`🎯 Firing Facebook Pixel: ${eventName}`, {
      eventId,
      data: eventData.customData || {}
    });
    window.fbq('track', eventName, eventData.customData || {}, {
      eventID: eventId
    });
    console.log('✅ Facebook Pixel fired successfully');
  } else {
    console.warn('⚠️ Facebook Pixel (fbq) not found on window object');
  }

  // 2. Track with Google Analytics (if present)
  if (eventData.gtagEvent) {
    if (window.gtag) {
      console.log(`📊 Firing Google Analytics: ${eventData.gtagEvent.action}`, eventData.gtagEvent.params);
      window.gtag('event', eventData.gtagEvent.action, eventData.gtagEvent.params || {});
      console.log('✅ Google Analytics event fired successfully');
    } else {
      console.warn('⚠️ Google Analytics (gtag) not loaded - event not sent to GA4');
      console.log('Expected event:', eventData.gtagEvent.action, eventData.gtagEvent.params);
    }
  }

  // 3. Track with server-side Facebook Conversions API
  try {
    console.log('📡 Sending to Facebook Conversions API (server-side)...');
    const payload = {
      eventName,
      eventId,
      email: eventData.email || null,
      fbp,
      fbc,
      sourceUrl: window.location.href,
      userData: eventData.userData || {},
      customData: eventData.customData || {}
    };
    console.log('Payload:', payload);

    const response = await fetch('/.netlify/functions/track-conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      console.warn('⚠️ Server-side tracking warning:', result.error);
    } else {
      console.log('✅ Server-side conversion tracked successfully:', eventName, eventId);
    }

    return result;
  } catch (error) {
    // Don't block user experience if tracking fails
    console.warn('❌ Server-side tracking failed:', error);
    return { success: false, error: error.message };
  }
}

// Specific tracking functions for common events
export function trackLead(email, customData = {}, userData = {}) {
  return trackConversion('Lead', {
    email,
    customData,
    userData,
    gtagEvent: {
      action: 'generate_lead',
      params: {
        event_category: 'engagement',
        event_label: 'consultation_inquiry'
      }
    }
  });
}

export function trackSubmitApplication(email, customData = {}, userData = {}) {
  return trackConversion('SubmitApplication', {
    email,
    customData,
    userData,
    gtagEvent: {
      action: 'submit_application',
      params: {
        event_category: 'engagement',
        event_label: 'booking_form_submission',
        value: customData.value || 0,
        currency: customData.currency || 'EUR',
        service_name: customData.contentName || 'Unknown Service',
        content_category: customData.contentCategory || 'Consultation'
      }
    }
  });
}

export function trackInitiateCheckout(customData = {}) {
  return trackConversion('InitiateCheckout', {
    customData,
    gtagEvent: {
      action: 'begin_checkout',
      params: {
        event_category: 'ecommerce'
      }
    }
  });
}

export function trackSchedule(customData = {}, userData = {}) {
  return trackConversion('Schedule', {
    customData,
    userData,
    email: userData.email || null,
    gtagEvent: {
      action: 'schedule_appointment',
      params: {
        event_category: 'engagement',
        event_label: 'appointment_scheduled'
      }
    }
  });
}

export function trackPurchase(value, currency = 'EUR', customData = {}, userData = {}) {
  return trackConversion('Purchase', {
    customData: {
      value,
      currency,
      ...customData
    },
    userData,
    email: userData.email || null,
    gtagEvent: {
      action: 'purchase',
      params: {
        event_category: 'ecommerce',
        value,
        currency
      }
    }
  });
}

export function trackPageView() {
  const eventId = generateEventId();
  const { fbp, fbc } = getFacebookCookies();

  // Client-side pixel
  if (window.fbq) {
    window.fbq('track', 'PageView', {}, { eventID: eventId });
  }

  // Server-side API
  fetch('/.netlify/functions/track-conversion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventName: 'PageView',
      eventId,
      fbp,
      fbc,
      sourceUrl: window.location.href
    })
  }).catch(error => console.warn('PageView tracking failed:', error));
}
