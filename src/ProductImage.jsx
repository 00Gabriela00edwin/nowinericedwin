import { getWebpImageSrc } from './imageOptimization';

const ProductImage = ({ src, ...imageProps }) => {
  const webpSrc = getWebpImageSrc(src);

  return (
    <picture style={{ display: 'contents' }}>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img src={src} {...imageProps} />
    </picture>
  );
};

export default ProductImage;
