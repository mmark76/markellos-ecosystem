import './footer.css';
import { createElement } from '../../utils/dom.js';

const SITE_VERSION = import.meta.env?.VITE_MARKELLOS_VERSION ?? 'version_development';

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
    attributes: { 'aria-label': 'Footer links and preferences' },
  });

  const cookiePreferencesButton = createElement('button', {
    classNames: ['site-footer__link', 'site-footer__button'],
    text: 'Cookie preferences',
    attributes: { type: 'button' },
  });

  const version = createElement('p', {
    classNames: ['site-footer__version'],
    text: SITE_VERSION,
    attributes: { 'aria-label': `Site version ${SITE_VERSION}` },
  });

  cookiePreferencesButton.addEventListener('click', () => {
    globalThis.dispatchEvent?.(new globalThis.Event('markellos:open-cookie-preferences'));
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
    cookiePreferencesButton,
  );

  footer.append(copyright, navigation, version);
  return footer;
}
