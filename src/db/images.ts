import { v4 as uuidv4 } from 'uuid';
import { getDB } from './database';
import { Image } from '../types';

export async function saveImage(image: Omit<Image, 'id' | 'createdAt'>): Promise<Image> {
  const db = await getDB();
  const newImage: Image = {
    ...image,
    id: uuidv4(),
    createdAt: new Date(),
  };
  await db.put('images', newImage);
  return newImage;
}

export async function getImagesByGroup(groupId: string): Promise<Image[]> {
  const db = await getDB();
  return db.getAllFromIndex('images', 'by-group', groupId);
}

export async function getAllImages(): Promise<Image[]> {
  const db = await getDB();
  return db.getAll('images');
}

export async function deleteImage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('images', id);
}

export async function deleteImagesByGroup(groupId: string): Promise<void> {
  const db = await getDB();
  const images = await getImagesByGroup(groupId);
  const tx = db.transaction('images', 'readwrite');
  await Promise.all(images.map(img => tx.store.delete(img.id)));
  await tx.done;
}
