import { FormEvent, useEffect, useState } from 'react';
import './guestbook.css';

export interface GuestbookMessage { id: number; name: string; message: string; createdAt: string; }
export function createMessagesUrl(apiBaseUrl: string) { return `${apiBaseUrl.replace(/\/+$/, '')}/api/messages`; }

export function Guestbook({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [status, setStatus] = useState('正在加载留言……');
  const [formStatus, setFormStatus] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { fetch(createMessagesUrl(apiBaseUrl)).then(async r => { if (!r.ok) throw new Error(); return r.json() as Promise<GuestbookMessage[]>; }).then(items => { setMessages(items); setStatus(items.length ? '' : '还没有留言。'); }).catch(() => setStatus('暂时无法加载留言，请确认本地 API 正在运行。')); }, [apiBaseUrl]);
  async function submit(event: FormEvent) { event.preventDefault(); setFormStatus('正在提交……'); try { const response = await fetch(createMessagesUrl(apiBaseUrl), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, message }) }); if (!response.ok) throw new Error(); setName(''); setMessage(''); setFormStatus('留言已提交。刷新页面即可看到。'); } catch { setFormStatus('提交失败，请稍后再试。'); } }
  return <section className="messages-panel" aria-live="polite"><form className="message-form" onSubmit={submit}><div className="message-field"><label htmlFor="guestbook-name">你的名字</label><input id="guestbook-name" value={name} onChange={e => setName(e.target.value)} maxLength={80} required /></div><div className="message-field"><label htmlFor="guestbook-message">留言内容</label><textarea id="guestbook-message" value={message} onChange={e => setMessage(e.target.value)} maxLength={2000} required /></div><button type="submit">提交留言</button><p className="form-status">{formStatus}</p></form><p>{status}</p><div className="messages-list">{messages.map(item => <article className="message-card" key={item.id}><div className="message-card__meta"><strong>{item.name}</strong><time>{new Date(item.createdAt).toLocaleString()}</time></div><p>{item.message}</p></article>)}</div></section>;
}
