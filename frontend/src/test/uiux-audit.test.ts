import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const src = resolve(__dirname, '..');

function readSource(relativePath: string): string {
  return readFileSync(resolve(src, relativePath), 'utf-8');
}

describe('UI/UX: Icon library unification', () => {
  it('Checkout.tsx should not import from lucide-react', () => {
    const content = readSource('pages/Checkout.tsx');
    expect(content).not.toMatch(/from 'lucide-react'/);
  });

  it('OrderConfirm.tsx should not import from lucide-react', () => {
    const content = readSource('pages/OrderConfirm.tsx');
    expect(content).not.toMatch(/from 'lucide-react'/);
  });

  it('Payment.tsx should not import from @ant-design/icons', () => {
    const content = readSource('pages/Payment.tsx');
    expect(content).not.toMatch(/from '@ant-design\/icons'/);
  });

  it('Checkout.tsx should use material-symbols-outlined', () => {
    const content = readSource('pages/Checkout.tsx');
    expect(content).toMatch(/material-symbols-outlined/);
  });

  it('OrderConfirm.tsx should use material-symbols-outlined', () => {
    const content = readSource('pages/OrderConfirm.tsx');
    expect(content).toMatch(/material-symbols-outlined/);
  });

  it('Payment.tsx should use material-symbols-outlined', () => {
    const content = readSource('pages/Payment.tsx');
    expect(content).toMatch(/material-symbols-outlined/);
  });
});

describe('UI/UX: No emoji as icons', () => {
  it('CategoryTabs.tsx should not use emoji as category icons', () => {
    const content = readSource('components/CategoryTabs.tsx');
    // No emoji characters as values in icon maps
    expect(content).not.toMatch(/'[💻📚🏛️🎨🔬]'/);
    expect(content).not.toMatch(/'📚 所有分类'/);
  });

  it('AiRecommend.tsx should not use emoji in suggestion chips', () => {
    const content = readSource('pages/AiRecommend.tsx');
    expect(content).not.toMatch(/'[💻🐍📖📜💰]'/);
  });
});

describe('UI/UX: Touch targets', () => {
  it('Cart.tsx quantity buttons should be at least 44px', () => {
    const content = readSource('pages/Cart.tsx');
    // No size-7 (28px) buttons for quantity controls
    expect(content).not.toMatch(/size-7/);
    expect(content).not.toMatch(/"flex size-7/);
  });

  it('HeroCarousel.tsx indicator dots should have adequate touch area', () => {
    const content = readSource('components/HeroCarousel.tsx');
    // w-2.5 h-2.5 = 10px is too small
    expect(content).not.toMatch(/className="w-2\.5 h-2\.5/);
  });
});

describe('UI/UX: Checkout validity', () => {
  it('Checkout.tsx should not have invalid Tailwind arbitrary value syntax for colors', () => {
    const content = readSource('pages/Checkout.tsx');
    // text-[slate-500] should be text-slate-500
    expect(content).not.toMatch(/text-\[slate/);
    expect(content).not.toMatch(/bg-\[slate/);
    expect(content).not.toMatch(/border-\[slate/);
    expect(content).not.toMatch(/dark:bg-\[slate/);
    expect(content).not.toMatch(/dark:border-\[slate/);
    expect(content).not.toMatch(/dark:text-\[slate/);
    expect(content).not.toMatch(/divide-\[slate/);
  });
});

describe('UI/UX: Accessibility', () => {
  it('Home.tsx should have an h1 tag', () => {
    const content = readSource('pages/Home.tsx');
    expect(content).toMatch(/<h1|<h1 /);
  });
});
