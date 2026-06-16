import './ecosystem.css';
import { createElement } from '../../utils/dom.js';
import { createProjectNode } from '../project-node/project-node.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const connectionPaths = {
  blogs: [
    { type: 'primary', d: 'M 50 38 C 50 28, 50 19, 50 10' },
    { type: 'primary', d: 'M 50 38 C 38 38, 25 38, 14 38' },
    { type: 'primary', d: 'M 50 38 C 62 38, 75 38, 86 38' },
    { type: 'primary', d: 'M 50 38 C 50 48, 50 58, 50 67' },
  ],
  apps: [
    { type: 'primary', d: 'M 50 38 C 43 25, 35 16, 28 10' },
    { type: 'primary', d: 'M 50 38 C 57 25, 65 16, 72 10' },
    { type: 'primary', d: 'M 50 38 C 35 38, 22 38, 10 38' },
    { type: 'primary', d: 'M 50 38 C 65 38, 78 38, 90 38' },
    { type: 'primary', d: 'M 50 38 C 44 50, 34 59, 24 67' },
    { type: 'primary', d: 'M 50 38 C 54 50, 58 59, 62 67' },
    { type: 'secondary', d: 'M 62 67 C 62 77, 40 80, 40 91' },
    { type: 'secondary', d: 'M 62 67 C 62 78, 62 82, 62 91' },
    { type: 'secondary', d: 'M 62 67 C 62 77, 84 80, 84 91' },
  ],
};

const junctionPoints = {
  blogs: [],
  apps: [{ x: 62, y: 75 }],
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

  const bridge = createElement('div', {
    classNames: ['ecosystem__bridge'],
    text: 'M',
    attributes: { 'aria-hidden': 'true' },
  });

  section.append(createHub(groups[0]), bridge, createHub(groups[1]));
  return section;
}
