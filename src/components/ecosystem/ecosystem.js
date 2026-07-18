import './ecosystem.css';
import { createElement } from '../../utils/dom.js';
import { createProjectNode } from '../project-node/project-node.js';

function createCategoryCard(group, index) {
  const card = createElement('article', {
    classNames: ['ecosystem-card', `ecosystem-card--${group.id}`],
    attributes: { 'aria-labelledby': `${group.id}-title` },
  });

  const header = createElement('header', {
    classNames: ['ecosystem-card__header'],
  });

  const identity = createElement('div', {
    classNames: ['ecosystem-card__identity'],
  });

  identity.append(
    createElement('span', {
      classNames: ['ecosystem-card__icon'],
      text: group.icon,
      attributes: { 'aria-hidden': 'true' },
    }),
    createElement('span', {
      classNames: ['ecosystem-card__number'],
      text: String(index + 1).padStart(2, '0'),
      attributes: { 'aria-hidden': 'true' },
    }),
  );

  const projectCount = group.projects.length;
  const heading = createElement('div', {
    classNames: ['ecosystem-card__heading'],
  });

  heading.append(
    createElement('h2', {
      classNames: ['ecosystem-card__title'],
      text: group.title,
      attributes: { id: `${group.id}-title` },
    }),
    createElement('p', {
      classNames: ['ecosystem-card__count'],
      text: `${projectCount} ${projectCount === 1 ? 'project' : 'projects'}`,
    }),
  );

  header.append(identity, heading);

  const description = createElement('p', {
    classNames: ['ecosystem-card__description'],
    text: group.description,
  });

  const projects = createElement('ul', {
    classNames: ['ecosystem-card__projects'],
  });
  projects.append(...group.projects.map(createProjectNode));

  card.append(header, description, projects);
  return card;
}

export function createEcosystem(groups) {
  const section = createElement('section', {
    classNames: ['ecosystem'],
    attributes: { 'aria-labelledby': 'ecosystem-title' },
  });

  const introduction = createElement('header', {
    classNames: ['ecosystem__introduction'],
  });

  introduction.append(
    createElement('p', {
      classNames: ['ecosystem__eyebrow'],
      text: 'Six distinct collections',
    }),
    createElement('h2', {
      classNames: ['ecosystem__title'],
      text: 'Explore by category',
      attributes: { id: 'ecosystem-title' },
    }),
    createElement('p', {
      classNames: ['ecosystem__description'],
      text: 'Choose a field and open any project directly in a new tab.',
    }),
  );

  const grid = createElement('div', {
    classNames: ['ecosystem__grid'],
  });
  grid.append(...groups.map(createCategoryCard));

  section.append(introduction, grid);
  return section;
}
