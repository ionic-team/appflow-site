import Router from '../router';

export const handleRoutableLinkClick = (e: MouseEvent) => {
  if (e.metaKey || e.ctrlKey) {
    return;
  }

  if (e && (e.which == 2 || e.button == 4)) {
    return;
  }

  if ((e.target as HTMLElement).tagName === 'A') {
    const href = (e.target as HTMLAnchorElement).href;
    const u = new URL(href);
    if (u.origin === window.location.origin) {
      e.stopPropagation();
      e.preventDefault();
      Router.push(u.pathname);
    }
  }
}