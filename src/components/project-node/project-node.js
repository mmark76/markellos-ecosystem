import './project-node.css';
import { createElement } from '../../utils/dom.js';

const PROJECT_LABEL_LINES = Object.freeze({
  'personal-thoughts-and-writings': ['Personal', 'Thoughts and', 'Writings'],
});

function createProjectLabel(project) {
  const label = createElement('span', {
    classNames: ['project-node__label'],
    attributes: { 'aria-label': project.title },
  });
  const lines = PROJECT_LABEL_LINES[project.id];

  if (!lines) {
    label.textContent = project.title;
    return label;
  }

  lines.forEach((line) => {
    label.append(
      createElement('span', {
        classNames: ['project-node__label-line'],
        text: line,
      }),
    );
  });

  return label;
}

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

  node.append(createProjectLabel(project));

  return node;
}
