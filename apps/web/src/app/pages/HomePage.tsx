import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BaseLayout } from '../components/BaseLayout';
import { diaryArticles } from '../../generated/diary';
import { DiaryCard } from '../../features/diary/components/DiaryCard';

const HOMEPAGE_DIARY_LIMIT = 9;

export function HomePage() {
  const [isDiaryExpanded, setIsDiaryExpanded] = useState(false);
  const visibleDiaryArticles = isDiaryExpanded ? diaryArticles : diaryArticles.slice(0, HOMEPAGE_DIARY_LIMIT);
  const hasMoreDiaryArticles = diaryArticles.length > HOMEPAGE_DIARY_LIMIT;

  return <BaseLayout><section className="hero editorial-grid shell" aria-labelledby="hero-title"><div className="hero-copy"><h1 className="hero-title" id="hero-title">记录学习、工作与项目实践</h1></div><div className="hero-panel" aria-hidden="true"><div className="hero-panel__dots" /><div className="hero-panel__orb" /></div></section><section className="shell content-section section-rule" aria-labelledby="latest-title"><header className="section-head"><div><p className="eyebrow">Personal journal</p><h2 id="latest-title">最近日记</h2></div><Link to="/diary/">查看日记 →</Link></header><div className="post-grid" id="homepage-diary-grid">{visibleDiaryArticles.map((entry, index) => <DiaryCard key={entry.id} entry={entry} index={index} />)}</div>{hasMoreDiaryArticles && <button className="diary-toggle" type="button" aria-controls="homepage-diary-grid" aria-expanded={isDiaryExpanded} onClick={() => setIsDiaryExpanded((expanded) => !expanded)}>{isDiaryExpanded ? '收起日记 ↑' : '展开更多日记 ↓'}</button>}</section><section className="shell content-section section-rule about-grid home-introduction" aria-labelledby="home-about-title"><p className="eyebrow" id="home-about-title">写在这里</p><div className="home-introduction__content"><p>把工作中的思考、学习中的收获和项目里的经验，整理成可以回看的记录。</p><Link to="/about/">查看关于页 →</Link></div></section></BaseLayout>;
}
