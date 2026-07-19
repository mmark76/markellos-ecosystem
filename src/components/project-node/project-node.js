import './project-node.css';
import { createElement } from '../../utils/dom.js';

export function createProjectNode(project) {
  const node = createElement('a', {
    classNames: ['project-node'],
    attributes: {
      href: project.url,
      target: '_blank',
      rel: 'noopener noreferrer',
      'data-project-id': project.id,
    },
  });

  node.append(
    createElement('span', {
      classNames: ['project-node__label'],
      text: project.title,
    }),
    createElement('span', {
      classNames: ['project-node__chevron'],
      text: '›',
      attributes: { 'aria-hidden': 'true' },
    }),
  );

  return node;
}
