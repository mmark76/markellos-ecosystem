import './about-link.css';
import { createElement } from '../../utils/dom.js';

export function createAboutLink() {
  return createElement('a', {
    classNames: ['about-link'],
    text: 'About Markellos',
    attributes: {
      href: '/about/',
      'aria-label': 'Open the Markellos profile page',
    },
  });
}
