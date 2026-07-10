export function withBase(path: string, base = import.meta.env.BASE_URL): string {
  const normalizedBase = base === '/' ? '/' : `/${base.replace(/^\/+|\/+$/g, '')}/`;
  const normalizedPath = `/${path.replace(/^\/+/, '')}`;

  if (normalizedBase !== '/' && normalizedPath.startsWith(normalizedBase)) return normalizedPath;
  return normalizedBase === '/' ? normalizedPath : `${normalizedBase}${normalizedPath.slice(1)}`;
}
