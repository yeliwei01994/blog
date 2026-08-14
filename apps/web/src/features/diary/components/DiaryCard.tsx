import { Link } from 'react-router-dom';
import type { DiaryArticle } from '../diary-types';
import { withBase } from '../../../site/site-url';

export function DiaryCard({ entry, index }: { entry: DiaryArticle; index: number }) {
  return <article className={`post-card${index === 0 ? ' post-card--featured' : ''}`}>{entry.cover && <div className="post-card__image"><img src={withBase(entry.cover)} alt="" width="1600" height="900" loading={index > 1 ? 'lazy' : 'eager'} /></div>}<div className="post-card__meta"><time dateTime={entry.publishedAt}>{new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(entry.publishedAt))}</time></div><h3><Link to={`/diary/${entry.id}/`}>{entry.title}</Link></h3><p>{entry.description}</p></article>;
}
