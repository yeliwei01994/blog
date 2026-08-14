import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../src/app/App';

describe('diary article route', () => {
  beforeEach(() => { document.body.innerHTML = ''; window.history.replaceState(null, '', '/diary/2026-08-14/'); });

  it('renders generated article content and its table of contents', () => {
    render(<App />);
    expect(screen.getByRole('article')).toHaveTextContent('项目结构、Docker 与 Rust 的理解');
    expect(screen.getByRole('navigation', { name: '文章目录' })).toBeInTheDocument();
    expect(document.querySelector('.code-window')).toBeInTheDocument();
  });

  it('opens diary-body links in a new safe tab', () => {
    render(<App />);
    const link = document.querySelector('.article-body a');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
