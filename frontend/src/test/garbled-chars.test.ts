import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const srcDir = resolve(__dirname, '..');

function readSource(relativePath: string): string {
  return readFileSync(resolve(srcDir, relativePath), 'utf-8');
}

describe('P0 #8: No garbled characters in Chinese text', () => {
  it('PopularAuthors.tsx should not have stray ? after Chinese section title', () => {
    const content = readSource('components/home/PopularAuthors.tsx');
    expect(content).not.toContain('热门作者?');
    expect(content).toContain('热门作者');
  });

  it('RecentBrowsing.tsx should not have stray ? in section title', () => {
    const content = readSource('components/RecentBrowsing.tsx');
    expect(content).not.toContain('最近浏览?');
    expect(content).toContain('最近浏览');
  });

  it('RecentBrowsing.tsx should not have stray ? in "view all" link', () => {
    const content = readSource('components/RecentBrowsing.tsx');
    expect(content).not.toContain('查看全部 →?');
    expect(content).toContain('查看全部');
  });

  it('SearchResults.tsx should not have mismatched quotes in result header', () => {
    const content = readSource('pages/SearchResults.tsx');
    // Should not contain the garbled pattern with left single quote
    expect(content).not.toMatch(/搜索结果'\$\{keyword\}"/);
  });

  it('SearchResults.tsx should not have stray ? after count text', () => {
    const content = readSource('pages/SearchResults.tsx');
    expect(content).not.toMatch(/本书。[？?]/);
    expect(content).toContain('本书');
  });
});
