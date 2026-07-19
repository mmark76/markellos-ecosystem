import './project-node.css';
import { createElement } from '../../utils/dom.js';

export function createProjectNode(project) {
  const item = createElement('li', {
    classNames: ['project-node'],
    attributes: { 'data-project-id': project.id },
  });

  const link = createElement('a', {
    classNames: ['project-node__link'],
    attributes: {
      href: project.url,
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': `${project.title} — opens in a new tab`,
    },
  });

  link.append(
    createElement('span', {
      classNames: ['project-node__icon'],
      text: project.icon,
      attributes: { 'aria-hidden': 'true' },
    }),
    createElement('span', {
      classNames: ['project-node__label'],
      text: project.title,
    }),
    createElement('span', {
      classNames: ['project-node__arrow'],
      text: '↗',
      attributes: { 'aria-hidden': 'true' },
    }),
  );

  item.append(link);
  return item;
}
