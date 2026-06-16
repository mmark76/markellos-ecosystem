import './cookie-banner.css';
import { CONSENT_LEVELS, getConsent, saveConsent } from '../../services/consent-service.js';
import { createElement } from '../../utils/dom.js';

export function createCookieBanner({ force = false } = {}) {
  if (!force && getConsent()) {
    return null;
  }

  const banner = createElement('aside', {
    classNames: ['cookie-banner'],
    attributes: {
      role: 'dialog',
      'aria-live': 'polite',
      'aria-label': 'Cookie preferences',
    },
  });

  const content = createElement('div', {
    classNames: ['cookie-banner__content'],
  });

  content.append(
    createElement('p', {
      classNames: ['cookie-banner__title'],
      text: 'Cookie preferences',
    }),
    createElement('p', {
      classNames: ['cookie-banner__text'],
      text: 'This site stores your preference locally. No advertising cookies are currently used.',
    }),
  );

  const actions = createElement('div', {
    classNames: ['cookie-banner__actions'],
  });

  const necessaryButton = createElement('button', {
    classNames: ['cookie-banner__button', 'cookie-banner__button--secondary'],
    text: 'Necessary only',
    attributes: { type: 'button' },
  });

  const acceptButton = createElement('button', {
    classNames: ['cookie-banner__button', 'cookie-banner__button--primary'],
    text: 'Accept',
    attributes: { type: 'button' },
  });

  function closeBanner(level) {
    saveConsent(level);
    banner.remove();
  }

  necessaryButton.addEventListener('click', () => closeBanner(CONSENT_LEVELS.NECESSARY));
  acceptButton.addEventListener('click', () => closeBanner(CONSENT_LEVELS.ALL));

  actions.append(necessaryButton, acceptButton);
  banner.append(content, actions);

  return banner;
}
