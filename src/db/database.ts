import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Image, Tag, ImageTag } from '../types';

interface LabelCameraDB extends DBSchema {
  images: {
    key: string;
    value: Image;
    indexes: { 'by-group': string };
  };
  tags: {
    key: string;
    value: Tag;
    indexes: { 'by-name': string };
  };
  image_tags: {
    key: string;
    value: ImageTag;
    indexes: { 'by-image': string; 'by-tag': string };
  };
}

let dbInstance: IDBPDatabase<LabelCameraDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<LabelCameraDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<LabelCameraDB>('label_camera_db', 1, {
    upgrade(db) {
      // Images store
      if (!db.objectStoreNames.contains('images')) {
        const imageStore = db.createObjectStore('images', { keyPath: 'id' });
        imageStore.createIndex('by-group', 'groupId');
      }

      // Tags store
      if (!db.objectStoreNames.contains('tags')) {
        const tagStore = db.createObjectStore('tags', { keyPath: 'id' });
        tagStore.createIndex('by-name', 'name', { unique: true });
      }

      // Image-Tags relationship store
      if (!db.objectStoreNames.contains('image_tags')) {
        const imageTagStore = db.createObjectStore('image_tags', { keyPath: 'id' });
        imageTagStore.createIndex('by-image', 'imageId');
        imageTagStore.createIndex('by-tag', 'tagId');
      }
    },
  });

  return dbInstance;
}
