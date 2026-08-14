import { NavLink } from 'react-router-dom';
import { SITE } from '../site-config';
import { withBase } from '../site-url';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader() {
  return <header className="site-header shell"><NavLink className="brand" to="/" aria-label={`${SITE.title} 首页`}>YE<span>/</span>blog</NavLink><nav className="site-nav" aria-label="主导航">{SITE.nav.map((item) => <NavLink key={item.href} to={item.href} end={item.href === '/'}>{item.label}</NavLink>)}</nav><div className="header-actions"><ThemeToggle /></div></header>;
}
