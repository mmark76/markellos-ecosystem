import './hero.css';
import { createElement } from '../../utils/dom.js';

export function createHero() {
  const hero = createElement('section', {
    classNames: ['hero'],
    attributes: { 'aria-labelledby': 'main-title' },
  });

  const eyebrow = createElement('p', {
    classNames: ['hero__eyebrow'],
    text: 'Learn · Share · Improve · Remember · Relax',
  });

  const title = createElement('h1', {
    classNames: ['hero__title'],
    attributes: { id: 'main-title' },
  });

  title.append(
    createElement('span', {
      classNames: ['hero__title-line'],
      text: 'MARKELLOS',
    }),
    createElement('span', {
      classNames: ['hero__title-line'],
      text: 'ECOSYSTEM',
    }),
  );

  const divider = createElement('span', {
    classNames: ['hero__divider'],
    attributes: { 'aria-hidden': 'true' },
  });

  const subtitle = createElement('p', {
    classNames: ['hero__subtitle'],
    text: 'All in one place!',
  });

  hero.append(eyebrow, title, divider, subtitle);
  return hero;
}
