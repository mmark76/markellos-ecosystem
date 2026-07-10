import './styles/reset.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/layout.css';
import './components/ui-settings/ui-settings-position.css';

import { createCookieBanner } from './components/cookie-banner/cookie-banner.js';
import { createEcosystem } from './components/ecosystem/ecosystem.js';
import { createFooter } from './components/footer/footer.js';
import { createHero } from './components/hero/hero.js';
import { createUiSettings } from './components/ui-settings/ui-settings.js';
import { ecosystemGroups } from './data/projects.js';
import { initializeAnalytics } from './services/analytics-service.js';
import { clearConsent } from './services/consent-service.js';
import { applyUiSettings } from './services/ui-settings-service.js';
import { createElement, focusFirstInteractive } from './utils/dom.js';
import './styles/default-scale.css';
import './styles/font-options.css';

applyUiSettings();
initializeAnalytics();

function appendCookieBanner({ resetConsent = false } = {}) {
  const app = document.querySelector('#app');

  if (!app) {
    throw new Error('Application root element was not found.');
  }

  const existingBanner = app.querySelector('.cookie-banner');

  if (existingBanner) {
    focusFirstInteractive(existingBanner);
    return existingBanner;
  }

  if (resetConsent) {
    clearConsent();
  }

  const banner = createCookieBanner({ force: resetConsent });

  if (banner) {
    app.append(banner);
    focusFirstInteractive(banner);
  }

  return banner;
}

function renderApp() {
  const app = document.querySelector('#app');

  if (!app) {
    throw new Error('Application root element was not found.');
  }

  const main = createElement('main', {
    classNames: ['page-shell'],
  });

  main.append(createHero(), createEcosystem(ecosystemGroups));
  app.replaceChildren(main, createFooter(), createUiSettings());
  appendCookieBanner();
}

globalThis.addEventListener?.('markellos:open-cookie-preferences', () => {
  appendCookieBanner({ resetConsent: true });
});

renderApp();