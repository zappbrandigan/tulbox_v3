import { analytics } from '../../firebase.js';
import { logEvent } from 'firebase/analytics';

const isDev = import.meta.env.MODE === 'development';

/**
 * Logs an event to Google Analytics, or prints it to console in development.
 */
function trackEvent(
  eventName: string,
  params?: Record<string, string | number | unknown>
) {
  if (isDev) {
    console.log(`[GA EVENT]: ${eventName}`, params ?? {});
    return;
  }

  try {
    if (!analytics) {
      console.warn('Analytics not yet initialized. Event skipped:', eventName);
      return;
    }

    logEvent(analytics, eventName, params);
  } catch (err) {
    console.warn('Error logging event:', err);
  }
}

export default trackEvent;
