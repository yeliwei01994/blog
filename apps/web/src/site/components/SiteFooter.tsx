import { Link } from 'react-router-dom';
import { SITE } from '../site-config';

export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-grid"><div><p className="footer-title">YE / blog</p><p className="footer-description">记录学习、工作与项目实践。</p></div><div><p className="eyebrow">导航</p><ul className="footer-list">{SITE.nav.map((item) => <li key={item.href}><Link to={item.href}>{item.label}</Link></li>)}</ul></div><div><p className="eyebrow">链接</p><ul className="footer-list">{SITE.social.map((item) => <li key={item.href}><a href={item.href} target="_blank" rel="noreferrer">{item.label}</a></li>)}</ul></div></div><div className="shell footer-meta"><span>© {new Date().getFullYear()} {SITE.author}</span><span>Built with React / Published as static HTML</span></div></footer>;
}
