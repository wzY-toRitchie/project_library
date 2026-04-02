import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '../../');
const src = resolve(__dirname, '..');

function readSource(relativePath: string): string {
  return readFileSync(resolve(src, relativePath), 'utf-8');
}

function readFile(relativePath: string): string {
  return readFileSync(resolve(root, relativePath), 'utf-8');
}

describe('Design Audit: HTML', () => {
  it('index.html should use zh-CN lang attribute', () => {
    const content = readFile('index.html');
    expect(content).toMatch(/lang="zh-CN"/);
    expect(content).not.toMatch(/lang="en"/);
  });
});

describe('Design Audit: Register.tsx bugs', () => {
  it('Register.tsx should not have CSS syntax error (comma-separated transitions)', () => {
    const content = readSource('pages/Register.tsx');
    expect(content).not.toMatch(/transition-colors,transition-transform/);
  });

  it('Register.tsx should not have outdated copyright year 2024', () => {
    const content = readSource('pages/Register.tsx');
    expect(content).not.toMatch(/©\s*2024/);
  });

  it('Register.tsx should not have floating gradient orbs', () => {
    const content = readSource('pages/Register.tsx');
    expect(content).not.toMatch(/blur-\[100px\]/);
    expect(content).not.toMatch(/rounded-full.*blur.*opacity-30/);
  });
});

describe('Design Audit: Remove AI orbs', () => {
  it('Login.tsx should not have floating gradient orbs', () => {
    const content = readSource('pages/Login.tsx');
    // The blurred circular decorative elements
    expect(content).not.toMatch(/rounded-full.*bg-amber-400\/10.*blur-2xl/);
    expect(content).not.toMatch(/rounded-full.*bg-blue-400\/15.*blur-xl/);
  });

  it('Login.tsx should not expose version number', () => {
    const content = readSource('pages/Login.tsx');
    expect(content).not.toMatch(/JavaBooks v1\.0/);
  });

  it('HeroCarousel.tsx should not have floating gradient orbs', () => {
    const content = readSource('components/HeroCarousel.tsx');
    expect(content).not.toMatch(/rounded-full.*bg-white\/5.*blur/);
  });
});

describe('Design Audit: Cart icon unification', () => {
  it('Cart.tsx should not import from lucide-react', () => {
    const content = readSource('pages/Cart.tsx');
    expect(content).not.toMatch(/from 'lucide-react'/);
  });

  it('Cart.tsx should use material-symbols-outlined icons', () => {
    const content = readSource('pages/Cart.tsx');
    expect(content).toMatch(/material-symbols-outlined/);
  });
});

describe('Design Audit: Checkout colors', () => {
  it('Checkout.tsx should not use hardcoded #111418 colors', () => {
    const content = readSource('pages/Checkout.tsx');
    expect(content).not.toMatch(/#\[#]?111418/);
  });

  it('Checkout.tsx should not use hardcoded #617589 colors', () => {
    const content = readSource('pages/Checkout.tsx');
    expect(content).not.toMatch(/#617589/);
  });
});

describe('Design Audit: SearchResults', () => {
  it('SearchResults.tsx should not have emoji in heading', () => {
    const content = readSource('pages/SearchResults.tsx');
    expect(content).not.toMatch(/🔍/);
  });
});

describe('Design Audit: Rating defaults', () => {
  it('Home.tsx should not default unrated books to 5 stars', () => {
    const content = readSource('pages/Home.tsx');
    expect(content).not.toMatch(/\|\|\s*5/);
  });

  it('BestSellers.tsx should not default unrated books to 5 stars', () => {
    const content = readSource('components/home/BestSellers.tsx');
    expect(content).not.toMatch(/\|\|\s*5/);
  });
});

describe('Design Audit: CategoryGrid navigation', () => {
  it('CategoryGrid.tsx navigation URL should be compatible with Home.tsx', () => {
    const gridContent = readSource('components/home/CategoryGrid.tsx');
    // Should NOT navigate to /?category=X (Home reads from sidebar, not URL)
    // Should navigate to /search?category=X instead
    expect(gridContent).not.toMatch(/`\/\?category=\$/);
  });
});
