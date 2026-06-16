import './ecosystem.css';
import { createElement } from '../../utils/dom.js';
import { createProjectNode } from '../project-node/project-node.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const connectionPaths = {
  blogs: [
    { type: 'primary', d: 'M 50 44 C 50 32, 50 22, 50 12' },
    { type: 'primary', d: 'M 50 44 C 36 44, 24 44, 14 44' },
    { type: 'primary', d: 'M 50 44 C 64 44, 76 44, 86 44' },
    { type: 'primary', d: 'M 50 44 C 50 56, 50 67, 50 76' },
  ],
  apps: [
    { type: 'primary', d: 'M 50 44 C 43 30, 35 20, 28 12' },
    { type: 'primary', d: 'M 50 44 C 57 30, 65 20, 72 12' },
    { type: 'primary', d: 'M 50 44 C 35 44, 22 44, 10 44' },
    { type: 'primary', d: 'M 50 44 C 65 44, 78 44, 90 44' },
    { type: 'primary', d: 'M 50 44 C 43 55, 33 64, 24 70' },
    { type: 'primary', d: 'M 50 44 C 56 53, 62 59, 65 64' },
    { type: 'secondary', d: 'M 65 64 C 61 75, 53 84, 44 91' },
    { type: 'secondary', d: 'M 65 64 C 65 75, 65 84, 65 91' },
    { type: 'secondary', d: 'M 65 64 C 70 75, 78 84, 86 91' },
  ],
};

const junctionPoints = {
  blogs: [],
  apps: [{ x: 65, y: 72 }],
};

function createConnections(groupId) {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.classList.add('ecosystem-hub__connections');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  connectionPaths[groupId].forEach(({ type, d }) => {
    const path = document.createElementNS(SVG_NAMESPACE, 'path');
    path.classList.add(`ecosystem-hub__connection--${type}`);
    path.setAttribute('d', d);
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(path);
  });

  junctionPoints[groupId].forEach(({ x, y }) => {
    const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
    circle.classList.add('ecosystem-hub__connection-joint');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '0.7');
    circle.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(circle);
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
    createElement('span', {
      classNames: ['ecosystem-hub__ornament'],
      attributes: { 'aria-hidden': 'true' },
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

  section.append(createHub(groups[0]), createHub(groups[1]));
  return section;
}
