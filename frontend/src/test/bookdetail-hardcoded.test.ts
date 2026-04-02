import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const srcDir = resolve(__dirname, '..');

function readSource(relativePath: string): string {
  return readFileSync(resolve(srcDir, relativePath), 'utf-8');
}

describe('P0 #5: Hardcoded "热销" badge', () => {
  it('BookDetail.tsx should not show "热销" unconditionally for every book', () => {
    const content = readSource('pages/BookDetail.tsx');
    // The old code had: 热销 hardcoded without condition
    // It should be conditional on rating or sales
    expect(content).not.toMatch(/热销.*\n.*bg-amber.*\n.*text-white/);
  });

  it('BookDetail.tsx should only show bestseller badge conditionally', () => {
    const content = readSource('pages/BookDetail.tsx');
    if (content.includes('热销')) {
      // Check that 热销 is preceded by a conditional check (e.g., averageRating >= 4.5)
      expect(content).toMatch(/averageRating\s*>=\s*4\.5[\s\S]{0,200}热销/);
    }
  });
});

describe('P0 #6: Remove fake ISBN', () => {
  it('BookDetail.tsx should not generate fake ISBN from book ID', () => {
    const content = readSource('pages/BookDetail.tsx');
    expect(content).not.toContain('BK-');
  });

  it('BookDetail.tsx should not use padStart to fabricate ISBN', () => {
    const content = readSource('pages/BookDetail.tsx');
    expect(content).not.toMatch(/isbnText.*padStart/);
  });
});

describe('P0 #7: Remove hardcoded editorial quote', () => {
  it('BookDetail.tsx should not have the same hardcoded quote for all books', () => {
    const content = readSource('pages/BookDetail.tsx');
    expect(content).not.toContain('一本充满张力与希望的作品，值得细细品读');
  });

  it('BookDetail.tsx should not have identical review comment for every book', () => {
    const content = readSource('pages/BookDetail.tsx');
    // Check there is no static Chinese quote that appears identically for all books
    // (excluding common UI text like buttons/labels)
    const staticQuotes = content.match(/"[^"]*值得[^"]*"/g) || [];
    // Filter out CSS classes and non-quote strings
    const realQuotes = staticQuotes.filter(q => q.length > 10 && !q.includes('hover:'));
    expect(realQuotes.length).toBe(0);
  });
});
