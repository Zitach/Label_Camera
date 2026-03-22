import React, { useState, KeyboardEvent } from 'react';
import { useStore } from '../store/useStore';

const LabelInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { currentTags, addTag, removeTag } = useStore();

  // 彩虹糖果色渐变数组
  const candyGradients = [
    'from-pink-400 to-rose-400',
    'from-purple-400 to-indigo-400',
    'from-blue-400 to-cyan-400',
    'from-green-400 to-teal-400',
    'from-yellow-400 to-orange-400',
    'from-red-400 to-pink-400',
  ];

  // 根据标签名生成稳定的颜色索引
  const getGradientIndex = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % candyGradients.length;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      addTag(inputValue.trim());
      setInputValue('');
    }
  };

  const handleAddTag = () => {
    if (inputValue.trim()) {
      addTag(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      {/* 输入框和按钮 */}
      <div className="flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入标签，按回车添加 ✨"
          className="flex-1 px-6 py-4 rounded-2xl font-nunito text-lg
                     border-4 border-purple-200 focus:border-purple-400
                     bg-white shadow-lg focus:shadow-xl
                     transition-all duration-300
                     hover:scale-102 focus:scale-102"
        />
        <button
          onClick={handleAddTag}
          disabled={!inputValue.trim()}
          className="px-8 py-4 rounded-2xl font-nunito font-bold text-lg
                     bg-gradient-to-r from-pink-400 to-purple-500
                     text-white shadow-lg hover:shadow-xl
                     transform hover:scale-105 active:scale-95
                     disabled:from-gray-300 disabled:to-gray-400
                     disabled:transform-none disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          添加 🏷️
        </button>
      </div>

      {/* 标签显示区域 */}
      {currentTags.length > 0 && (
        <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-white/50 backdrop-blur-sm">
          {currentTags.map((tag, index) => {
            const gradientClass = candyGradients[getGradientIndex(tag)];
            return (
              <span
                key={tag}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full
                           font-patrick text-lg text-white
                           bg-gradient-to-r ${gradientClass}
                           shadow-md transform hover:scale-110
                           animate-spin-in transition-transform
                           cursor-default`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 w-6 h-6 rounded-full bg-white/30
                             hover:bg-white/50 hover:rotate-90
                             transition-all duration-200
                             flex items-center justify-center
                             font-bold text-white"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* 空状态提示 */}
      {currentTags.length === 0 && (
        <div className="text-center py-6 px-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50
                       text-gray-500 font-nunito text-base">
          💡 添加标签来描述你的照片吧！
        </div>
      )}
    </div>
  );
};

export default LabelInput;
