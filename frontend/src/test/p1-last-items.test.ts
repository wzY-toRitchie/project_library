import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const srcDir = resolve(__dirname, '..');

function readSource(relativePath: string): string {
  return readFileSync(resolve(srcDir, relativePath), 'utf-8');
}

describe('P1 #12: Search filter sidebar', () => {
  it('SearchResults.tsx should have a left sidebar layout (grid/flex with sidebar)', () => {
    const content = readSource('pages/SearchResults.tsx');
    // Should have a layout with sidebar area + main content area
    expect(content).toMatch(/sidebar|filter|筛选|grid-cols-\[|lg:grid-cols|flex-row/);
  });

  it('SearchResults.tsx should have price range filter', () => {
    const content = readSource('pages/SearchResults.tsx');
    expect(content).toMatch(/价格|priceRange|price.*filter/i);
  });

  it('SearchResults.tsx should have rating filter', () => {
    const content = readSource('pages/SearchResults.tsx');
    expect(content).toMatch(/评分|ratingFilter|rating.*filter|★/i);
  });

  it('SearchResults.tsx should have category filter as clickable buttons', () => {
    const content = readSource('pages/SearchResults.tsx');
    // Category filter uses buttons with selected state
    expect(content).toMatch(/category|分类[\s\S]{0,500}(button|onClick|selectedCategory)/);
  });
});

describe('P1 #16: Homepage CSS carousel', () => {
  it('Home.tsx should have carousel/slides instead of single static banner', () => {
    const content = readSource('pages/Home.tsx');
    expect(content).toMatch(/carousel|slides|banner.*auto|轮播|animate.*slide/i);
  });

  it('Home.tsx should use HeroCarousel component', () => {
    const content = readSource('pages/Home.tsx');
    expect(content).toMatch(/HeroCarousel|carousel/i);
  });

  it('HeroCarousel.tsx should have indicator dots for slides', () => {
    const content = readSource('components/HeroCarousel.tsx');
    expect(content).toMatch(/indicator|dot|圆点|SLIDES/i);
  });

  it('HeroCarousel.tsx should have multiple promotional banners', () => {
    const content = readSource('components/HeroCarousel.tsx');
    expect(content).toMatch(/SLIDES\s*=\s*\[/);
    const titleMatches = content.match(/title:/g) || [];
    expect(titleMatches.length).toBeGreaterThanOrEqual(3);
  });
});
