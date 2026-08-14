const RESTORE_KEY = 'github-pages-path';

export function restoreGitHubPagesPath(base = import.meta.env.BASE_URL): void {
  const requestedPath = window.sessionStorage.getItem(RESTORE_KEY);
  if (!requestedPath) return;

  window.sessionStorage.removeItem(RESTORE_KEY);
  const normalizedBase = base === '/' ? '' : base.replace(/\/$/, '');
  const normalizedPath = requestedPath.startsWith('/') ? requestedPath : `/${requestedPath}`;
  window.history.replaceState(null, '', `${normalizedBase}${normalizedPath}`);
}
