import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../../types';
import { getBestsellers } from '../../api/home';
import StarRating from '../StarRating';
import { FALLBACK_COVER } from '../../utils/constants';

const rankMedal = (rank: number) => {
  if (rank === 1) return 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-amber-400/30';
  if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-gray-300/30';
  if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-amber-600/30';
  return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
};

const BestSellers: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getBestsellers(10)
      .then(setBooks)
      .catch((err) => console.error('Failed to fetch bestsellers:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mb-12 section-animate section-divider">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="section-title text-2xl deco-line">热销榜 TOP10</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2 stagger-entry">
          {books.map((book, index) => {
            const rank = index + 1;
            return (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group card-hover-lift"
              >
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-md shrink-0 ${rankMedal(rank)} ${rank <= 3 ? 'rank-glow' : ''}`}
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
                    <p className="text-xs text-ink-light dark:text-gray-400 font-body truncate">
                      {book.author}
                    </p>
                    <StarRating rating={book.rating || 0} size="sm" />
                  </div>
                </div>
                <span className="price-tag text-sm font-bold shrink-0">¥{book.price}</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BestSellers;
