import React, { useRef, useEffect } from 'react';
import { createRipple, magneticButton } from '../utils/animations';

/**
 * AnimatedButton
 * ─────────────────────────────────────────────────────────
 * A drop-in button replacement that adds:
 *   - Click ripple effect (from animation-code-examples.md)
 *   - Optional magnetic hover (from advanced-animation-prompts.md Prompt 16)
 *   - Optional gradient shift hover (Prompt 17)
 *   - Proper active press scale (animation-timing-reference.md)
 *
 * Props:
 *   magnetic: boolean — enables magnetic cursor attraction
 *   gradient: boolean — enables animated gradient background on hover
 *   className, onClick, children, style, disabled, type — standard button props
 */
export default function AnimatedButton({
  children,
  className = '',
  onClick,
  magnetic = false,
  gradient = false,
  style = {},
  disabled = false,
  type = 'button',
  id,
  title,
  ...rest
}) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    if (magnetic) {
      magneticButton(btn);
    }
  }, [magnetic]);

  const handleClick = (e) => {
    if (disabled) return;
    createRipple(e);
    if (onClick) onClick(e);
  };

  const classes = [
    'ripple-button',
    magnetic ? 'magnetic-btn' : '',
    gradient ? 'gradient-button' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={buttonRef}
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled}
      style={style}
      id={id}
      title={title}
      {...rest}
    >
      {children}
    </button>
  );
}
