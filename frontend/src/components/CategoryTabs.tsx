import React from 'react';
import type { Category } from '../types';

interface CategoryTabsProps {
    categories: Category[];
    activeCategory: number | null;
    onCategoryChange: (categoryId: number | null) => void;
}

const categoryIcons: Record<string, string> = {
    '计算机': '💻',
    '文学': '📚',
    '历史': '🏛️',
    '哲学': '🤔',
    '艺术': '🎨',
    '科学': '🔬',
    '教育': '📖',
    '经济': '💰',
    '管理': '📊',
    '心理': '🧠',
    'default': '📚'
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === null
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
                📚 所有分类
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        activeCategory === category.id
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    {getCategoryIcon(category.name)} {category.name}
                </button>
            ))}
        </div>
    );
};

export default CategoryTabs;
