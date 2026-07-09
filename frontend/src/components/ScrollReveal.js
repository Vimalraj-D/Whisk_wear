import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal Component
 * Toggles visibility and entry animations when the wrapped content enters the viewport.
 * Supports up/down/left/right/fade directions and custom transition delays for staggered effects.
 */
export default function ScrollReveal({ children, className = '', direction = 'up', delay = 0, threshold = 0.05 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // Check if IntersectionObserver is supported (fallback to visible if not)
    if (!window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Stop observing once revealed
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters to feel smoother
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const getTransform = () => {
    if (isVisible) return 'none';
    switch (direction) {
      case 'up': return 'translateY(40px)';
      case 'down': return 'translateY(-40px)';
      case 'left': return 'translateX(40px)';
      case 'right': return 'translateX(-40px)';
      case 'fade':
      default: return 'none';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </div>
  );
}
