export type ProductImageValue =
  | string
  | { url?: string; key?: string; altText?: string }
  | null
  | undefined;

export const getImageUrl = (image: ProductImageValue): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return typeof image.url === 'string' ? image.url : '';
};

/** Extract S3/storage object key from a key or full (presigned) URL. */
export const extractStorageKey = (value?: string | null): string => {
  if (!value || typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed.split(/[?#]/)[0].replace(/^\/+/, '');
  }

  try {
    const parsed = new URL(trimmed);
    return decodeURIComponent(parsed.pathname || '').replace(/^\/+/, '');
  } catch {
    return trimmed.split(/[?#]/)[0].replace(/^\/+/, '');
  }
};

export const getProductDisplayImage = (
  images?: ProductImageValue[] | ProductImageValue,
): string => {
  if (!images) return '';
  const first = Array.isArray(images) ? images[0] : images;
  return getImageUrl(first);
};

export type ProductVideoValue =
  | { url?: string; key?: string; altText?: string }
  | null
  | undefined;

export type ExistingMediaItem = {
  url: string;
  key: string;
  altText: string;
};

export const toExistingVideoPayload = (
  video: ProductVideoValue,
): ExistingMediaItem | null => {
  if (!video || typeof video !== 'object') return null;

  const displayUrl = typeof video.url === 'string' ? video.url : '';
  const key =
    (typeof video.key === 'string' && video.key.trim()) ||
    extractStorageKey(displayUrl);

  if (!key && !displayUrl) return null;

  return {
    url: displayUrl || key,
    key: key || extractStorageKey(displayUrl),
    altText: typeof video.altText === 'string' ? video.altText : '',
  };
};

export const toExistingImagesPayload = (
  images?: ProductImageValue[] | ProductImageValue,
): ExistingMediaItem[] => {
  const list = Array.isArray(images) ? images : images ? [images] : [];

  return list
    .map((image) => {
      if (typeof image === 'string' && image) {
        const key = extractStorageKey(image);
        return { url: image, key, altText: '' };
      }

      if (image && typeof image === 'object') {
        const displayUrl = typeof image.url === 'string' ? image.url : '';
        const key =
          (typeof image.key === 'string' && image.key.trim()) ||
          extractStorageKey(displayUrl);

        if (!key && !displayUrl) return null;

        return {
          url: displayUrl || key,
          key: key || extractStorageKey(displayUrl),
          altText: typeof image.altText === 'string' ? image.altText : '',
        };
      }

      return null;
    })
    .filter((image): image is ExistingMediaItem => Boolean(image));
};

/** Payload for update: backend stores S3 keys in `url`. */
export const toExistingImagesSubmitPayload = (
  images: ExistingMediaItem[],
): Array<{ url: string; altText: string }> =>
  images
    .map((image) => {
      const url = image.key || extractStorageKey(image.url);
      if (!url) return null;
      return { url, altText: image.altText || '' };
    })
    .filter((image): image is { url: string; altText: string } => Boolean(image));

export const toExistingVideoSubmitPayload = (
  video: ExistingMediaItem | null,
): { url: string; altText: string } | null => {
  if (!video) return null;
  const url = video.key || extractStorageKey(video.url);
  if (!url) return null;
  return { url, altText: video.altText || '' };
};
