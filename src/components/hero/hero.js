import './hero.css';
import { createElement } from '../../utils/dom.js';

export function createHero() {
  const hero = createElement('section', {
    classNames: ['hero'],
    attributes: { 'aria-labelledby': 'main-title' },
  });

  const eyebrow = createElement('p', {
    classNames: ['hero__eyebrow'],
    text: 'Learn · Improve · Relax · Share',
  });

  const title = createElement('h1', {
    classNames: ['hero__title'],
    text: 'MARKELLOS ECOSYSTEM',
    attributes: { id: 'main-title' },
  });

  const subtitle = createElement('p', {
    classNames: ['hero__subtitle'],
    text: 'Everything I create. All in one place.',
  });

  hero.append(eyebrow, title, subtitle);
  return hero;
}
