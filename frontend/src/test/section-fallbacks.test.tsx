import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AdminDashboardChartsSkeleton,
  HomeDiscoverySkeleton,
} from '../components/Skeleton';

describe('section fallbacks', () => {
  it('renders homepage discovery placeholders', () => {
    render(<HomeDiscoverySkeleton />);

    expect(screen.getByLabelText('首页推荐内容加载中')).toBeInTheDocument();
    expect(screen.getAllByTestId('featured-book-skeleton')).toHaveLength(8);
  });

  it('renders admin chart placeholders', () => {
    render(<AdminDashboardChartsSkeleton />);

    expect(screen.getByLabelText('管理后台图表加载中')).toBeInTheDocument();
    expect(screen.getAllByTestId('admin-chart-skeleton')).toHaveLength(5);
  });
});
