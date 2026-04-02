import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
    {
        title: '在知识的海洋中',
        highlight: '发现你的珍宝',
        subtitle: '从经典文学到前沿科技，精选优质好书，让阅读成为一种享受。',
        cta: '浏览推荐',
        ctaLink: '/new-arrivals',
        secondary: '热销榜',
        secondaryLink: '/hot-rankings',
        bgClass: 'hero-pattern',
        accentClass: 'text-amber-300',
        subtitleClass: 'text-blue-100/80',
    },
    {
        title: '限时特惠',
        highlight: '全场图书 8 折起',
        subtitle: '数千种精选图书限时折扣，机会不容错过！',
        cta: '查看优惠',
        ctaLink: '/hot-rankings',
        secondary: '新书上架',
        secondaryLink: '/new-arrivals',
        bgClass: 'bg-gradient-to-br from-emerald-600 to-teal-700',
        accentClass: 'text-emerald-200',
        subtitleClass: 'text-emerald-100/80',
    },
    {
        title: 'AI 智能荐书',
        highlight: '为你量身推荐',
        subtitle: '输入你的阅读偏好，AI 帮你找到最合适的书籍。',
        cta: '立即体验',
        ctaLink: '/ai-recommend',
        secondary: 'AI 荐书',
        secondaryLink: '/ai-recommend',
        bgClass: 'bg-gradient-to-br from-violet-600 to-purple-700',
        accentClass: 'text-violet-200',
        subtitleClass: 'text-violet-100/80',
    },
];

const AUTO_INTERVAL = 5000;

const HeroCarousel: React.FC = () => {
    const [active, setActive] = useState(0);
    const navigate = useNavigate();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mq.matches) return;

        intervalRef.current = setInterval(() => {
            setActive(prev => (prev + 1) % SLIDES.length);
        }, AUTO_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const goTo = (index: number) => {
        setActive(index);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setActive(prev => (prev + 1) % SLIDES.length);
        }, AUTO_INTERVAL);
    };

    const goNext = () => goTo((active + 1) % SLIDES.length);
    const goPrev = () => goTo((active - 1 + SLIDES.length) % SLIDES.length);

    const slide = SLIDES[active];

    return (
        <div className={`relative w-full rounded-2xl overflow-hidden mb-10 section-animate visible ${slide.bgClass} text-white min-h-[400px]`}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative z-20 h-full flex flex-col justify-center px-10 lg:px-16 py-16 max-w-3xl">
                <div key={active}>
                    <span className={`${slide.accentClass} bg-white/10 backdrop-blur-sm self-start px-3 py-1 rounded-full text-xs font-label uppercase tracking-widest mb-4 inline-block animate-fadeUp`}>
                        Spotlight
                    </span>
                    <h1 className="text-white text-4xl lg:text-5xl font-extrabold leading-tight mb-4 animate-fadeUp font-display">
                        {slide.title} {slide.highlight}
                    </h1>
                    <p className="text-white/80 text-lg mb-8 max-w-xl animate-fadeUp font-body" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                        {slide.subtitle}
                    </p>
                    <div className="flex gap-4 animate-fadeUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                        <button
                            onClick={() => navigate(slide.ctaLink)}
                            className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all shadow-lg"
                        >
                            {slide.cta}
                            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                        </button>
                        <button
                            onClick={() => navigate(slide.secondaryLink)}
                            className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-sm hover:bg-white/20 transition-all"
                        >
                            {slide.secondary}
                        </button>
                    </div>
                </div>
            </div>
            {/* Prev Arrow */}
            <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                aria-label="上一张"
            >
                <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
            </button>
            {/* Next Arrow */}
            <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                aria-label="下一张"
            >
                <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
            {/* Pagination Dots - Bar style */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`rounded-full transition-all ${
                            i === active ? 'w-8 h-1 bg-white' : 'w-2 h-1 bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`切换到第 ${i + 1} 张轮播`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
