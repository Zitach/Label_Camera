export interface Image {
  id: string;
  data: string; // base64 encoded image
  groupId: string;
  angle: number;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
}

export interface ImageTag {
  id: string;
  imageId: string;
  tagId: string;
  createdAt: Date;
}

export interface ImageGroup {
  id: string;
  images: Image[];
  tags: string[];
  createdAt: Date;
}

export interface CaptureState {
  isCapturing: boolean;
  currentGroupId: string | null;
  capturedImages: Image[];
  currentTags: string[];
}
