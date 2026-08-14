import { Link, useParams } from 'react-router-dom';
import { diaryArticles } from '../../generated/diary';
import { getAdjacentEntries } from '../../features/diary/diary-utils';
import { BaseLayout } from '../components/BaseLayout';
import { NotFoundPage } from './NotFoundPage';

export function DiaryArticlePage() {
  const { id } = useParams();
  const entry = diaryArticles.find((article) => article.id === id);
  if (!entry) return <NotFoundPage />;
  const { previous, next } = getAdjacentEntries(diaryArticles, entry.id);
  return <BaseLayout title={entry.title} description={entry.description}><header className="article-header shell"><div className="article-header__content"><p className="eyebrow">日记 · {new Intl.DateTimeFormat('zh-CN').format(new Date(entry.publishedAt))}</p><h1>{entry.title}</h1><p className="article-summary">{entry.description}</p></div></header><div className="article-reading-shell shell"><div className="article-toc">{entry.headings.length > 0 && <nav className="toc" aria-label="文章目录"><p className="eyebrow">On this page</p><ul>{entry.headings.map((heading) => <li key={heading.slug} style={{ paddingLeft: heading.depth === 3 ? '1rem' : undefined }}><a href={`#${heading.slug}`}>{heading.text}</a></li>)}</ul></nav>}</div><article className="article-body" dangerouslySetInnerHTML={{ __html: entry.html }} /></div><nav className="article-nav shell" aria-label="相邻日记">{previous ? <Link to={`/diary/${previous.id}/`}><span>较新一篇</span><strong>{previous.title}</strong></Link> : <span />}{next ? <Link to={`/diary/${next.id}/`}><span>较早一篇</span><strong>{next.title}</strong></Link> : <span />}</nav></BaseLayout>;
}
