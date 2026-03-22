import React, { useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { Image } from '../types';

const ImageUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentGroupId, addCapturedImage, capturedImages } = useStore();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !currentGroupId) return;

    Array.from(files).forEach((file) => {
      if (capturedImages.length >= 5) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newImage: Image = {
          id: uuidv4(),
          data: base64,
          groupId: currentGroupId,
          angle: capturedImages.length + 1,
          createdAt: new Date(),
        };
        addCapturedImage(newImage);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [currentGroupId, addCapturedImage, capturedImages.length]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      <button
        onClick={handleClick}
        disabled={!currentGroupId || capturedImages.length >= 5}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        Upload Images ({capturedImages.length}/5)
      </button>

      <p className="text-sm text-gray-600">
        You can upload multiple images (max 5 total per group)
      </p>
    </div>
  );
};

export default ImageUpload;
