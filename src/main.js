import './styles/reset.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/layout.css';

import { createHero } from './components/hero/hero.js';
import { createEcosystem } from './components/ecosystem/ecosystem.js';
import { ecosystemGroups } from './data/projects.js';
import { createElement } from './utils/dom.js';

function renderApp() {
  const app = document.querySelector('#app');

  if (!app) {
    throw new Error('Application root element was not found.');
  }

  const main = createElement('main', {
    classNames: ['page-shell'],
  });

  main.append(createHero(), createEcosystem(ecosystemGroups));
  app.replaceChildren(main);
}

renderApp();
