import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../src/app/App';

function renderAt(pathname: string): void {
  window.history.replaceState(null, '', pathname);
  render(<App />);
}

describe('static React routes', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the homepage in one main landmark', () => {
    renderAt('/');

    expect(screen.getByRole('main')).toHaveTextContent('记录学习、工作与项目实践');
    expect(document.querySelectorAll('main')).toHaveLength(1);
  });

  it('renders the diary index', () => {
    renderAt('/diary/');

    expect(screen.getByRole('main')).toHaveTextContent('Diary');
    expect(screen.getByRole('link', { name: '8/14项目结构、Docker 与 Rust 的理解' })).toHaveAttribute('href', '/diary/2026-08-14/');
  });

  it('renders the about page', () => {
    renderAt('/about/');

    expect(screen.getByRole('main')).toHaveTextContent('你好，我是叶厉为');
  });
});
