import { EncodingType, getInfoAsync, readAsStringAsync } from 'expo-file-system/legacy';

function mimeFromUri(uri: string): string {
  const extension = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(uri)?.[1]?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

/** Converts a local image URI to a data URI for HTML PDF rendering (required on iOS). */
export async function toImageDataUri(uri?: string | null): Promise<string | undefined> {
  if (uri == null || uri.trim().length === 0) return undefined;
  try {
    if (uri.startsWith('data:')) return uri;
    const info = await getInfoAsync(uri);
    if (!info.exists) return undefined;
    const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
    if (base64.trim().length === 0) return undefined;
    return `data:${mimeFromUri(uri)};base64,${base64}`;
  } catch {
    return undefined;
  }
}
