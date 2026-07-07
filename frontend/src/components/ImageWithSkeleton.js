import React, { useState } from 'react';

export default function ImageWithSkeleton({ src, alt, className, style, skeletonStyle }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
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
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        style={{
          ...style,
          position: loaded ? (style?.position || 'static') : 'absolute',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease-in-out',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
}
