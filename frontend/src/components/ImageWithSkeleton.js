import React, { useState } from 'react';

export default function ImageWithSkeleton({ src, alt, className, wrapperClassName, style, skeletonStyle }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const fallbackSrc = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80';

  return (
    <div className={wrapperClassName} style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      {!loaded && (
        <div 
          className="skeleton" 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            width: '100%', 
            height: '100%', 
            borderRadius: style?.borderRadius || 'inherit',
            ...skeletonStyle 
          }} 
        />
      )}
      <img
        src={error ? fallbackSrc : (src || fallbackSrc)}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        style={{
          position: loaded ? 'relative' : 'absolute',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease-in-out',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
}
