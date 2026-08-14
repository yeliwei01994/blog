import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Guestbook } from '../src/features/guestbook/Guestbook';

describe('Guestbook', () => {
  it('loads messages from the existing API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 1, name: '叶厉为', message: '你好', createdAt: '2026-08-14T00:00:00Z' }] }));
    render(<Guestbook apiBaseUrl="https://api.example.com" />);
    expect(await screen.findByText('你好')).toBeInTheDocument();
  });
});
