import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import type { Category } from '../../types';

const categoryIcons: Record<string, string> = {
  '文学': 'auto_stories',
  '小说': 'menu_book',
  '科技': 'computer',
  '历史': 'history_edu',
  '哲学': 'psychology',
  '艺术': 'palette',
  '经济': 'trending_up',
  '科学': 'science',
  '教育': 'school',
  '医学': 'medical_services',
  '法律': 'gavel',
  '军事': 'shield',
  '体育': 'sports_soccer',
  '音乐': 'music_note',
  '旅行': 'flight',
  '美食': 'restaurant',
  '儿童': 'child_care',
  '漫画': 'comic_bubble',
  '政治': 'account_balance',
  '宗教': 'church',
  '心理': 'psychiatry',
  '自然': 'eco',
  '建筑': 'architecture',
  '摄影': 'photo_camera',
  '设计': 'design_services',
};

const defaultIcon = 'category';

const getIcon = (name: string): string => {
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (name.includes(key)) return icon;
  }
  return defaultIcon;
};

const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to fetch categories:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mb-12 section-animate">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="section-title text-2xl deco-line">热门分类入口</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="card-elegant flex flex-col items-center justify-center py-6 animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-entry">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/search?q=${encodeURIComponent(category.name)}&category=${category.id}`)}
              className="card-elegant card-hover-lift flex flex-col items-center justify-center py-6 hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-colors group"
            >
              <span className="material-symbols-outlined text-3xl text-primary mb-2 group-hover:scale-110 transition-transform" aria-hidden="true">
                {getIcon(category.name)}
              </span>
              <span className="font-display font-semibold text-sm text-ink dark:text-white group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategoryGrid;
