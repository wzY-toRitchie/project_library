import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSearchHistory, addToSearchHistory, removeFromSearchHistory, clearSearchHistory } from '../utils/searchHistory';
import { getSearchSuggestions, getHotSearches } from '../api/search';

interface SearchDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (keyword: string) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ isOpen, onClose, onSelect, inputRef }) => {
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [hotSearches, setHotSearches] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // 加载搜索历史和热门搜索
    useEffect(() => {
        if (isOpen) {
            setSearchHistory(getSearchHistory());
            getHotSearches().then(setHotSearches).catch(console.error);
        }
    }, [isOpen]);

    // 监听输入框变化
    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;

        const handleInput = () => {
            setInputValue(input.value);
        };

        input.addEventListener('input', handleInput);
        return () => input.removeEventListener('input', handleInput);
    }, [inputRef]);

    // 获取搜索建议
    useEffect(() => {
        if (inputValue.trim().length > 0) {
            const timer = setTimeout(() => {
                getSearchSuggestions(inputValue).then(setSuggestions).catch(console.error);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
        }
    }, [inputValue]);

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                    onClose();
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, inputRef]);

    if (!isOpen) return null;

    const handleSelectKeyword = (keyword: string) => {
        addToSearchHistory(keyword);
        setSearchHistory(getSearchHistory());
        onSelect(keyword);
        onClose();
    };

    const handleRemoveHistory = (e: React.MouseEvent, keyword: string) => {
        e.stopPropagation();
        removeFromSearchHistory(keyword);
        setSearchHistory(getSearchHistory());
    };

    const handleClearHistory = () => {
        clearSearchHistory();
        setSearchHistory([]);
    };

    // 判断是否显示搜索建议
    const showSuggestions = inputValue.trim().length > 0 && suggestions.length > 0;

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto"
        >
            {/* 搜索建议 */}
            {showSuggestions && (
                <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-500 mb-2">搜索建议</p>
                    <div className="space-y-1">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelectKeyword(suggestion)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{suggestion}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 搜索历史 */}
            {!showSuggestions && searchHistory.length > 0 && (
                <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-slate-500">搜索历史</p>
                        <button
                            onClick={handleClearHistory}
                            className="text-xs text-slate-400 hover:text-primary"
                        >
                            清除
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {searchHistory.map((keyword, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelectKeyword(keyword)}
                                className="group flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full cursor-pointer hover:bg-primary/10"
                            >
                                <span className="text-sm text-slate-700 dark:text-slate-300">{keyword}</span>
                                <button
                                    onClick={(e) => handleRemoveHistory(e, keyword)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-slate-400 text-sm hover:text-red-500">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 热门搜索 */}
            {!showSuggestions && hotSearches.length > 0 && (
                <div className="p-3">
                    <p className="text-xs font-medium text-slate-500 mb-2">热门搜索</p>
                    <div className="space-y-1">
                        {hotSearches.map((keyword, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelectKeyword(keyword)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            >
                                <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                                    index < 3 ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                }`}>
                                    {index + 1}
                                </span>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{keyword}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 空状态 */}
            {!showSuggestions && searchHistory.length === 0 && hotSearches.length === 0 && (
                <div className="p-6 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">search</span>
                    <p className="text-sm">输入关键词开始搜索</p>
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;
