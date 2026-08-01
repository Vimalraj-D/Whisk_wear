import React, { useEffect, useRef, useState, Children, cloneElement } from 'react';

/**
 * ScrollReveal Component — Enhanced
 * ─────────────────────────────────────────────────────────
 * Triggers entry animations when content enters the viewport.
 *
 * Props:
 *   direction:  'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'clip'
 *   delay:      number (ms) — initial delay before animation starts
 *   threshold:  number (0–1) — how much of element must be visible
 *   duration:   number (ms) — animation duration
 *   stagger:    boolean — if true, adds stagger-item class to each direct child
 *   className:  string — extra class names for wrapper
 *   once:       boolean — if false, re-animates on re-entry (default: true)
 *
 * Based on animation-timing-reference.md easing recommendations.
 */
export default function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  threshold = 0.05,
  duration = 650,
  stagger = false,
  once = true,
  style = {}
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once && hasBeenVisible) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold, once, hasBeenVisible]);

  /* ─── Build initial (hidden) transform from direction ─── */
  const getInitialTransform = () => {
    if (isVisible) return 'none';
    switch (direction) {
      case 'up':    return 'translateY(40px)';
      case 'down':  return 'translateY(-40px)';
      case 'left':  return 'translateX(40px)';
      case 'right': return 'translateX(-40px)';
      case 'scale': return 'scale(0.88)';
      case 'clip':
      case 'fade':
      default:      return 'none';
    }
  };

  /* ─── Clip-path reveal ─── */
  const getClipPath = () => {
    if (direction !== 'clip') return undefined;
    return isVisible
      ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
      : 'polygon(0 0, 0 0, 0 100%, 0 100%)';
  };

  /* ─── Spring easing as per animation-timing-reference.md ─── */
  const easing = direction === 'scale'
    ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'   // Bouncy for scale
    : direction === 'clip'
    ? 'ease-out'                              // Smooth for clip-path
    : 'cubic-bezier(0.16, 1, 0.3, 1)';       // Natural ease-out for slides

  const wrapperStyle = {
    opacity: isVisible ? 1 : 0,
    transform: getInitialTransform(),
    ...(getClipPath() && { clipPath: getClipPath() }),
    transition: [
      `opacity ${duration}ms ${easing}`,
      `transform ${duration}ms ${easing}`,
      direction === 'clip' ? `clip-path ${duration}ms ${easing}` : null,
    ].filter(Boolean).join(', '),
    transitionDelay: `${delay}ms`,
    willChange: 'transform, opacity',
    ...style
  };

  /* ─── Stagger children mode ─── */
  if (stagger) {
    return (
      <div ref={ref} className={className} style={style}>
        {Children.map(children, (child, i) => {
          if (!React.isValidElement(child)) return child;
          return cloneElement(child, {
            className: [child.props.className, 'stagger-item', isVisible ? 'revealed' : ''].filter(Boolean).join(' '),
            style: {
              ...child.props.style,
              transitionDelay: `${delay + i * 75}ms`
            }
          });
        })}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      style={wrapperStyle}
    >
      {children}
    </div>
  );
}

/* ─── Stagger Group helper ─── */
// Wraps children and reveals them with staggered delays on scroll entry
export function StaggerGroup({ children, className = '', threshold = 0.05, delay = 0, staggerDelay = 75 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!window.IntersectionObserver) { setIsVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [threshold]);

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child;
        return cloneElement(child, {
          className: [child.props.className, 'stagger-item', isVisible ? 'revealed' : ''].filter(Boolean).join(' '),
          style: {
            ...child.props.style,
            transitionDelay: `${delay + i * staggerDelay}ms`
          }
        });
      })}
    </div>
  );
}
