import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Guestbook } from '../src/features/guestbook/Guestbook';

describe('Guestbook', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  it('loads messages from the existing API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 1, name: '叶厉为', message: '你好', createdAt: '2026-08-14T00:00:00Z' }] }));
    render(<Guestbook apiBaseUrl="https://api.example.com" />);
    expect(await screen.findByText('你好')).toBeInTheDocument();
  });

  it('submits a message to the existing API', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => [] }).mockResolvedValueOnce({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<Guestbook apiBaseUrl="https://api.example.com" />);
    await user.type(screen.getByLabelText('你的名字'), '叶厉为');
    await user.type(screen.getByLabelText('留言内容'), '你好');
    await user.click(screen.getByRole('button', { name: '提交留言' }));
    expect(await screen.findByText('留言已提交。刷新页面即可看到。')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith('https://api.example.com/api/messages', expect.objectContaining({ method: 'POST' }));
  });
});
