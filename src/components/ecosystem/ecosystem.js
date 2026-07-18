import './ecosystem.css';
import { createElement } from '../../utils/dom.js';
import { createProjectNode } from '../project-node/project-node.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function createConnections(groups) {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.classList.add('ecosystem-360__connections');
  svg.setAttribute('aria-hidden', 'true');

  groups.forEach((group) => {
    const path = document.createElementNS(SVG_NAMESPACE, 'path');
    path.dataset.categoryId = group.id;
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(path);
  });

  return svg;
}

function getElementCenter(element, containerRect) {
  const rect = element.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2 - containerRect.left,
    y: rect.top + rect.height / 2 - containerRect.top,
  };
}

function updateConnections(stage) {
  const stageRect = stage.getBoundingClientRect();
  const core = stage.querySelector('.ecosystem-360__core');
  const svg = stage.querySelector('.ecosystem-360__connections');

  if (!core || !svg || stageRect.width === 0 || stageRect.height === 0) {
    return;
  }

  svg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);
  const start = getElementCenter(core, stageRect);

  svg.querySelectorAll('path').forEach((path) => {
    const card = stage.querySelector(`[data-category-id="${path.dataset.categoryId}"]`);

    if (!card) {
      return;
    }

    const end = getElementCenter(card, stageRect);
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;

    path.setAttribute(
      'd',
      `M ${start.x} ${start.y} C ${start.x + deltaX * 0.38} ${start.y + deltaY * 0.12}, ${start.x + deltaX * 0.72} ${start.y + deltaY * 0.88}, ${end.x} ${end.y}`,
    );
  });
}

function createCategoryCard(group, index) {
  const card = createElement('article', {
    classNames: [
      'ecosystem-card',
      `ecosystem-card--${group.id}`,
      `ecosystem-card--slot-${index + 1}`,
    ],
    attributes: {
      'aria-labelledby': `${group.id}-title`,
      'data-category-id': group.id,
    },
  });

  const heading = createElement('div', {
    classNames: ['ecosystem-card__heading'],
  });

  heading.append(
    createElement('span', {
      classNames: ['ecosystem-card__icon'],
      text: group.icon,
      attributes: { 'aria-hidden': 'true' },
    }),
    createElement('div', {
      classNames: ['ecosystem-card__heading-copy'],
      children: [
        createElement('p', {
          classNames: ['ecosystem-card__index'],
          text: `Category ${String(index + 1).padStart(2, '0')}`,
        }),
        createElement('h3', {
          classNames: ['ecosystem-card__title'],
          text: group.title,
          attributes: { id: `${group.id}-title` },
        }),
      ],
    }),
    createElement('span', {
      classNames: ['ecosystem-card__count'],
      text: String(group.projects.length).padStart(2, '0'),
      attributes: {
        'aria-label': `${group.projects.length} ${group.projects.length === 1 ? 'project' : 'projects'}`,
      },
    }),
  );

  const projects = createElement('ul', {
    classNames: ['ecosystem-card__projects'],
  });
  projects.append(...group.projects.map(createProjectNode));

  card.append(
    heading,
    createElement('p', {
      classNames: ['ecosystem-card__description'],
      text: group.description,
    }),
    projects,
  );

  return card;
}

function createCore(groups) {
  const projectCount = groups.reduce((total, group) => total + group.projects.length, 0);
  const core = createElement('div', {
    classNames: ['ecosystem-360__core'],
    attributes: { 'aria-label': 'Markellos Ecosystem overview' },
  });

  core.append(
    createElement('p', {
      classNames: ['ecosystem-360__core-eyebrow'],
      text: 'Markellos',
    }),
    createElement('p', {
      classNames: ['ecosystem-360__core-title'],
      text: 'Ecosystem',
    }),
    createElement('span', {
      classNames: ['ecosystem-360__degree'],
      text: '360°',
      attributes: { 'aria-hidden': 'true' },
    }),
    createElement('div', {
      classNames: ['ecosystem-360__metrics'],
      children: [
        createElement('span', {
          classNames: ['ecosystem-360__metric'],
          text: `${groups.length} categories`,
        }),
        createElement('span', {
          classNames: ['ecosystem-360__metric'],
          text: `${projectCount} projects`,
        }),
      ],
    }),
  );

  return core;
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
      text: 'Complete ecosystem view',
    }),
    createElement('h2', {
      classNames: ['ecosystem__title'],
      text: 'Everything connected',
      attributes: { id: 'ecosystem-title' },
    }),
    createElement('p', {
      classNames: ['ecosystem__description'],
      text: 'Six categories arranged around one central hub, with every project directly accessible.',
    }),
  );

  const stage = createElement('div', {
    classNames: ['ecosystem-360'],
  });
  const connections = createConnections(groups);
  const core = createCore(groups);
  const cards = groups.map(createCategoryCard);

  stage.append(connections, core, ...cards);
  section.append(introduction, stage);

  const refreshConnections = () => updateConnections(stage);
  globalThis.requestAnimationFrame?.(refreshConnections);
  globalThis.addEventListener?.('resize', refreshConnections);
  globalThis.addEventListener?.('markellos:ui-settings-changed', () => {
    globalThis.requestAnimationFrame?.(refreshConnections);
  });

  const ResizeObserverConstructor = globalThis.ResizeObserver;
  if (ResizeObserverConstructor) {
    const observer = new ResizeObserverConstructor(refreshConnections);
    observer.observe(stage);
  }

  return section;
}
