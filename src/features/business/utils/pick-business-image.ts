import { showToast } from '@/components/feedback/Toast';

import { persistBusinessAsset } from './business-assets';

import type { BusinessAssetKind } from '../types/business.types';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

function isNativeModuleMissing(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('ExponentImagePicker') ||
    message.includes('Cannot find native module') ||
    message.includes('Native module')
  );
}

/** Opens the device gallery and persists a selected image for business assets. */
export async function pickBusinessImage(kind: BusinessAssetKind): Promise<string | null> {
  try {
    // Dynamic import keeps Business screens loadable before a native rebuild
    // that includes expo-image-picker is installed on the device.
    const ImagePicker = await import('expo-image-picker');

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('warning', {
        title: 'Permission needed',
        message: 'Allow photo library access to choose a logo or signature.',
      });
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: kind === 'logo' ? [1, 1] : [3, 1],
      quality: 0.85,
    });

    if (result.canceled || result.assets[0] == null) return null;

    const asset = result.assets[0];
    if (asset.mimeType != null && !ALLOWED_MIME_TYPES.has(asset.mimeType.toLowerCase())) {
      showToast('error', {
        title: 'Unsupported image',
        message: 'Please choose a JPG, PNG, or WEBP image.',
      });
      return null;
    }

    return await persistBusinessAsset(asset.uri, kind);
  } catch (error) {
    if (isNativeModuleMissing(error)) {
      showToast('error', {
        title: 'Rebuild required',
        message:
          'expo-image-picker was added recently. Rebuild the app with npx expo run:android (or run:ios).',
      });
      return null;
    }

    showToast('error', {
      title: 'Image could not be saved',
      message: error instanceof Error ? error.message : 'Please try another image.',
    });
    return null;
  }
}
