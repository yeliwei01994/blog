import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { SITE } from '../../site/site-config';
import { SiteFooter } from '../../site/components/SiteFooter';
import { SiteHeader } from '../../site/components/SiteHeader';

interface Props { title?: string; description?: string; children: ReactNode; }
export function BaseLayout({ title = SITE.title, description = SITE.description, children }: Props) {
  useEffect(() => { document.title = title === SITE.title ? title : `${title} — ${SITE.title}`; document.querySelector('meta[name="description"]')?.setAttribute('content', description); }, [title, description]);
  return <><a className="skip-link" href="#main-content">跳到正文</a><SiteHeader /><main id="main-content">{children}</main><SiteFooter /></>;
}
