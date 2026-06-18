import './project-node.css';
import './project-node-overrides.css';
import { createElement } from '../../utils/dom.js';

const PROJECT_LABEL_LINES = Object.freeze({
  'personal-thoughts-and-writings': ['Personal', 'Thoughts and', 'Writings'],
  'chess-reflections': ['Chess', 'Reflections'],
  'mnemonic-techniques': ['Mnemonic', 'Techniques'],
  'organize-your-pc': ['Organize', 'Your PC'],
  'memory-palaces': ['Memory Palaces', 'Builder'],
  'chess-flashcards': ['Chess Positions', 'Flashcards'],
  'relaxing-sounds': ['Relaxing', 'Sounds'],
  'chess-pgn-audio-player': ['Chess PGN', 'Audio Player'],
  chessmnemonics: ['Chess Mnemonics', 'Home Page'],
  'chessmnemonics-flashcards': ['Chess Mnemonics', 'Memory Palaces', 'Trainer'],
  'chessmnemonics-forum': ['Chess Mnemonics', 'Forum'],
  'chessmnemonics-app': ['Chess Mnemonics', 'App'],
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
