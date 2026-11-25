import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { getWebpImageSrc } from './imageOptimization';

const ProductImage = ({ src, useWebp = true, ...imageProps }) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const webpSrc = useWebp ? getWebpImageSrc(src) : null;
  const { alt, className, onError, style, ...imgProps } = imageProps;

  if (typeof src !== 'string' || !src.trim() || failedSrc === src) {
    return (
      <div
        className={`product-image-fallback${className ? ` ${className}` : ''}`}
        style={style}
        role={alt ? 'img' : undefined}
        aria-label={alt ? `${alt}, imagen no disponible` : undefined}
        aria-hidden={alt ? undefined : true}
      >
        <ImageOff size={22} aria-hidden="true" />
        <span>Imagen no disponible</span>
      </div>
    );
  }

  return (
    <picture style={{ display: 'contents' }}>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        {...imgProps}
        onError={(event) => {
          onError?.(event);
          setFailedSrc(src);
        }}
      />
    </picture>
  );
};

export default ProductImage;
