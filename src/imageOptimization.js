export const getWebpImageSrc = (src) => {
  if (typeof src !== 'string' || !/^\/?img\//i.test(src)) return null;

  const imagePath = src.split(/[?#]/, 1)[0];
  if (!/\.(?:png|jpe?g)$/i.test(imagePath)) return null;

  return src.replace(/\.(?:png|jpe?g)(?=[?#]|$)/i, '.webp');
};
