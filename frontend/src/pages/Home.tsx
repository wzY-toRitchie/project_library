import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import type { Book, Category } from '../types';
import { useCart } from '../context/CartContext';
import { message } from 'antd'; // Keep antd message for now as it's convenient

const Home: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            handleSearch(searchQuery);
        } else if (selectedCategory) {
            fetchBooksByCategory(selectedCategory);
        } else {
            fetchBooks();
        }
    }, [selectedCategory, searchQuery]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/books');
            setBooks(response.data);
        } catch (error) {
            console.error('Failed to fetch books:', error);
            message.error('加载书籍失败');
        } finally {
            setLoading(false);
        }
    };

    const fetchBooksByCategory = async (categoryId: number) => {
        setLoading(true);
        try {
            const response = await api.get(`/books/category/${categoryId}`);
            setBooks(response.data);
        } catch (error) {
            console.error('Failed to fetch books by category:', error);
            message.error('加载分类书籍失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/books/search?title=${encodeURIComponent(query)}`);
            setBooks(response.data);
        } catch (error) {
            console.error('Search failed:', error);
            message.error('搜索失败');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (book: Book) => {
        addToCart(book);
        message.success(`${book.title} 已加入购物车`);
    };

    // Helper to render stars (placeholder for now as Book doesn't have rating)
    const renderStars = () => (
        <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="material-symbols-outlined text-yellow-400 text-sm">star</span>
            ))}
            <span className="text-xs text-gray-400 ml-1">(42)</span>
        </div>
    );

    return (
        <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-[#f0f2f4] dark:border-[#2a3441] sticky top-24">
                        <div className="p-4 border-b border-[#f0f2f4] dark:border-[#2a3441]">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">category</span>
                                分类
                            </h3>
                        </div>
                        <nav className="p-2 space-y-1">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                                    selectedCategory === null
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                                所有分类
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors group ${
                                        selectedCategory === category.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${selectedCategory === category.id ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
                                        label
                                    </span>
                                    {category.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Hero Banner */}
                    {!searchQuery && !selectedCategory && (
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
                            <div className="relative h-full flex flex-col justify-center px-8 text-white">
                                <h1 className="text-3xl font-black mb-2">欢迎回来，学者！</h1>
                                <p className="text-blue-100 text-lg max-w-lg">探索最新上架的学术书籍。从 Java 到新闻学，应有尽有。</p>
                            </div>
                        </div>
                    )}

                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {searchQuery ? `"${searchQuery}" 的搜索结果` : selectedCategory ? '分类结果' : '精选书籍'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">排序：</span>
                            <select className="text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark rounded-md focus:ring-primary focus:border-primary p-1">
                                <option>热门</option>
                                <option>价格：从低到高</option>
                                <option>最新上架</option>
                            </select>
                        </div>
                    </div>

                    {/* Book Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {books.map((book) => (
                                <div key={book.id} className="group bg-surface-light dark:bg-surface-dark rounded-xl border border-[#f0f2f4] dark:border-[#2a3441] overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col h-full cursor-pointer" onClick={() => navigate(`/book/${book.id}`)}>
                                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        {book.coverImage ? (
                                            <div 
                                                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                                                style={{ backgroundImage: `url("${book.coverImage}")` }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                                                <span className="material-symbols-outlined text-4xl">image</span>
                                            </div>
                                        )}
                                        {/* <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur px-2 py-0.5 rounded text-xs font-bold text-primary shadow-sm">
                                            NEW
                                        </div> */}
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="mb-auto">
                                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-lg mb-1" title={book.title}>{book.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{book.author}</p>
                                            {renderStars()}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-lg font-bold text-primary">¥{book.price}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(book);
                                                }}
                                                className="bg-primary hover:bg-blue-600 text-white p-2 rounded-lg transition-colors" 
                                                title="加入购物车"
                                            >
                                                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!loading && books.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            未找到相关书籍。
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;