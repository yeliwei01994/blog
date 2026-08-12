import { describe, expect, it } from 'vitest';
import { listMessages } from './messages.js';

describe('listMessages', () => {
  it('returns guestbook rows in the public API shape', async () => {
    const db = {
      query: async () => ({
        rows: [{ id: 1, name: '测试用户', message: '你好', created_at: new Date('2026-07-14T07:28:50.507Z') }],
      }),
    };

    await expect(listMessages(db)).resolves.toEqual([
      { id: 1, name: '测试用户', message: '你好', createdAt: '2026-07-14T07:28:50.507Z' },
    ]);
  });
});
