const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

// 获取搜索历史
export const getSearchHistory = (): string[] => {
    try {
        const history = localStorage.getItem(SEARCH_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch {
        return [];
    }
};

// 添加搜索记录
export const addToSearchHistory = (keyword: string): void => {
    if (!keyword || keyword.trim().length === 0) return;
    
    const trimmedKeyword = keyword.trim();
    const history = getSearchHistory();
    
    // 移除重复项，添加到开头
    const newHistory = [trimmedKeyword, ...history.filter(h => h !== trimmedKeyword)].slice(0, MAX_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
};

// 删除单条搜索记录
export const removeFromSearchHistory = (keyword: string): void => {
    const history = getSearchHistory();
    const newHistory = history.filter(h => h !== keyword);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
};

// 清空搜索历史
export const clearSearchHistory = (): void => {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
};
