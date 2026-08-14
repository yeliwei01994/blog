import { BaseLayout } from '../components/BaseLayout';
import { diaryArticles } from '../../generated/diary';
import { DiaryCard } from '../../features/diary/components/DiaryCard';

export function DiaryIndexPage() {
  return <BaseLayout title="日记" description="叶厉为的个人日记。"><header className="page-hero shell"><h1>Diary</h1><p>记录学习、实践和阶段性思考。</p></header><section className="shell content-section"><div className="post-grid">{diaryArticles.map((entry, index) => <DiaryCard key={entry.id} entry={entry} index={index} />)}</div></section></BaseLayout>;
}
