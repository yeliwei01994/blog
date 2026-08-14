import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('production build', () => {
  it('emits a GitHub Pages React application shell', () => {
    const index = fs.readFileSync('dist/index.html', 'utf8');

    expect(fs.existsSync('dist/404.html')).toBe(true);
    expect(index).toContain('id="root"');
    expect(index).toContain('/blog/assets/');
  });
});
