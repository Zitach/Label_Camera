import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { searchImagesByTag } from '../db/tags';

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useStore();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchQuery.trim()) {
        // For simplicity, we'll search by the current query
        // In a production app, you might want to show autocomplete suggestions
        const imageIds = await searchImagesByTag(searchQuery.trim());
        if (imageIds.length > 0) {
          setSuggestions([searchQuery.trim()]);
        } else {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search is empty, trigger a refresh of the gallery
      setSearchQuery('');
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="flex gap-4">
        {/* 搜索输入框 */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索标签... 🔍"
            className="w-full pl-14 pr-6 py-5 rounded-full
                       font-nunito text-lg
                       border-4 border-purple-200 focus:border-purple-400
                       bg-white shadow-lg focus:shadow-xl
                       transition-all duration-300
                       focus:scale-102"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">
            🔍
          </span>
        </div>

        {/* 搜索按钮 */}
        <button
          onClick={handleSearch}
          className="px-10 py-5 rounded-full font-nunito font-bold text-xl
                     bg-gradient-to-r from-purple-400 to-pink-500
                     text-white shadow-xl hover:shadow-2xl
                     transform hover:scale-105 active:scale-95
                     transition-all duration-200"
        >
          搜索 ✨
        </button>

        {/* 清除按钮 */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="px-6 py-5 rounded-full bg-gray-200 text-gray-700
                       hover:bg-gray-300 transform hover:rotate-90
                       transition-all duration-300 animate-spin-in
                       font-bold text-xl"
          >
            ×
          </button>
        )}
      </div>

      {/* 搜索结果提示 */}
      {suggestions.length > 0 && (
        <div className="mt-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-100 to-teal-100
                       text-green-800 font-nunito font-semibold text-base
                       animate-bounce-in shadow-md">
          🎉 找到 "{suggestions[0]}" 的结果
        </div>
      )}
    </div>
  );
};

export default SearchBar;
