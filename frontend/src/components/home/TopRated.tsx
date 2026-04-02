import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../../types';
import { getTopRated } from '../../api/home';
import StarRating from '../StarRating';
import { FALLBACK_COVER } from '../../utils/constants';

const TopRated: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getTopRated(8)
      .then(setBooks)
      .catch((err) => console.error('Failed to fetch top rated:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mb-12 section-animate">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="section-title text-2xl deco-line">好评榜</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-entry">
          {books.map((book, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            return (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group card-hover-lift"
              >
                <span
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold shrink-0 ${
                    isTop3
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {rank}
                </span>
                <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={book.coverImage || FALLBACK_COVER}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={40}
                    height={56}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-ink dark:text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-ink-light dark:text-gray-400 font-body truncate max-w-[120px]">
                      {book.author}
                    </p>
                    <StarRating rating={book.rating || 0} size="sm" />
                  </div>
                </div>
                <span className="text-xs text-amber-500 font-bold shrink-0">
                  {(book.rating || 0).toFixed(1)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default TopRated;
