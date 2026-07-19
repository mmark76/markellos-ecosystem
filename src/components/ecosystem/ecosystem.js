import './ecosystem.css';
import { createElement } from '../../utils/dom.js';
import { createProjectNode } from '../project-node/project-node.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const ICON_PATHS = Object.freeze({
  blogs: [
    'M5 19c3.5-1 6.5-3.2 8.8-6.4L19 5l-1-1-7.6 5.2C7.2 11.5 5 15 5 19Z',
    'M8.2 15.8 4 20m5.5-7.5 2 2',
  ],
  chess: [
    'M8 20h9m-8-3h7l-.8-4.3c-.3-1.7-1.3-3.2-2.8-4.1L10 7l1-3 4 2 2.5 5.5L16 17',
    'M10 7 7.5 9.5 10 11',
  ],
  memory: [
    'M9.5 5.2A3 3 0 0 0 5 7.8a3.2 3.2 0 0 0 .4 5.7A3.4 3.4 0 0 0 9 18.8c.8 0 1.5-.3 2-.8V6.5c0-.9-.7-1.5-1.5-1.3Z',
    'M14.5 5.2A3 3 0 0 1 19 7.8a3.2 3.2 0 0 1-.4 5.7 3.4 3.4 0 0 1-3.6 5.3c-.8 0-1.5-.3-2-.8V6.5c0-.9.7-1.5 1.5-1.3Z',
    'M7 10h4m2 3h4M8.5 15H11m2-7h2.5',
  ],
  productivity: [
    'M3.5 5.5h13v9h-13zM8 18h4m-2-3.5V18',
    'M19 12.5v1.2m0 4.6v1.2m3-3.5h-1.2m-3.6 0H16m5.1-2.1-.9.9m-2.4 2.4-.9.9m4.2 0-.9-.9m-2.4-2.4-.9-.9',
    'M20.5 16a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z',
  ],
  entertainment: ['M4 8h16v11H4zM4 8l2-4h16l-2 4M8 4 6 8m7-4-2 4m7-4-2 4', 'm10 11 4 2.5-4 2.5Z'],
  'well-being': [
    'M12 20c0-4.2 2.4-7.2 6-9-.1 4-2 6.8-6 9Zm0 0c0-4.2-2.4-7.2-6-9 .1 4 2 6.8 6 9Z',
    'M12 16c-2.5-3-2.5-6 0-9 2.5 3 2.5 6 0 9Zm-7 4h14',
  ],
});

function createCategoryIcon(iconName) {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.classList.add('category-card__icon-svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.6');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  for (const pathData of ICON_PATHS[iconName] ?? []) {
    const path = document.createElementNS(SVG_NAMESPACE, 'path');
    path.setAttribute('d', pathData);
    svg.append(path);
  }

  return svg;
}

function createCategoryCard(group) {
  const titleId = `category-${group.id}-title`;
  const card = createElement('article', {
    classNames: ['category-card', `category-card--${group.theme}`],
    attributes: { 'aria-labelledby': titleId },
  });
  const icon = createElement('span', {
    classNames: ['category-card__icon'],
    attributes: { 'aria-hidden': 'true' },
  });
  icon.append(createCategoryIcon(group.icon));

  const links = createElement('ul', {
    classNames: ['category-card__links'],
    attributes: { 'aria-label': `${group.title} projects` },
  });

  for (const project of group.projects) {
    const item = createElement('li', { classNames: ['category-card__link-item'] });
    item.append(createProjectNode(project));
    links.append(item);
  }

  card.append(
    icon,
    createElement('h2', {
      classNames: ['category-card__title'],
      text: group.title,
      attributes: { id: titleId },
    }),
    createElement('span', {
      classNames: ['category-card__divider'],
      attributes: { 'aria-hidden': 'true' },
    }),
    links,
  );

  return card;
}

export function createEcosystem(groups) {
  const section = createElement('section', {
    classNames: ['ecosystem'],
    attributes: {
      id: 'ecosystem-links',
      tabindex: '-1',
      'aria-label': 'Markellos ecosystem categories and project links',
    },
  });

  section.append(...groups.map(createCategoryCard));
  return section;
}
