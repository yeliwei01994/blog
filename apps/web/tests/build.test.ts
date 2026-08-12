import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('production build', () => {
  for (const file of [
    'dist/index.html',
    'dist/diary/index.html',
    'dist/about/index.html',
    'dist/404.html',
  ]) {
    it(`emits ${file}`, () => expect(fs.existsSync(file)).toBe(true));
  }
});

describe('diary code windows', () => {
  it('defines the window structure and plaintext fallback', () => {
    const layout = fs.readFileSync(path.resolve('src/features/diary/components/CodeCopyButton.astro'), 'utf8');
    const styles = fs.readFileSync(path.resolve('src/styles/editorial.css'), 'utf8');

    expect(layout).toContain('code-window');
    expect(layout).toContain('PLAINTEXT');
    expect(layout).toContain('dataset.language');
    expect(styles).toContain('.code-window__title');
    expect(styles).toContain('counter-reset: code-line');
  });
});

describe('diary reading layout', () => {
  it('emits a focused diary reading layout without the decorative aside', () => {
    const html = fs.readFileSync(path.resolve('dist/diary/2026-08-09-compute-research-and-go/index.html'), 'utf8');
    expect(html).toContain('article-header');
    expect(html).toContain('article-reading-shell');
    expect(html).toContain('article-toc');
    expect(html).not.toContain('article-aside');
    expect(html).not.toContain('PERSONAL NOTE');
    expect(html.match(/>8\/3-8\/9 工作与学习记录</g)).toHaveLength(1);
  });
});

describe('guestbook page semantics', () => {
  it('emits exactly one main landmark', () => {
    const html = fs.readFileSync(path.resolve('dist/guestbook/index.html'), 'utf8');
    expect(html.match(/<main\b/g)).toHaveLength(1);
  });
});

describe('modern home surface', () => {
  it('emits the quiet visual hero panel', () => {
    const html = fs.readFileSync(path.resolve('dist/index.html'), 'utf8');
    expect(html).toContain('hero-panel');
  });

  it('keeps the home introduction as an open two-column section', () => {
    const html = fs.readFileSync(path.resolve('dist/index.html'), 'utf8');
    expect(html).not.toContain('about-card');
    expect(html).toContain('写在这里');
    expect(html).toContain('把工作中的思考、学习中的收获和项目里的经验，整理成可以回看的记录。');
    expect(html).toContain('查看关于页 →');
  });

  it('keeps the hero focused on its main title', () => {
    const html = fs.readFileSync(path.resolve('dist/index.html'), 'utf8');
    expect(html).toContain('记录学习、工作与项目实践');
    expect(html).not.toContain('叶厉为的技术日记');
    expect(html).not.toContain('记录技术学习、工作复盘和项目实践。');
    expect(html).not.toContain('Building in public.');
    expect(html).not.toContain('Keep making notes.');
  });
});

describe('guestbook form accessibility', () => {
  it('emits visible labels for message fields', () => {
    const html = fs.readFileSync(path.resolve('dist/guestbook/index.html'), 'utf8');
    expect(html).toContain('for="guestbook-name"');
    expect(html).toContain('for="guestbook-message"');
  });
});
