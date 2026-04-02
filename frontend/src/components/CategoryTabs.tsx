import React from 'react';
import type { Category } from '../types';

interface CategoryTabsProps {
    categories: Category[];
    activeCategory: number | null;
    onCategoryChange: (categoryId: number | null) => void;
}

const categoryIcons: Record<string, string> = {
    '计算机': 'computer',
    '文学': 'auto_stories',
    '历史': 'history_edu',
    '哲学': 'psychology',
    '艺术': 'palette',
    '科学': 'science',
    '教育': 'school',
    '经济': 'trending_up',
    '管理': 'manage_accounts',
    'psychology': 'psychology',
    'default': 'category'
};

const getCategoryIcon = (categoryName: string): string => {
    return categoryIcons[categoryName] || categoryIcons['default'];
};

const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
    categories, 
    activeCategory, 
    onCategoryChange 
}) => {
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            <button
                onClick={() => onCategoryChange(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === null
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
                <span className="material-symbols-outlined text-[16px] mr-1" aria-hidden="true">apps</span>
                所有分类
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                        activeCategory === category.id
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px] mr-1" aria-hidden="true">{getCategoryIcon(category.name)}</span>
                    {category.name}
                </button>
            ))}
        </div>
    );
};

export default CategoryTabs;
