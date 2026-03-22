import React from 'react';
import { useStore } from '../store/useStore';
import CameraCapture from './CameraCapture';
import ImageUpload from './ImageUpload';
import LabelInput from './LabelInput';
import { saveImage } from '../db/images';
import { createTag, associateTagWithImage } from '../db/tags';

const MultiAngleCapture: React.FC = () => {
  const {
    isCapturing,
    startCapture,
    endCapture,
    currentGroupId,
    capturedImages,
    currentTags,
    removeCapturedImage,
  } = useStore();

  const handleStartCapture = () => {
    startCapture();
  };

  const handleSaveImages = async () => {
    if (!currentGroupId || capturedImages.length === 0) return;

    try {
      // Save all images to IndexedDB
      for (const image of capturedImages) {
        await saveImage(image);
      }

      // Create and associate tags
      for (const tagName of currentTags) {
        const tag = await createTag(tagName);
        // Associate tag with all images in the group
        for (const image of capturedImages) {
          await associateTagWithImage(image.id, tag.id);
        }
      }

      // Reset state
      endCapture();

      alert('Images saved successfully!');
    } catch (error) {
      console.error('Error saving images:', error);
      alert('Failed to save images. Please try again.');
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All captured images will be lost.')) {
      endCapture();
    }
  };

  if (!isCapturing) {
    return (
      <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800">Multi-Angle Photo Capture</h2>
        <p className="text-gray-600 text-center max-w-md">
          Capture 2-5 photos of your object from different angles. Add labels to make them searchable.
        </p>
        <button
          onClick={handleStartCapture}
          className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg"
        >
          Start New Capture
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Capturing Photos</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveImages}
            disabled={capturedImages.length < 2 || currentTags.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Save Images
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Capture Methods</h3>
          <CameraCapture />
          <ImageUpload />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Labels</h3>
          <LabelInput />
        </div>
      </div>

      {capturedImages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Captured Images ({capturedImages.length}/5)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {capturedImages.map((image, index) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.data}
                  alt={`Angle ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeCapturedImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <p className="text-center text-sm text-gray-600 mt-1">Angle {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {capturedImages.length < 2 && (
        <p className="text-amber-600 text-sm">
          Please capture at least 2 images (currently: {capturedImages.length})
        </p>
      )}
      {currentTags.length === 0 && (
        <p className="text-amber-600 text-sm">
          Please add at least one label to make the images searchable
        </p>
      )}
    </div>
  );
};

export default MultiAngleCapture;
