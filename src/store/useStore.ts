import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Image } from '../types';

interface AppState {
  // Capture state
  isCapturing: boolean;
  currentGroupId: string | null;
  capturedImages: Image[];
  currentTags: string[];

  // Gallery state
  searchQuery: string;
  selectedGroupId: string | null;

  // Actions
  startCapture: () => void;
  endCapture: () => void;
  addCapturedImage: (image: Image) => void;
  removeCapturedImage: (imageId: string) => void;
  clearCapturedImages: () => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  clearTags: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedGroupId: (groupId: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  isCapturing: false,
  currentGroupId: null,
  capturedImages: [],
  currentTags: [],
  searchQuery: '',
  selectedGroupId: null,

  // Actions
  startCapture: () => set({
    isCapturing: true,
    currentGroupId: uuidv4(),
    capturedImages: [],
    currentTags: []
  }),

  endCapture: () => set({
    isCapturing: false,
    currentGroupId: null,
    capturedImages: [],
    currentTags: []
  }),

  addCapturedImage: (image) => set((state) => ({
    capturedImages: [...state.capturedImages, image]
  })),

  removeCapturedImage: (imageId) => set((state) => ({
    capturedImages: state.capturedImages.filter(img => img.id !== imageId)
  })),

  clearCapturedImages: () => set({ capturedImages: [] }),

  addTag: (tag) => set((state) => ({
    currentTags: state.currentTags.includes(tag)
      ? state.currentTags
      : [...state.currentTags, tag]
  })),

  removeTag: (tag) => set((state) => ({
    currentTags: state.currentTags.filter(t => t !== tag)
  })),

  clearTags: () => set({ currentTags: [] }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedGroupId: (groupId) => set({ selectedGroupId: groupId }),
}));
