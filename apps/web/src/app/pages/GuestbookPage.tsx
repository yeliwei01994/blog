import { BaseLayout } from '../components/BaseLayout';
import { Guestbook } from '../../features/guestbook/Guestbook';
export function GuestbookPage() { return <BaseLayout title="Guestbook" description="来自 PostgreSQL 的留言板"><section className="shell guestbook-page"><header className="page-hero"><p className="eyebrow">PostgreSQL practice</p><h1>Guestbook</h1><p>这些留言来自独立 API，再由 API 从 PostgreSQL 读取。</p></header><Guestbook apiBaseUrl={import.meta.env.VITE_GUESTBOOK_API_BASE_URL ?? 'http://localhost:3000'} /></section></BaseLayout>; }
