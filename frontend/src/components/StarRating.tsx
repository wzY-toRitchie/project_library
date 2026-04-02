import React from 'react';

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    interactive?: boolean;
    onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxStars = 5,
    size = 'md',
    showValue = false,
    interactive = false,
    onChange
}) => {
    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-2xl'
    };

    const handleClick = (star: number) => {
        if (interactive && onChange) {
            onChange(star);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {Array.from({ length: maxStars }).map((_, index) => {
                    const starValue = index + 1;
                    const isFilled = starValue <= rating;
                    const isHalf = !isFilled && starValue - 0.5 <= rating;

                    return (
                        <span
                            key={index}
                            className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer' : ''} ${isFilled || isHalf ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
                            onClick={() => handleClick(starValue)}
                        >
                            {isFilled ? <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> : isHalf ? <span className="material-symbols-outlined">star_half</span> : <span className="material-symbols-outlined">star</span>}
                        </span>
                    );
                })}
            </div>
            {showValue && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;
