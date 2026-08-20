import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../src/generated/diary', () => ({
  diaryArticles: Array.from({ length: 10 }, (_, index) => ({
    id: `entry-${index}`,
    title: `日记 ${index + 1}`,
    description: '日记摘要',
    publishedAt: `2026-08-${String(20 - index).padStart(2, '0')}`,
    draft: false,
    cover: undefined,
    html: '',
    headings: [],
  })),
}));

import { HomePage } from '../src/app/pages/HomePage';

describe('homepage diary list', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('collapses diary entries after the first three rows and can expand them', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><HomePage /></MemoryRouter>);

    expect(screen.getAllByRole('article')).toHaveLength(9);
    expect(screen.getByRole('button', { name: /展开更多日记/ })).toHaveAttribute('aria-expanded', 'false');

    await user.click(screen.getByRole('button', { name: /展开更多日记/ }));

    expect(screen.getAllByRole('article')).toHaveLength(10);
    expect(screen.getByRole('button', { name: /收起日记/ })).toHaveAttribute('aria-expanded', 'true');
  });
});
