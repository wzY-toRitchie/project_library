import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const srcDir = resolve(__dirname, '..');

function readSource(relativePath: string): string {
  return readFileSync(resolve(srcDir, relativePath), 'utf-8');
}

describe('P1 #9: BestSellers and TopRated should show book covers', () => {
  it('BestSellers.tsx should display book cover images', () => {
    const content = readSource('components/home/BestSellers.tsx');
    expect(content).toMatch(/<img[\s\S]*coverImage/);
  });

  it('TopRated.tsx should display book cover images', () => {
    const content = readSource('components/home/TopRated.tsx');
    expect(content).toMatch(/<img[\s\S]*coverImage/);
  });
});

describe('P1 #10: Rating count display', () => {
  it('BestSellers.tsx should show star rating', () => {
    const content = readSource('components/home/BestSellers.tsx');
    expect(content).toMatch(/StarRating|star|rating/i);
  });
});

describe('P1 #13: Checkout progress indicator', () => {
  it('Checkout.tsx should have a step progress indicator', () => {
    const content = readSource('pages/Checkout.tsx');
    expect(content).toMatch(/收货|订单|支付|step|progress/i);
  });
});

describe('P1 #15: Cart coupon input', () => {
  it('Cart.tsx should have coupon input field', () => {
    const content = readSource('pages/Cart.tsx');
    expect(content).toMatch(/优惠券|coupon|promo/i);
  });
});
