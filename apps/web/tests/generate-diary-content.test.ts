import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { generateDiaryContent, isMainModule } from '../scripts/generate-diary-content';

const temporaryDirectories: string[] = [];

function createFixtureDirectory(): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'react-diary-'));
  temporaryDirectories.push(directory);
  return directory;
}

function writeDiary(directory: string, filename: string, content: string): void {
  fs.writeFileSync(path.join(directory, filename), content, 'utf8');
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('generateDiaryContent', () => {
  it('recognizes the TypeScript script when invoked through its relative command path', () => {
    const scriptPath = path.resolve('scripts/generate-diary-content.ts');
    const scriptUrl = new URL(`file:///${scriptPath.replace(/\\/g, '/')}`).href;

    expect(isMainModule(scriptUrl, 'scripts/generate-diary-content.ts')).toBe(true);
  });

  it('renders published articles, extracts visible headings, and excludes drafts', async () => {
    const sourceDirectory = createFixtureDirectory();
    const outputFile = path.join(sourceDirectory, 'generated-diary.ts');
    writeDiary(sourceDirectory, '2026-08-14.md', `---
title: Published
description: A published entry
publishedAt: 2026-08-14
draft: false
---

## Section

Published body.`);
    writeDiary(sourceDirectory, '2026-08-15-draft.md', `---
title: Draft
description: A hidden entry
publishedAt: 2026-08-15
draft: true
---

## Hidden`);

    const articles = await generateDiaryContent({ sourceDirectory, outputFile });

    expect(articles).toEqual([
      expect.objectContaining({
        id: '2026-08-14',
        title: 'Published',
        html: expect.stringContaining('<h2 id="section">Section</h2>'),
        headings: [{ depth: 2, slug: 'section', text: 'Section' }],
      }),
    ]);
    expect(fs.readFileSync(outputFile, 'utf8')).toContain('"id": "2026-08-14"');
  });

  it('extracts and anchors headings through level five for the article table of contents', async () => {
    const sourceDirectory = createFixtureDirectory();
    const outputFile = path.join(sourceDirectory, 'generated-diary.ts');
    writeDiary(sourceDirectory, '2026-08-14.md', `---
title: Nested headings
description: A published entry
publishedAt: 2026-08-14
draft: false
---

## 2 Section

### 2.1 Subsection

#### 2.1.1 Detail

##### 2.1.1.1 Deep detail`);

    const [article] = await generateDiaryContent({ sourceDirectory, outputFile });

    expect(article.headings).toEqual([
      { depth: 2, slug: '2-section', text: '2 Section' },
      { depth: 3, slug: '21-subsection', text: '2.1 Subsection' },
      { depth: 4, slug: '211-detail', text: '2.1.1 Detail' },
      { depth: 5, slug: '2111-deep-detail', text: '2.1.1.1 Deep detail' },
    ]);
    expect(article.html).toContain('<h4 id="211-detail">2.1.1 Detail</h4>');
    expect(article.html).toContain('<h5 id="2111-deep-detail">2.1.1.1 Deep detail</h5>');
  });

  it('rejects invalid frontmatter with its source filename', async () => {
    const sourceDirectory = createFixtureDirectory();
    writeDiary(sourceDirectory, 'invalid.md', `---
title: Missing description
publishedAt: 2026-08-14
---

Body`);

    await expect(generateDiaryContent({
      sourceDirectory,
      outputFile: path.join(sourceDirectory, 'generated-diary.ts'),
    })).rejects.toThrow('invalid.md');
  });
});
