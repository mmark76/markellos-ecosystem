import './styles/reset.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/layout.css';

import { createCookieBanner } from './components/cookie-banner/cookie-banner.js';
import { createEcosystem } from './components/ecosystem/ecosystem.js';
import { createFooter } from './components/footer/footer.js';
import { createHero } from './components/hero/hero.js';
import { createUiSettings } from './components/ui-settings/ui-settings.js';
import { ecosystemGroups } from './data/projects.js';
import { applyUiSettings } from './services/ui-settings-service.js';
import { createElement } from './utils/dom.js';

applyUiSettings();

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

  const cookieBanner = createCookieBanner();

  if (cookieBanner) {
    app.append(cookieBanner);
  }
}

renderApp();
