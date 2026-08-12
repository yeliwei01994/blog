import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('design system', () => {
  it('defines semantic tokens and accessibility fallbacks', () => {
    const css = fs.readFileSync('src/styles/global.css', 'utf8');
    expect(css).toContain('--color-accent:');
    expect(css).toContain('--color-surface:');
    expect(css).toContain('--color-border:');
    expect(css).toContain('--radius-card:');
    expect(css).toContain('--shadow-card:');
    expect(css).toContain(':focus-visible');
    expect(css).toContain('prefers-reduced-motion');
    expect(css).toContain('[data-theme="dark"]');
  });
});

describe('diary reading typography', () => {
  it('uses a left-aligned reading grid with restrained article type scale', () => {
    const styles = fs.readFileSync('src/styles/editorial.css', 'utf8');
    expect(styles).toContain('grid-template-columns: minmax(11rem, 12rem) minmax(0, 48rem)');
    expect(styles).toContain('justify-content: start');
    expect(styles).toContain('clamp(2.25rem, 3.8vw, 3.75rem)');
    expect(styles).toContain('clamp(1.65rem, 2.3vw, 2.35rem)');
    expect(styles).toContain('grid-column: 1 / -1');
    expect(styles).toContain('white-space: nowrap');
    expect(styles).toContain('text-wrap: balance');
    expect(styles).toContain('grid-column: 2 / -1');
    expect(styles).toContain('grid-template-columns: minmax(11rem, 12rem) minmax(0, 1fr)');
  });
});
