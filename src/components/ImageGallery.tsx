import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getAllImages, getImagesByGroup, deleteImagesByGroup } from '../db/images';
import { getImageTags, searchImagesByTag, deleteImageTagAssociations } from '../db/tags';
import { Image, Tag } from '../types';

interface ImageGroup {
  groupId: string;
  images: Image[];
  tags: Tag[];
  createdAt: Date;
}

const ImageGallery: React.FC = () => {
  const { searchQuery, setSelectedGroupId, selectedGroupId } = useStore();
  const [imageGroups, setImageGroups] = useState<ImageGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // 彩虹糖果色渐变数组
  const candyGradients = [
    'from-pink-400 to-rose-400',
    'from-purple-400 to-indigo-400',
    'from-blue-400 to-cyan-400',
    'from-green-400 to-teal-400',
    'from-yellow-400 to-orange-400',
    'from-red-400 to-pink-400',
  ];

  // 根据索引获取渐变色
  const getGradientByIndex = (index: number) => {
    return candyGradients[index % candyGradients.length];
  };

  const loadImageGroups = async () => {
    setLoading(true);
    try {
      let allImages: Image[];

      if (searchQuery.trim()) {
        const imageIds = await searchImagesByTag(searchQuery.trim());
        allImages = await getAllImages();
        allImages = allImages.filter(img => imageIds.includes(img.id));
      } else {
        allImages = await getAllImages();
      }

      const groupMap = new Map<string, Image[]>();
      allImages.forEach(img => {
        if (!groupMap.has(img.groupId)) {
          groupMap.set(img.groupId, []);
        }
        groupMap.get(img.groupId)!.push(img);
      });

      const groups: ImageGroup[] = [];
      for (const [groupId, images] of groupMap.entries()) {
        const tags = await getImageTags(images[0].id);
        groups.push({
          groupId,
          images: images.sort((a, b) => a.angle - b.angle),
          tags,
          createdAt: images[0].createdAt,
        });
      }

      groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setImageGroups(groups);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImageGroups();
  }, [searchQuery]);

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('确定要删除这组照片吗？🤔')) return;

    try {
      const images = await getImagesByGroup(groupId);
      for (const image of images) {
        await deleteImageTagAssociations(image.id);
      }
      await deleteImagesByGroup(groupId);
      loadImageGroups();

      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('删除失败，请重试 💔');
    }
  };

  const handleViewGroup = (groupId: string) => {
    setSelectedGroupId(selectedGroupId === groupId ? null : groupId);
  };

  // 加载状态
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-12 gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-400 to-purple-500
                       animate-spin">
          <div className="w-full h-full rounded-full border-4 border-white border-t-transparent" />
        </div>
        <p className="font-nunito font-bold text-xl text-gray-600 animate-pulse">
          加载中... ✨
        </p>
      </div>
    );
  }

  // 空状态
  if (imageGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12
                     bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl
                     border-4 border-purple-200">
        <div className="text-8xl mb-6 animate-bounce-in">
          {searchQuery ? '🔍' : '📸'}
        </div>
        <p className="font-nunito font-bold text-2xl text-gray-700 mb-4">
          {searchQuery ? '没有找到匹配的照片 😢' : '还没有照片哦！'}
        </p>
        {!searchQuery && (
          <p className="text-gray-500 font-nunito text-base text-center max-w-md">
            💡 使用上方的拍摄功能，开始捕捉你的第一个多角度照片吧！
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 标题 */}
      <div className="text-center">
        <h2 className="font-fredoka text-4xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500
                       bg-clip-text text-transparent mb-2">
          {searchQuery ? `搜索结果: "${searchQuery}"` : '图像画廊 🖼️'}
        </h2>
        <p className="font-nunito text-gray-600 text-lg">
          {imageGroups.length} 组照片 · 点击卡片查看详情
        </p>
      </div>

      {/* 照片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {imageGroups.map((group, groupIndex) => (
          <div
            key={group.groupId}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl
                      transform hover:-translate-y-3 transition-all duration-300
                      border-4 border-transparent hover:border-pink-300
                      animate-bounce-in"
            style={{ animationDelay: `${groupIndex * 100}ms` }}
          >
            {/* 预览图像 */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={group.images[0].data}
                alt="Group preview"
                className="w-full h-full object-cover
                          transform hover:scale-110 transition-transform duration-500"
              />

              {/* 照片数量徽章 */}
              <div className="absolute top-3 right-3 px-4 py-2 rounded-full
                             bg-black/60 backdrop-blur-sm text-white
                             font-nunito font-bold text-sm">
                📸 {group.images.length} 张
              </div>

              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent
                             pointer-events-none" />
            </div>

            {/* 标签区域 */}
            <div className="p-5">
              <div className="flex flex-wrap gap-2 mb-4">
                {group.tags.map((tag, tagIndex) => (
                  <span
                    key={tag.id}
                    className={`px-4 py-1.5 rounded-full text-sm font-patrick text-white
                               bg-gradient-to-r ${getGradientByIndex(tagIndex)}
                               shadow-md transform hover:scale-110 transition-transform`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewGroup(group.groupId)}
                  className="flex-1 py-3 rounded-full font-nunito font-bold
                             bg-gradient-to-r from-blue-400 to-cyan-400
                             text-white shadow-lg hover:shadow-xl
                             transform hover:scale-105 active:scale-95
                             transition-all duration-200"
                >
                  {selectedGroupId === group.groupId ? '收起 🔼' : '查看详情 👀'}
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.groupId)}
                  className="px-5 py-3 rounded-full bg-red-100 text-red-600
                             hover:bg-red-200 transform hover:scale-110
                             transition-all duration-200 font-bold"
                >
                  🗑️
                </button>
              </div>

              {/* 创建日期 */}
              <p className="text-xs text-gray-500 mt-3 font-nunito text-center">
                📅 {new Date(group.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>

            {/* 展开视图 - 显示所有角度 */}
            {selectedGroupId === group.groupId && (
              <div className="border-t-4 border-purple-200 p-6
                             bg-gradient-to-br from-purple-50 to-pink-50
                             animate-bounce-in">
                <h4 className="font-nunito font-bold text-lg text-gray-800 mb-4">
                  所有角度 ✨
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {group.images.map((image, imgIndex) => (
                    <div
                      key={image.id}
                      className="relative overflow-hidden rounded-2xl shadow-lg
                                transform hover:scale-105 transition-transform duration-300"
                      style={{ transform: `rotate(${(imgIndex % 3 - 1) * 2}deg)` }}
                    >
                      <img
                        src={image.data}
                        alt={`Angle ${image.angle}`}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full
                                     bg-black/60 backdrop-blur-sm text-white
                                     font-nunito text-xs font-bold">
                        角度 {image.angle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
