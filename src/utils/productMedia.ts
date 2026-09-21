export type ProductImageValue = string | { url?: string; altText?: string } | null | undefined;

export const getImageUrl = (image: ProductImageValue): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return typeof image.url === 'string' ? image.url : '';
};

export const getProductDisplayImage = (
  images?: ProductImageValue[] | ProductImageValue,
): string => {
  if (!images) return '';
  const first = Array.isArray(images) ? images[0] : images;
  return getImageUrl(first);
};

export const toExistingImagesPayload = (
  images?: ProductImageValue[] | ProductImageValue,
): Array<{ url: string; altText: string }> => {
  const list = Array.isArray(images) ? images : images ? [images] : [];

  return list
    .map((image) => {
      if (typeof image === 'string' && image) {
        return { url: image, altText: '' };
      }

      if (image && typeof image === 'object' && typeof image.url === 'string' && image.url) {
        return {
          url: image.url,
          altText: typeof image.altText === 'string' ? image.altText : '',
        };
      }

      return null;
    })
    .filter((image): image is { url: string; altText: string } => Boolean(image));
};
