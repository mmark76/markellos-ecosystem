import './footer.css';
import { createElement } from '../../utils/dom.js';

export function createFooter() {
  const footer = createElement('footer', {
    classNames: ['site-footer'],
  });

  const copyright = createElement('p', {
    classNames: ['site-footer__copyright'],
    text: `© ${new Date().getFullYear()} Markellos Markides. All rights reserved.`,
  });

  const navigation = createElement('nav', {
    classNames: ['site-footer__navigation'],
    attributes: { 'aria-label': 'Legal information' },
  });

  navigation.append(
    createElement('a', {
      classNames: ['site-footer__link'],
      text: 'Privacy',
      attributes: { href: '/privacy/' },
    }),
    createElement('a', {
      classNames: ['site-footer__link'],
      text: 'Cookies',
      attributes: { href: '/cookies/' },
    }),
  );

  footer.append(copyright, navigation);
  return footer;
}
