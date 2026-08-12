import { describe, expect, it } from 'vitest';
import { createServer } from './server.js';

describe('API server', () => {
  it('returns messages from GET /api/messages', async () => {
    const server = createServer({
      query: async () => ({ rows: [{ id: 1, name: '小明', message: '学习中', created_at: new Date('2026-07-14T08:00:00.000Z') }] }),
    });
    const address = await new Promise<string>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${(server.address() as { port: number }).port}`));
    });

    const response = await fetch(`${address}/api/messages`);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      { id: 1, name: '小明', message: '学习中', createdAt: '2026-07-14T08:00:00.000Z' },
    ]);
    server.close();
  });

  it('returns 404 for an unknown route', async () => {
    const server = createServer({ query: async () => ({ rows: [] }) });
    const address = await new Promise<string>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${(server.address() as { port: number }).port}`));
    });

    const response = await fetch(`${address}/unknown`);
    expect(response.status).toBe(404);
    server.close();
  });

  it('creates a message from POST /api/messages', async () => {
    const server = createServer({ query: async (_sql, values) => ({ rows: [{ id: 2, name: values?.[0] ?? '', message: values?.[1] ?? '', created_at: new Date('2026-07-14T09:00:00.000Z') }] }) });
    const address = await new Promise<string>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${(server.address() as { port: number }).port}`));
    });
    const response = await fetch(`${address}/api/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '新用户', message: '新留言' }) });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ name: '新用户', message: '新留言' });
    server.close();
  });
});
