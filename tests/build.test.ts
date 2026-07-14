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
    const layout = fs.readFileSync(path.resolve('src/components/CodeCopyButton.astro'), 'utf8');
    const styles = fs.readFileSync(path.resolve('src/styles/editorial.css'), 'utf8');

    expect(layout).toContain('code-window');
    expect(layout).toContain('PLAINTEXT');
    expect(layout).toContain('dataset.language');
    expect(styles).toContain('.code-window__title');
    expect(styles).toContain('counter-reset: code-line');
  });
});
