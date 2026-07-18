import './hero.css';
import { createElement } from '../../utils/dom.js';

export function createHero() {
  const hero = createElement('section', {
    classNames: ['hero'],
    attributes: { 'aria-labelledby': 'main-title' },
  });

  const copy = createElement('div', {
    classNames: ['hero__copy'],
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

  const meta = createElement('div', {
    classNames: ['hero__meta'],
    attributes: { 'aria-label': 'Ecosystem summary' },
  });

  ['6 categories', '14 projects', '11 apps & websites'].forEach((item) => {
    meta.append(
      createElement('span', {
        classNames: ['hero__meta-item'],
        text: item,
      }),
    );
  });

  copy.append(
    createElement('p', {
      classNames: ['hero__eyebrow'],
      text: 'A personal digital collection',
    }),
    title,
    createElement('p', {
      classNames: ['hero__subtitle'],
      text: 'Blogs, chess projects, useful tools, entertainment, meditation and learning experiences — organized in one place.',
    }),
    meta,
  );

  const visual = createElement('div', {
    classNames: ['hero__visual'],
    attributes: { 'aria-hidden': 'true' },
  });

  visual.append(
    createElement('span', {
      classNames: ['hero__monogram'],
      text: 'M',
    }),
    createElement('span', {
      classNames: ['hero__visual-label'],
      text: 'Learn · Create · Remember',
    }),
  );

  hero.append(copy, visual);
  return hero;
}
