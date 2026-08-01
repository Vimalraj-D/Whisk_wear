# Animation Code Examples
## Quick Implementation Reference

---

## 🎬 3D MOTION - CSS/JS EXAMPLES

### 3D Card Tilt
```css
.card {
  perspective: 1000px;
  transition: transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.card:hover {
  transform: rotateX(var(--rotateX, 0deg)) rotateY(var(--rotateY, 0deg)) scale(1.02);
}
```

```javascript
const card = document.querySelector('.card');
card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const rotateX = (y - centerY) * 0.05;
  const rotateY = (x - centerX) * -0.05;
  
  card.style.setProperty('--rotateX', rotateX + 'deg');
  card.style.setProperty('--rotateY', rotateY + 'deg');
});

card.addEventListener('mouseleave', () => {
  card.style.setProperty('--rotateX', '0deg');
  card.style.setProperty('--rotateY', '0deg');
});
```

### 3D Flip Card
```css
.flip-card {
  perspective: 1200px;
  position: relative;
  width: 200px;
  height: 200px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform-style: preserve-3d;
}

.flip-card-inner.flipped {
  transform: rotateY(180deg);
}

.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}
```

```javascript
const card = document.querySelector('.flip-card-inner');
card.addEventListener('click', () => {
  card.classList.toggle('flipped');
});
```

### 3D Text Extrusion
```css
.text-3d {
  position: relative;
  font-size: 48px;
  font-weight: bold;
  text-shadow: 
    1px 1px 0px rgba(0,0,0,0.3),
    2px 2px 1px rgba(0,0,0,0.2),
    4px 4px 3px rgba(0,0,0,0.1);
  transition: text-shadow 300ms ease-out;
}

.text-3d:hover {
  text-shadow: 
    2px 2px 0px rgba(0,0,0,0.4),
    4px 4px 2px rgba(0,0,0,0.3),
    8px 8px 6px rgba(0,0,0,0.15);
}
```

---

## 🎭 ENTRANCE REVEALS

### Staggered Slide-In
```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.list-item {
  animation: slideInLeft 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 75ms; }
.list-item:nth-child(3) { animation-delay: 150ms; }
.list-item:nth-child(4) { animation-delay: 225ms; }
/* ... and so on */
```

### Clip-Path Reveal
```css
@keyframes revealHorizontal {
  from {
    clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  }
  to {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}

.reveal-image {
  animation: revealHorizontal 1s ease-out forwards;
}
```

```css
@keyframes revealCircle {
  from {
    clip-path: circle(0% at 50% 50%);
  }
  to {
    clip-path: circle(100% at 50% 50%);
  }
}

.reveal-circle {
  animation: revealCircle 1.2s ease-out forwards;
}
```

### Letter-by-Letter Reveal
```html
<h1 class="reveal-text">
  <span class="letter">H</span>
  <span class="letter">e</span>
  <span class="letter">l</span>
  <span class="letter">l</span>
  <span class="letter">o</span>
</h1>
```

```css
@keyframes letterReveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.letter {
  animation: letterReveal 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

.letter:nth-child(1) { animation-delay: 0ms; }
.letter:nth-child(2) { animation-delay: 50ms; }
.letter:nth-child(3) { animation-delay: 100ms; }
/* ... and so on */
```

---

## ✨ MICRO INTERACTIONS

### Button Ripple Effect
```javascript
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');
  
  button.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 400);
}

document.querySelectorAll('.ripple-button').forEach(btn => {
  btn.addEventListener('click', createRipple);
});
```

```css
.ripple-button {
  position: relative;
  overflow: hidden;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: rippleEffect 400ms ease-out;
  pointer-events: none;
}

@keyframes rippleEffect {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

### Floating Label
```html
<div class="form-group">
  <input type="text" id="name" class="form-input" required />
  <label for="name" class="form-label">Full Name</label>
</div>
```

```css
.form-group {
  position: relative;
  margin-bottom: 20px;
}

.form-label {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 16px;
  color: #A0AEC0;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  transform-origin: top left;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
}

.form-input:focus ~ .form-label,
.form-input:valid ~ .form-label {
  transform: translateY(-24px) scale(0.75);
  color: #3B82F6;
}
```

### Checkbox Check Mark
```css
.checkbox {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #E2E8F0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 200ms ease-out;
}

.checkbox:checked {
  background: #10B981;
  border-color: #10B981;
}

.checkbox:checked::after {
  content: '✓';
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  animation: checkScale 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkScale {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

### Counter Animation
```javascript
function animateCounter(element, target, duration = 1000) {
  const start = parseInt(element.textContent) || 0;
  const range = target - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    
    if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Usage
const counter = document.querySelector('.counter');
animateCounter(counter, 1000, 600);
```

---

## 🌀 PARALLAX EFFECTS

### Scroll-Based Parallax
```javascript
function parallax() {
  const scrollY = window.scrollY;
  
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.5;
    const offset = scrollY * speed;
    el.style.transform = `translateY(${offset}px)`;
  });
}

window.addEventListener('scroll', () => {
  requestAnimationFrame(parallax);
});
```

```html
<div data-parallax="0.5">Background</div>
<div data-parallax="0.7">Mid layer</div>
<div data-parallax="1">Foreground</div>
```

### Mouse-Following Parallax
```javascript
function mouseParallax(event) {
  const container = document.querySelector('.parallax-container');
  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const x = event.clientX - rect.left - centerX;
  const y = event.clientY - rect.top - centerY;
  
  document.querySelectorAll('[data-mouse-speed]').forEach(el => {
    const speed = parseFloat(el.dataset.mouseSpeed) || 0.1;
    const moveX = x * speed;
    const moveY = y * speed;
    
    el.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
}

document.querySelector('.parallax-container').addEventListener('mousemove', mouseParallax);
document.querySelector('.parallax-container').addEventListener('mouseleave', () => {
  document.querySelectorAll('[data-mouse-speed]').forEach(el => {
    el.style.transform = 'translate(0, 0)';
  });
});
```

---

## 👆 HOVER EFFECTS

### Magnetic Button
```javascript
function magneticButton(button) {
  let x = 0, y = 0, targetX = 0, targetY = 0;
  
  button.addEventListener('mousemove', (e) => {
    const rect = button.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    targetX = (e.clientX - rect.left - centerX) * 0.3;
    targetY = (e.clientY - rect.top - centerY) * 0.3;
  });
  
  function animate() {
    x += (targetX - x) * 0.2;
    y += (targetY - y) * 0.2;
    
    button.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(animate);
  }
  
  button.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });
  
  animate();
}

document.querySelectorAll('.magnetic-button').forEach(magneticButton);
```

### Gradient Shift Hover
```css
.gradient-button {
  background: linear-gradient(45deg, #3B82F6, #8B5CF6);
  background-size: 200% 200%;
  background-position: 0% 0%;
  transition: background-position 400ms ease-out;
}

.gradient-button:hover {
  background-position: 100% 100%;
}
```

### Icon Rotation Hover
```css
.icon-rotate:hover {
  animation: iconSpin 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes iconSpin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
```

### Underline Grow
```css
.link {
  position: relative;
  text-decoration: none;
  color: #1A202C;
}

.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #3B82F6;
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.link:hover::after {
  transform: translateX(-50%) scaleX(1);
}
```

### Card Lift
```css
.card {
  transition: transform 300ms, box-shadow 300ms;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  will-change: transform, box-shadow;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 32px rgba(0, 0, 0, 0.2);
}
```

---

## 🔄 SMOOTH LOADERS

### Spinner Loader
```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E2E8F0;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

```html
<svg class="spinner" viewBox="0 0 50 50">
  <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4"></circle>
</svg>
```

### Bouncing Dots
```css
@keyframes bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.7;
  }
}

.dots {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3B82F6;
  animation: bounce 1.2s ease-in-out infinite;
}

.dot:nth-child(1) { animation-delay: 0ms; }
.dot:nth-child(2) { animation-delay: 150ms; }
.dot:nth-child(3) { animation-delay: 300ms; }
```

### Shimmer Skeleton
```css
@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.skeleton {
  background: #E2E8F0;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 1.8s infinite;
}
```

### Progress Bar
```css
@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
}

.progress-bar {
  height: 4px;
  background: #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #8B5CF6);
  animation: progress 2s ease-in-out infinite;
}
```

```javascript
function updateProgress(percent) {
  const fill = document.querySelector('.progress-fill');
  fill.style.width = percent + '%';
  fill.style.animation = 'none';
}
```

### Circular Progress
```svg
<svg class="circle-progress" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" class="progress-background"></circle>
  <circle cx="50" cy="50" r="45" class="progress-circle"></circle>
  <text x="50" y="55" class="progress-text">0%</text>
</svg>
```

```css
.progress-background {
  fill: none;
  stroke: #E2E8F0;
  stroke-width: 4;
}

.progress-circle {
  fill: none;
  stroke: url(#gradient);
  stroke-width: 4;
  stroke-dasharray: 283;
  stroke-dashoffset: 283;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50px 50px;
  transition: stroke-dashoffset 400ms ease-out;
}

.circle-progress.active .progress-circle {
  stroke-dashoffset: calc(283 * (1 - var(--progress, 0)));
}
```

```javascript
function setCircleProgress(percent) {
  const svg = document.querySelector('.circle-progress');
  svg.style.setProperty('--progress', percent / 100);
  svg.querySelector('.progress-text').textContent = percent + '%';
}
```

---

## 🎨 THEME IMPLEMENTATION

### Light Mode
```css
:root {
  --brand-primary: #3B82F6;
  --brand-secondary: #8B5CF6;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --bg: #FAFBFC;
  --bg-secondary: #FFFFFF;
  --text-primary: #1A202C;
  --text-secondary: #4B5563;
  --border: #E2E8F0;
}
```

### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  :root {
    --brand-primary: #60A5FA;
    --brand-secondary: #A78BFA;
    --success: #86EFAC;
    --warning: #FBBF24;
    --error: #FCA5A5;
    --bg: #0F1419;
    --bg-secondary: #1A1F2E;
    --text-primary: #E2E8F0;
    --text-secondary: #A0AEC0;
    --border: #2D3748;
  }
}
```

---

## ⚡ PERFORMANCE TIPS

```css
/* Enable GPU acceleration */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* Use transform instead of position */
/* ❌ Bad */
.element {
  animation: move 1s;
}
@keyframes move {
  from { left: 0; }
  to { left: 100px; }
}

/* ✅ Good */
.element {
  animation: move 1s;
}
@keyframes move {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
```

```javascript
// Throttle scroll/mouse events
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage
window.addEventListener('scroll', throttle(() => {
  parallax();
}, 16)); // 60fps
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] All animations use `transform` and `opacity`
- [ ] Animations tested on low-end devices
- [ ] GPU acceleration enabled (`will-change`, `translateZ`)
- [ ] Respects `prefers-reduced-motion`
- [ ] Smooth 60fps performance
- [ ] Theme colors applied correctly
- [ ] Hover effects work on touch devices
- [ ] Loading states provide clear feedback
- [ ] Micro interactions enhance (not distract)
- [ ] Easing functions smooth and natural
