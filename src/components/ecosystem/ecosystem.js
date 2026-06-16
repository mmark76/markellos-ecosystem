import './ecosystem.css';
import { getCircleLayout, saveCirclePosition } from '../../services/circle-layout-service.js';
import { createElement } from '../../utils/dom.js';
import { createProjectNode } from '../project-node/project-node.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const connectionEdges = {
  blogs: [
    ['core', 'personal-thoughts-and-writings', 'primary'],
    ['core', 'chess-reflections', 'primary'],
    ['core', 'mnemonic-techniques', 'primary'],
    ['core', 'markellos-chess-mnemonic-system', 'primary'],
  ],
  apps: [
    ['core', 'organize-your-pc', 'primary'],
    ['core', 'memory-palaces', 'primary'],
    ['core', 'chess-flashcards', 'primary'],
    ['core', 'relaxing-sounds', 'primary'],
    ['core', 'chess-pgn-audio-player', 'primary'],
    ['core', 'chessmnemonics', 'primary'],
    ['chessmnemonics', 'chessmnemonics-flashcards', 'secondary'],
    ['chessmnemonics', 'chessmnemonics-forum', 'secondary'],
    ['chessmnemonics', 'chessmnemonics-app', 'secondary'],
  ],
};

function createConnections(groupId) {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.classList.add('ecosystem-hub__connections');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  connectionEdges[groupId].forEach(([source, target, type]) => {
    const path = document.createElementNS(SVG_NAMESPACE, 'path');
    path.classList.add(`ecosystem-hub__connection--${type}`);
    path.dataset.sourceCircle = `${groupId}:${source}`;
    path.dataset.targetCircle = `${groupId}:${target}`;
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(path);
  });

  return svg;
}

function getCircleCenter(circle, hubRect) {
  const rect = circle.getBoundingClientRect();
  return {
    x: ((rect.left + rect.width / 2 - hubRect.left) / hubRect.width) * 100,
    y: ((rect.top + rect.height / 2 - hubRect.top) / hubRect.height) * 100,
  };
}

function updateConnections(hub) {
  const hubRect = hub.getBoundingClientRect();

  if (hubRect.width === 0 || hubRect.height === 0) {
    return;
  }

  hub.querySelectorAll('.ecosystem-hub__connections path').forEach((path) => {
    const source = hub.querySelector(`[data-circle-id="${path.dataset.sourceCircle}"]`);
    const target = hub.querySelector(`[data-circle-id="${path.dataset.targetCircle}"]`);

    if (!source || !target) {
      return;
    }

    const start = getCircleCenter(source, hubRect);
    const end = getCircleCenter(target, hubRect);
    const middleX = (start.x + end.x) / 2;
    const middleY = (start.y + end.y) / 2;

    path.setAttribute(
      'd',
      `M ${start.x} ${start.y} C ${middleX} ${start.y}, ${middleX} ${end.y}, ${end.x} ${end.y}`,
    );

    if (Math.abs(start.x - end.x) < 2) {
      path.setAttribute(
        'd',
        `M ${start.x} ${start.y} C ${start.x} ${middleY}, ${end.x} ${middleY}, ${end.x} ${end.y}`,
      );
    }
  });
}

function applySavedPosition(circle, circleId, layout) {
  const position = layout[circleId];

  if (!position) {
    return;
  }

  circle.style.left = `${position.left}%`;
  circle.style.top = `${position.top}%`;
}

function enableDragging(circle, hub, onMove) {
  let activePointerId = null;
  let moved = false;

  function canDrag(event) {
    const mobileLayout = globalThis.matchMedia?.('(max-width: 45rem)').matches;
    return document.documentElement.dataset.uiPositionMode === 'editable'
      && !mobileLayout
      && event.button === 0;
  }

  function moveCircle(event) {
    if (event.pointerId !== activePointerId) {
      return;
    }

    const hubRect = hub.getBoundingClientRect();
    const pageShell = hub.closest('.page-shell') ?? document.documentElement;
    const dragRect = pageShell.getBoundingClientRect();
    const circleRect = circle.getBoundingClientRect();
    const halfWidth = circleRect.width / 2;
    const halfHeight = circleRect.height / 2;
    const centerX = Math.min(
      dragRect.right - halfWidth,
      Math.max(dragRect.left + halfWidth, event.clientX),
    );
    const centerY = Math.min(
      dragRect.bottom - halfHeight,
      Math.max(dragRect.top + halfHeight, event.clientY),
    );
    const left = ((centerX - hubRect.left) / hubRect.width) * 100;
    const top = ((centerY - hubRect.top) / hubRect.height) * 100;

    circle.style.left = `${left}%`;
    circle.style.top = `${top}%`;
    circle.classList.add('is-dragging');
    moved = true;
    onMove();
  }

  function finishDragging(event) {
    if (event.pointerId !== activePointerId) {
      return;
    }

    activePointerId = null;
    circle.classList.remove('is-dragging');

    if (moved) {
      saveCirclePosition(circle.dataset.circleId, {
        left: Number.parseFloat(circle.style.left),
        top: Number.parseFloat(circle.style.top),
      });
    }
  }

  circle.addEventListener('pointerdown', (event) => {
    if (!canDrag(event)) {
      return;
    }

    event.preventDefault();
    activePointerId = event.pointerId;
    moved = false;
    circle.setPointerCapture?.(event.pointerId);
  });

  circle.addEventListener('pointermove', moveCircle);
  circle.addEventListener('pointerup', finishDragging);
  circle.addEventListener('pointercancel', finishDragging);

  if (circle.matches('a')) {
    circle.addEventListener('click', (event) => {
      if (document.documentElement.dataset.uiPositionMode === 'editable') {
        event.preventDefault();
      }
    });
  }
}

function createHub(group) {
  const hub = createElement('article', {
    classNames: ['ecosystem-hub', `ecosystem-hub--${group.id}`],
  });

  const core = createElement('div', {
    classNames: ['ecosystem-hub__core'],
    attributes: {
      'data-circle-id': `${group.id}:core`,
      'aria-label': `${group.title} central circle`,
    },
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

  const projectNodes = group.projects.map((project) => {
    const node = createProjectNode(project);
    node.dataset.circleId = `${group.id}:${project.id}`;
    return node;
  });

  const connections = createConnections(group.id);
  const circles = [core, ...projectNodes];
  const savedLayout = getCircleLayout();

  circles.forEach((circle) => {
    applySavedPosition(circle, circle.dataset.circleId, savedLayout);
  });

  hub.append(connections, core, ...projectNodes);

  const refreshConnections = () => updateConnections(hub);
  circles.forEach((circle) => enableDragging(circle, hub, refreshConnections));

  globalThis.requestAnimationFrame?.(refreshConnections);
  globalThis.addEventListener?.('resize', refreshConnections);
  globalThis.addEventListener?.('markellos:ui-settings-changed', () => {
    globalThis.requestAnimationFrame?.(refreshConnections);
  });
  globalThis.addEventListener?.('markellos:circle-layout-reset', () => {
    circles.forEach((circle) => {
      circle.style.removeProperty('left');
      circle.style.removeProperty('top');
    });
    globalThis.requestAnimationFrame?.(refreshConnections);
  });

  const ResizeObserverConstructor = globalThis.ResizeObserver;
  if (ResizeObserverConstructor) {
    const observer = new ResizeObserverConstructor(refreshConnections);
    observer.observe(hub);
  }

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
