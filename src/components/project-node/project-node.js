import './project-node.css';
import { createElement } from '../../utils/dom.js';

export function createProjectNode(project) {
  const node = createElement('a', {
    classNames: ['project-node', `project-node--${project.position}`],
    attributes: {
      href: project.url,
      target: '_blank',
      rel: 'noopener noreferrer',
      'data-project-id': project.id,
    },
  });

  node.append(
    createElement('span', {
      classNames: ['project-node__icon'],
      text: project.icon,
      attributes: { 'aria-hidden': 'true' },
    }),
    createElement('span', {
      classNames: ['project-node__label'],
      text: project.title,
    }),
  );

  return node;
}
