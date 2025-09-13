import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder.svg',
  className,
  objectFit = 'cover',
  onLoad,
  onError,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(priority ? src : '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    if (!priority) {
      setImgSrc('');
      setIsLoaded(false);
      setHasError(false);
    }
  }, [src, priority]);

  useEffect(() => {
    if (!priority && !isLoaded && !hasError) {
      // Create an observer for lazy loading
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImgSrc(src);
            observer.disconnect();
          }
        });
      });

      // Get the container element
      const element = document.getElementById(`image-container-${props.id}`);
      if (element) {
        observer.observe(element);
      }

      return () => {
        if (element) {
          observer.unobserve(element);
        }
        observer.disconnect();
      };
    }
  }, [src, isLoaded, hasError, priority, props.id]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setHasError(true);
    setImgSrc(fallbackSrc);
    onError?.();
  };

  return (
    <div
      id={`image-container-${props.id}`}
      className={cn(
        'relative overflow-hidden bg-muted/30',
        !isLoaded && !hasError && 'animate-pulse',
        className
      )}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          style={{ objectFit }}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      )}
    </div>
  );
}