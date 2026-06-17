import { CONSENT_LEVELS, getConsent } from './consent-service.js';

const GA_MEASUREMENT_ID = 'G-DK5WN8TH3Z';
const GOOGLE_TAG_SCRIPT_ID = 'markellos-google-tag';

const DENIED_CONSENT = Object.freeze({
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
});

let analyticsConfigured = false;

function getGtag() {
  globalThis.dataLayer = globalThis.dataLayer || [];

  if (typeof globalThis.gtag !== 'function') {
    globalThis.gtag = function gtag() {
      globalThis.dataLayer.push(arguments);
    };
  }

  return globalThis.gtag;
}

function loadGoogleTag() {
  if (!document.querySelector(`#${GOOGLE_TAG_SCRIPT_ID}`)) {
    const script = document.createElement('script');
    script.id = GOOGLE_TAG_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.append(script);
  }

  if (analyticsConfigured) {
    return;
  }

  const gtag = getGtag();
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
  analyticsConfigured = true;
}

function applyConsent(level) {
  const analyticsGranted = level === CONSENT_LEVELS.ALL;
  const gtag = getGtag();

  gtag('consent', 'update', {
    ...DENIED_CONSENT,
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
  });

  if (analyticsGranted) {
    loadGoogleTag();
  }
}

export function initializeAnalytics() {
  const gtag = getGtag();
  gtag('consent', 'default', DENIED_CONSENT);
  applyConsent(getConsent());

  globalThis.addEventListener?.('markellos:consent-changed', (event) => {
    applyConsent(event.detail?.level);
  });
}
