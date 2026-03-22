import { useState } from 'react';
import MultiAngleCapture from './components/MultiAngleCapture';
import SearchBar from './components/SearchBar';
import ImageGallery from './components/ImageGallery';

function App() {
  const [activeTab, setActiveTab] = useState<'capture' | 'gallery'>('capture');

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-ocean">
      {/* 装饰性背景泡泡 */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 opacity-40 animate-float" />
      <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-br from-blue-300 to-cyan-300 opacity-30 animate-float animate-delay-500" />
      <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-300 to-orange-300 opacity-25 animate-float animate-delay-1000" />
      <div className="absolute bottom-20 right-1/3 w-28 h-28 rounded-full bg-gradient-to-br from-green-300 to-teal-300 opacity-35 animate-float animate-delay-700" />

      {/* 主内容区域 */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b-4 border-pink-300">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-fredoka text-4xl md:text-5xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  📸 Label Camera
                </h1>
                <p className="text-base text-gray-600 mt-2 font-nunito">
                  Multi-angle photo labeling system ✨
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setActiveTab('capture')}
                className={`px-8 py-3 rounded-full font-nunito font-bold text-lg
                           transition-all duration-300 transform hover:scale-105
                           ${activeTab === 'capture'
                             ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-pink hover:shadow-xl'
                             : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                           }`}
              >
                {activeTab === 'capture' ? '🎥' : '📷'} 拍摄
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-8 py-3 rounded-full font-nunito font-bold text-lg
                           transition-all duration-300 transform hover:scale-105
                           ${activeTab === 'gallery'
                             ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-blue hover:shadow-xl'
                             : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                           }`}
              >
                {activeTab === 'gallery' ? '🖼️' : '🎨'} 画廊
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Search Bar - Always visible */}
          <div className="mb-8 flex justify-center">
            <SearchBar />
          </div>

          {/* Content based on active tab */}
          {activeTab === 'capture' ? (
            <div className="flex justify-center">
              <MultiAngleCapture />
            </div>
          ) : (
            <ImageGallery />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t-4 border-purple-200 mt-8">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <p className="text-center text-base text-gray-600 font-nunito">
              💾 All data is stored locally in your browser using IndexedDB
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
