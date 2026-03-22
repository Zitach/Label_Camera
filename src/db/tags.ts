import { v4 as uuidv4 } from 'uuid';
import { getDB } from './database';
import { Tag, ImageTag } from '../types';

export async function createTag(name: string): Promise<Tag> {
  const db = await getDB();

  // Check if tag already exists
  const existing = await db.getFromIndex('tags', 'by-name', name);
  if (existing) return existing;

  const newTag: Tag = {
    id: uuidv4(),
    name,
    createdAt: new Date(),
  };
  await db.put('tags', newTag);
  return newTag;
}

export async function getAllTags(): Promise<Tag[]> {
  const db = await getDB();
  return db.getAll('tags');
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tags', id);
}

export async function associateTagWithImage(imageId: string, tagId: string): Promise<ImageTag> {
  const db = await getDB();
  const imageTag: ImageTag = {
    id: uuidv4(),
    imageId,
    tagId,
    createdAt: new Date(),
  };
  await db.put('image_tags', imageTag);
  return imageTag;
}

export async function getImageTags(imageId: string): Promise<Tag[]> {
  const db = await getDB();
  const imageTags = await db.getAllFromIndex('image_tags', 'by-image', imageId);
  const tags: Tag[] = [];
  for (const imageTag of imageTags) {
    const tag = await db.get('tags', imageTag.tagId);
    if (tag) tags.push(tag);
  }
  return tags;
}

export async function searchImagesByTag(tagName: string): Promise<string[]> {
  const db = await getDB();
  const tag = await db.getFromIndex('tags', 'by-name', tagName);
  if (!tag) return [];

  const imageTags = await db.getAllFromIndex('image_tags', 'by-tag', tag.id);
  return imageTags.map(it => it.imageId);
}

export async function deleteImageTagAssociations(imageId: string): Promise<void> {
  const db = await getDB();
  const imageTags = await db.getAllFromIndex('image_tags', 'by-image', imageId);
  const tx = db.transaction('image_tags', 'readwrite');
  await Promise.all(imageTags.map(it => tx.store.delete(it.id)));
  await tx.done;
}
