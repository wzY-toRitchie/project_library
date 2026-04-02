import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const srcDir = resolve(__dirname, '..');

function readSource(relativePath: string): string {
  return readFileSync(resolve(srcDir, relativePath), 'utf-8');
}

describe('P0 #1: Footer multi-column layout', () => {
  it('MainLayout.tsx should have multi-column footer', () => {
    const content = readSource('components/MainLayout.tsx');
    // Footer should have multiple columns (grid)
    expect(content).toMatch(/footer[\s\S]{0,2000}grid-cols-[2-6]/);
  });

  it('MainLayout.tsx footer should not contain "毕业设计作品"', () => {
    const content = readSource('components/MainLayout.tsx');
    expect(content).not.toContain('毕业设计作品');
  });

  it('MainLayout.tsx footer should contain payment method references', () => {
    const content = readSource('components/MainLayout.tsx');
    expect(content).toMatch(/footer[\s\S]{0,3000}(微信|支付宝|支付|payment)/i);
  });

  it('MainLayout.tsx footer should have customer service links', () => {
    const content = readSource('components/MainLayout.tsx');
    expect(content).toMatch(/footer[\s\S]{0,3000}(帮助|关于|联系|客服)/);
  });
});

describe('P0 #2: Header utility bar', () => {
  it('MainLayout.tsx should have a utility bar above the main header', () => {
    const content = readSource('components/MainLayout.tsx');
    // Should have a thin bar with trust info before the main header
    expect(content).toMatch(/免邮|免运费|免费配送|free.shipping|trust/i);
  });

  it('MainLayout.tsx header should have category navigation', () => {
    const content = readSource('components/MainLayout.tsx');
    // Should have a category bar below the main header
    expect(content).toMatch(/分类|categories|文学|科技|category/i);
  });
});
