import './ecosystem.css';
import { createElement } from '../../utils/dom.js';
import { createProjectNode } from '../project-node/project-node.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const connectionPoints = {
  blogs: [
    [50, 38, 50, 67],
    [50, 67, 14, 91],
    [50, 67, 38, 91],
    [50, 67, 62, 91],
    [50, 67, 86, 91],
  ],
  apps: [
    [50, 38, 28, 10],
    [50, 38, 72, 10],
    [50, 38, 10, 38],
    [50, 38, 90, 38],
    [50, 38, 24, 67],
    [50, 38, 62, 67],
    [62, 67, 40, 91],
    [62, 67, 62, 91],
    [62, 67, 84, 91],
  ],
};

function createConnections(groupId) {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.classList.add('ecosystem-hub__connections');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  connectionPoints[groupId].forEach(([x1, y1, x2, y2], index) => {
    const line = document.createElementNS(SVG_NAMESPACE, 'line');
    const isSecondaryConnection =
      (groupId === 'blogs' && index >= 1) || (groupId === 'apps' && index >= 6);

    line.classList.add(
      isSecondaryConnection
        ? 'ecosystem-hub__connection--secondary'
        : 'ecosystem-hub__connection--primary',
    );
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(line);
  });

  return svg;
}

function createHub(group) {
  const hub = createElement('article', {
    classNames: ['ecosystem-hub', `ecosystem-hub--${group.id}`],
  });

  const core = createElement('div', {
    classNames: ['ecosystem-hub__core'],
  });

  core.append(
    createElement('span', {
      classNames: ['ecosystem-hub__icon'],
      text: group.icon,
      attributes: { 'aria-hidden': 'true' },
    }),
    createElement('h2', {
      classNames: ['ecosystem-hub__title'],
      text: group.title,
    }),
    createElement('p', {
      classNames: ['ecosystem-hub__description'],
      text: group.description,
    }),
  );

  hub.append(createConnections(group.id), core, ...group.projects.map(createProjectNode));
  return hub;
}

export function createEcosystem(groups) {
  const section = createElement('section', {
    classNames: ['ecosystem'],
    attributes: { 'aria-label': 'Markellos ecosystem links' },
  });

  const bridge = createElement('div', {
    classNames: ['ecosystem__bridge'],
    text: 'M',
    attributes: { 'aria-hidden': 'true' },
  });

  section.append(createHub(groups[0]), bridge, createHub(groups[1]));
  return section;
}
