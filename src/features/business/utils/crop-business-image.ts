import { manipulateAsync, SaveFormat, type Action } from 'expo-image-manipulator';

export interface CropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export interface CropBusinessImageOptions {
  sourceUri: string;
  cropRect: CropRect;
  rotation?: 0 | 90 | 180 | 270;
}

export interface CropBusinessImageResult {
  uri: string;
  width: number;
  height: number;
}

/**
 * Performs image crop and optional rotation using Expo Image Manipulator.
 * Rotation is applied first, then the crop bounding box is evaluated in the rotated image's pixel space.
 */
export async function cropBusinessImage({
  sourceUri,
  cropRect,
  rotation = 0,
}: CropBusinessImageOptions): Promise<CropBusinessImageResult> {
  const actions: Action[] = [];

  if (rotation !== 0) {
    actions.push({ rotate: rotation });
  }

  actions.push({
    crop: {
      originX: Math.max(0, Math.round(cropRect.originX)),
      originY: Math.max(0, Math.round(cropRect.originY)),
      width: Math.max(1, Math.round(cropRect.width)),
      height: Math.max(1, Math.round(cropRect.height)),
    },
  });

  const result = await manipulateAsync(sourceUri, actions, {
    compress: 0.9,
    format: SaveFormat.JPEG,
  });

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
  };
}
