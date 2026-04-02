import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../../types';
import { getNewArrivals } from '../../api/home';

const NewBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    getNewArrivals(8)
      .then(setBooks)
      .catch((err) => console.error('Failed to fetch new arrivals:', err))
      .finally(() => setLoading(false));
  }, []);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' });
  };

  return (
    <section className="mb-12 section-animate">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title text-2xl deco-line">新书上架</h2>
        {!loading && books.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="向左滚动"
              aria-label="向左滚动"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">chevron_left</span>
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="向右滚动"
              aria-label="向右滚动"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-elegant overflow-hidden shrink-0 w-[180px] animate-pulse">
              <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="scroll-container flex gap-5 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map((book) => (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              className="card-elegant overflow-hidden shrink-0 w-[180px] cursor-pointer group card-hover-lift stagger-entry"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-gray-50">
                {book.coverImage ? (
                  <div className="img-zoom absolute inset-0">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      width={300}
                      height={400}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-300">
                    <span className="material-symbols-outlined text-5xl" aria-hidden="true">menu_book</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
                  NEW
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold text-ink dark:text-white text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-ink-light dark:text-gray-400 font-body mb-2 truncate">
                  {book.author}
                </p>
                <span className="price-tag text-sm font-bold">¥{book.price}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default NewBooks;
