import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('design system', () => {
  it('defines semantic tokens and accessibility fallbacks', () => {
    const css = fs.readFileSync('src/styles/global.css', 'utf8');
    expect(css).toContain('--color-accent:');
    expect(css).toContain(':focus-visible');
    expect(css).toContain('prefers-reduced-motion');
    expect(css).toContain('[data-theme="dark"]');
  });
});
