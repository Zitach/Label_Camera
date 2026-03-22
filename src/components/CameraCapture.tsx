import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { useStore } from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { Image } from '../types';

const CameraCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [error, setError] = useState<string>('');
  const { currentGroupId, addCapturedImage, capturedImages } = useStore();

  const capture = useCallback(() => {
    if (!webcamRef.current || !currentGroupId) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const newImage: Image = {
      id: uuidv4(),
      data: imageSrc,
      groupId: currentGroupId,
      angle: capturedImages.length + 1,
      createdAt: new Date(),
    };

    addCapturedImage(newImage);
  }, [currentGroupId, addCapturedImage, capturedImages.length]);

  const handleUserMedia = () => {
    setError('');
  };

  const handleUserMediaError = (err: string | DOMException) => {
    setError('Camera access denied. Please allow camera permissions.');
    console.error('Camera error:', err);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* 错误提示 */}
      {error && (
        <div className="w-full max-w-2xl px-6 py-4 rounded-2xl
                       bg-gradient-to-r from-red-100 to-pink-100
                       border-4 border-red-300 text-red-700
                       font-nunito font-semibold text-base
                       animate-bounce-in shadow-lg">
          🚫 {error}
        </div>
      )}

      {/* 相机预览容器 */}
      <div className="relative p-2 rounded-3xl bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500
                     shadow-2xl transform hover:rotate-1 transition-transform duration-300">
        {/* 装饰角标 */}
        <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full
                       bg-gradient-to-br from-yellow-400 to-orange-400
                       flex items-center justify-center text-white text-xl
                       animate-bounce shadow-lg z-10">
          ✨
        </div>
        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full
                       bg-gradient-to-br from-green-400 to-teal-400
                       flex items-center justify-center text-white text-xl
                       animate-bounce animate-delay-200 shadow-lg z-10">
          📸
        </div>

        {/* 摄像头预览 */}
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          className="w-full max-w-2xl rounded-2xl"
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
        />

        {/* 取景框装饰 */}
        <div className="absolute inset-4 border-4 border-white/30 rounded-xl pointer-events-none" />

        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-20 rounded-b-2xl
                       bg-gradient-to-t from-black/30 to-transparent
                       pointer-events-none" />
      </div>

      {/* 拍照按钮 */}
      <button
        onClick={capture}
        disabled={!currentGroupId || capturedImages.length >= 5}
        className={`relative w-28 h-28 rounded-full font-nunito font-bold text-lg
                   transition-all duration-300 transform
                   ${!currentGroupId || capturedImages.length >= 5
                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                     : 'bg-gradient-to-br from-pink-400 to-purple-500 text-white ' +
                       'shadow-2xl hover:shadow-3xl hover:scale-110 active:scale-95 ' +
                       'animate-pulse-glow'
                   }`}
      >
        {/* 外圈装饰 */}
        {!currentGroupId || capturedImages.length >= 5 ? null : (
          <div className="absolute inset-0 rounded-full border-4 border-white/50
                         animate-ping" />
        )}

        {/* 按钮内容 */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span className="text-4xl">📷</span>
          <span className="text-sm font-bold">
            {capturedImages.length}/5
          </span>
        </div>
      </button>

      {/* 拍照提示 */}
      {currentGroupId && capturedImages.length < 5 && (
        <div className="text-center px-6 py-3 rounded-2xl
                       bg-gradient-to-r from-purple-50 to-pink-50
                       text-gray-700 font-nunito font-semibold text-base
                       animate-float">
          💡 点击大按钮拍照！还可以拍摄 {5 - capturedImages.length} 张
        </div>
      )}

      {/* 已拍满提示 */}
      {capturedImages.length >= 5 && (
        <div className="text-center px-6 py-3 rounded-2xl
                       bg-gradient-to-r from-green-100 to-teal-100
                       text-green-700 font-nunito font-bold text-base
                       animate-bounce-in">
          🎉 已完成 5 张照片拍摄！
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
