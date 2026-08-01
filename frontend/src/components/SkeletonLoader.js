import React from 'react';

/**
 * SkeletonLoader Components
 * ─────────────────────────────────────────────────────────
 * Shimmer skeleton screens for loading states.
 * Based on animation-code-examples.md Prompt 23 (Shimmer/Skeleton Loader).
 *
 * Uses .skeleton-box + ::after for left-to-right shimmer effect.
 * GPU-accelerated via CSS transform in shimmer-left keyframe.
 */

/* ─── Product Card Skeleton ─── */
export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-box skeleton-img" />
      <div className="skeleton-box skeleton-title" />
      <div className="skeleton-box skeleton-line medium" />
      <div className="skeleton-box skeleton-price" />
      <div className="skeleton-box skeleton-btn" />
    </div>
  );
}

/* ─── Product Grid Skeleton (renders N cards) ─── */
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </>
  );
}

/* ─── Category Circle Skeleton ─── */
export function CategorySkeleton({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div
            className="skeleton-box"
            style={{ width: 100, height: 100, borderRadius: '50%' }}
          />
          <div className="skeleton-box skeleton-line short" style={{ height: 12 }} />
        </div>
      ))}
    </>
  );
}

/* ─── Text Line Skeleton ─── */
export function TextSkeleton({ lines = 3, style = {} }) {
  const widths = ['full', 'medium', 'short'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton-box skeleton-line ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}

/* ─── Inline Spinner ─── */
export function Spinner({ size = 'md', style = {} }) {
  return (
    <div
      className={`spinner-anim ${size === 'sm' ? 'spinner-sm' : ''}`}
      style={style}
      role="status"
      aria-label="Loading"
    />
  );
}

/* ─── Bouncing Dots Loader ─── */
export function DotsLoader({ style = {} }) {
  return (
    <div className="dots-loader" style={style} role="status" aria-label="Loading">
      <div className="dot-anim" />
      <div className="dot-anim" />
      <div className="dot-anim" />
    </div>
  );
}

/* ─── Progress Bar ─── */
export function ProgressBar({ percent = null, style = {} }) {
  // percent = null → indeterminate mode; 0-100 → determinate
  return (
    <div className="progress-bar-wrap" style={style} role="progressbar" aria-valuenow={percent || 0}>
      {percent === null ? (
        <div className="progress-fill-indeterminate" />
      ) : (
        <div className="progress-fill-anim" style={{ width: `${percent}%` }} />
      )}
    </div>
  );
}

/* ─── Full Page Loading Overlay ─── */
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        minHeight: '40vh',
        padding: '3rem'
      }}
    >
      <DotsLoader />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
}

export default ProductCardSkeleton;
