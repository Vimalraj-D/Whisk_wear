# Animation Timing & Easing Reference
## Quick Lookup Guide

---

## ⏱️ ANIMATION DURATION GUIDE

### By Interaction Type

| Animation Type | Duration | Use Case | Example |
|---|---|---|---|
| **Micro** | 100-200ms | Button feedback, icons | Ripple, checkmark |
| **Quick** | 200-400ms | Form interaction, hover | Floating label, underline |
| **Standard** | 400-600ms | Content reveal, transition | Entrance animation, flip |
| **Deliberate** | 600-1000ms | Loading states, parallax | Loader, scroll effect |
| **Slow** | 1000-2000ms | Hero reveal, long scroll | Page load animation |

### Recommendation by Element

```
Buttons & Links:        200-400ms (quick response)
Loading Spinners:       1500-2500ms (smooth loop)
Entrance Reveals:       500-800ms (noticeable but not slow)
Hover Effects:          300-400ms (quick feedback)
Parallax Scroll:        Matches scroll speed (continuous)
Progress Bars:          300-500ms per update (smooth increment)
Page Transitions:       400-600ms (smooth swap)
Tooltips:               100-200ms (quick appearance)
Modals:                 300-400ms (quick overlay)
Slide Drawers:          300-400ms (quick slide)
```

---

## 📈 EASING FUNCTIONS

### Visual Timeline
```
                Linear (no easing)
        ╱─────────────────────────────
       ╱
      ╱

                Ease-Out (most common)
       ╱╱╱╱╱──────────────────────────
      ╱
     ╱

                Ease-In (less common)
      ╱─────────────╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱
     ╱
    ╱

                Ease-In-Out (smooth)
     ╱────╱╱╱╱─────────╱╱╱╱────────
    ╱
   ╱
```

### Easing Curves Library

#### 🟢 Ease-Out (Recommended for Entrance)
```css
/* Fast start, slow end - feels natural */
cubic-bezier(0.25, 0.46, 0.45, 0.94)  /* Smooth */
cubic-bezier(0.25, 0.8, 0.25, 1)      /* Slightly snappy */
cubic-bezier(0, 0, 0.2, 1)            /* Material Design */
cubic-bezier(0.34, 1.56, 0.64, 1)     /* Bouncy */
ease-out                              /* Browser default */
```

#### 🔵 Ease-In (Exit/Disappear)
```css
/* Slow start, fast end - departure feel */
cubic-bezier(0.95, 0.05, 0.795, 0.035)
cubic-bezier(0.4, 0, 1, 1)
ease-in
```

#### 🟣 Ease-In-Out (Continuous)
```css
/* Smooth throughout - good for transforms */
cubic-bezier(0.4, 0, 0.2, 1)         /* Material */
cubic-bezier(0.45, 0.05, 0.55, 0.95) /* Smooth */
cubic-bezier(0.42, 0, 0.58, 1)       /* Balanced */
ease-in-out
```

#### 🔴 Spring/Bouncy (Playful)
```css
/* Slight overshoot, bouncy feel */
cubic-bezier(0.34, 1.56, 0.64, 1)    /* Bounce */
cubic-bezier(0.68, -0.55, 0.265, 1.55) /* Spring */
cubic-bezier(1.17, 0.565, 0.565, 1.15)  /* Elastic */
```

#### ⚪ Linear (Continuous Motion)
```css
/* Constant speed - use for continuous rotations/scrolls */
linear
```

### Choose Easing By Feel

| Easing | Feel | Best For |
|--------|------|----------|
| `ease-out` | Natural, snappy | Button clicks, reveals |
| `ease-in-out` | Smooth, balanced | Transitions, transforms |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful, bouncy | Entrance animations |
| `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Spring, elastic | Hover effects |
| `linear` | Constant speed | Spinners, rotations |

---

## 🎯 COMBINATION GUIDELINES

### Recommended Timing + Easing Combos

#### Fast Interactions (200-300ms)
```css
animation: fadeIn 250ms ease-out;        /* Hover states */
transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

#### Standard Animations (400-600ms)
```css
animation: slideIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
transition: transform 400ms ease-in-out;  /* Entrance reveals */
```

#### Loader/Progress (1000-2000ms)
```css
animation: spin 2s linear infinite;       /* Continuous */
animation: shimmer 1.8s ease-in-out infinite;
```

#### Parallax/Scroll (Variable)
```css
transition: transform 300ms ease-out;     /* Scroll follows */
/* Duration depends on scroll speed */
```

---

## 📊 PERFORMANCE IMPACT

### GPU-Accelerated (✅ Use These)
```css
/* Fast, smooth, recommended */
transform: translateX(100px);
transform: scaleY(1.2);
transform: rotate(45deg);
opacity: 0.5;
```

| Property | GPU | FPS | Notes |
|----------|-----|-----|-------|
| `transform` | ✅ | 60fps | Always preferred |
| `opacity` | ✅ | 60fps | Lightweight |
| `filter` | ⚠️ | 30-45fps | Use sparingly |
| `box-shadow` | ⚠️ | 30-45fps | Expensive |
| `width/height` | ❌ | Janky | Avoid, use scale |
| `top/left/right` | ❌ | Janky | Avoid, use translate |

### Throttling for Performance

```javascript
// Scroll events - throttle to 60fps (16ms)
function throttle(func, limit) {
  let inThrottle;
  return function() {
    if (!inThrottle) {
      func.apply(this, arguments);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

window.addEventListener('scroll', throttle(parallax, 16));

// Mouse events - throttle to 30fps (33ms) or use requestAnimationFrame
window.addEventListener('mousemove', throttle(mouseEffect, 33));
```

---

## 🔧 COMMON DURATION PATTERNS

### Staggered List Animation
```
Item 1:  Start at 0ms,    end at 500ms    (duration: 500ms)
Item 2:  Start at 75ms,   end at 575ms    (duration: 500ms, delay: 75ms)
Item 3:  Start at 150ms,  end at 650ms    (duration: 500ms, delay: 150ms)
Item 4:  Start at 225ms,  end at 725ms    (duration: 500ms, delay: 225ms)
...
Max total time: ~1000-1200ms (not too long)
```

### Cascade Animation
```
Stagger Delay = 50-100ms between items
Max Items = 10-15 (avoid excessive stagger)
Total Duration = (item_count - 1) * stagger_delay + animation_duration
```

### Sequential Animation Chains
```
Animation 1: 0-400ms (fade in)
Animation 2: 400-800ms (slide in) - starts after fade
Animation 3: 800-1200ms (scale up) - starts after slide
Total: ~1200ms for all three to complete
```

---

## 🎨 THEME-AWARE TIMING

### Respect User Preferences
```css
/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}

/* Light mode: Standard timing */
:root {
  --animation-duration: 400ms;
  --animation-delay: 75ms;
}

/* Dark mode: Same timing (no change needed) */
```

---

## 📋 TIMING CHECKLIST

### Duration Rules
- [ ] Micro interactions: 100-400ms
- [ ] Hover effects: 200-400ms
- [ ] Entrance reveals: 500-800ms
- [ ] Loading states: 1500-2500ms
- [ ] No animation over 2000ms (feels slow)
- [ ] Stagger delays reasonable (50-100ms)
- [ ] Total cascade time < 1500ms

### Easing Rules
- [ ] Use `ease-out` for entrances
- [ ] Use `ease-in-out` for continuous
- [ ] Use `linear` for rotations/spinners
- [ ] Use spring for playful interactions
- [ ] Avoid `ease-in` for entrances
- [ ] Vary easing (not all linear)

### Performance Rules
- [ ] All animations use `transform` or `opacity`
- [ ] Will-change added for expensive animations
- [ ] Scroll events throttled (60fps max)
- [ ] Mouse events throttled (30-60fps)
- [ ] No simultaneous heavy animations
- [ ] Tested on low-end devices
- [ ] GPU acceleration enabled

---

## 🚀 QUICK START TEMPLATES

### Smooth Entrance
```css
animation: slideIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Smooth Exit
```css
animation: slideOut 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(30px);
  }
}
```

### Smooth Hover
```css
transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### Smooth Loader
```css
animation: spin 2s linear infinite;

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Staggered List
```css
animation: slideIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

@for $i from 1 through 10 {
  &:nth-child(#{$i}) {
    animation-delay: #{$i * 75}ms;
  }
}
```

---

## 📱 MOBILE OPTIMIZATION

### Reduced Motion on Mobile
```css
@media (prefers-reduced-motion: reduce) {
  .animated {
    animation: none;
    transition: none;
  }
}

/* Or shorter durations */
@media (max-width: 640px) {
  .animated {
    animation-duration: 300ms; /* Faster on mobile */
  }
}
```

### Touch Considerations
```css
/* Hover effects don't work well on touch */
@media (hover: hover) {
  /* Apply hover animations only if hover supported */
  .button:hover {
    animation: hoverEffect 300ms ease-out;
  }
}
```

---

## ✨ EASING FUNCTION GENERATOR

Generate custom easing with these resources:
- **Cubic-Bezier.com** - Visual cubic-bezier editor
- **Easings.net** - Animation curves library
- **Material Design** - Recommended curves
- **Framer** - Spring physics calculator

---

## 🎯 COMMON MISTAKES & FIXES

| ❌ Mistake | ✅ Fix | Impact |
|---|---|---|
| Animating width/height | Use transform: scale | +60fps |
| Using linear for entrance | Use ease-out | Feels more natural |
| Animation too long (>1s) | Reduce to 500ms | Feels snappier |
| No GPU acceleration | Add will-change, transform | +30fps |
| Animating position (top/left) | Use transform: translate | +40fps |
| Stagger > 100ms | Reduce to 50-75ms | Faster feedback |
| No easing on transitions | Add cubic-bezier | Smoother feel |
| Hover on mobile | Add @media (hover: hover) | Better UX |

---

## 📚 RESOURCES

### Tools
- Cubic-Bezier Editor: cubic-bezier.com
- Easing Curves: easings.net
- Animation Inspector: Firefox DevTools
- Animation Timeline: Chrome DevTools

### Libraries
- GSAP: Heavy animations, timelines
- Framer Motion: React, spring physics
- Three.js: 3D animations
- Anime.js: Lightweight JavaScript

### Documentation
- MDN Web Docs: CSS Animations
- W3C: Animation Spec
- CSS Tricks: Animation Articles
