/**
 * WhiskWear Animation Utilities
 * ─────────────────────────────────────────────────────────
 * Implements all JS-driven animation patterns from:
 *   - advanced-animation-prompts.md
 *   - animation-code-examples.md
 *   - animation-timing-reference.md
 *
 * All animations use transform + opacity for GPU acceleration.
 * Throttled at 60fps for scroll/mouse events.
 */

/* ─── Performance Throttle (60fps) ─── */
export function throttle(func, wait = 16) {
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

/* ─── Request Animation Frame Throttle ─── */
export function rafThrottle(func) {
  let rafId = null;
  return function (...args) {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}

/* ─── Button Ripple Effect ─── */
// Usage: button.addEventListener('click', createRipple);
export function createRipple(event) {
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

  // Remove any existing ripples for clean stacking
  const existing = button.querySelector('.ripple');
  if (existing) existing.remove();

  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 450);
}

/* ─── Initialize Ripple on All .ripple-button Elements ─── */
export function initRippleButtons(container = document) {
  container.querySelectorAll('.ripple-button').forEach(btn => {
    btn.addEventListener('click', createRipple);
  });
}

/* ─── Magnetic Button Hover Effect ─── */
// Creates a smooth "attraction" effect where button content follows cursor
export function magneticButton(button) {
  let x = 0, y = 0, targetX = 0, targetY = 0;
  let animating = false;

  function animate() {
    x += (targetX - x) * 0.18;
    y += (targetY - y) * 0.18;

    const distance = Math.sqrt(x * x + y * y);
    if (distance > 0.05) {
      button.style.transform = `translate(${x}px, ${y}px)`;
      animating = true;
      requestAnimationFrame(animate);
    } else {
      button.style.transform = 'translate(0px, 0px)';
      animating = false;
    }
  }

  button.addEventListener('mousemove', (e) => {
    const rect = button.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    targetX = (e.clientX - rect.left - centerX) * 0.3;
    targetY = (e.clientY - rect.top - centerY) * 0.3;
    if (!animating) animate();
  });

  button.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    if (!animating) animate();
  });
}

/* ─── Initialize Magnetic Buttons ─── */
export function initMagneticButtons(container = document) {
  container.querySelectorAll('.magnetic-btn').forEach(magneticButton);
}

/* ─── 3D Card Tilt Effect ─── */
export function init3DCardTilt(card) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y - centerY) / centerY) * 8; // max ±8deg
    const rotateY = ((x - centerX) / centerX) * -8;

    card.style.setProperty('--rotateX', rotateX + 'deg');
    card.style.setProperty('--rotateY', rotateY + 'deg');
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  });
}

/* ─── Counter Animation ─── */
// Smoothly counts from current value to target
export function animateCounter(element, target, duration = 800) {
  if (!element) return;
  const start = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
  const range = target - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + range * eased);
    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ─── Scroll-Based Parallax ─── */
// Add data-parallax="0.5" to elements (0.3 = slow, 1 = normal)
export function initScrollParallax() {
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!parallaxEls.length) return;

  const update = rafThrottle(() => {
    const scrollY = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const rect = el.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2 + scrollY;
      const distance = scrollY - elementCenter;
      el.style.transform = `translateY(${distance * speed * 0.1}px)`;
    });
  });

  window.addEventListener('scroll', update, { passive: true });
  return () => window.removeEventListener('scroll', update);
}

/* ─── Mouse-Following Parallax ─── */
// Add data-mouse-speed="0.1" to layers inside container
export function initMouseParallax(container) {
  if (!container) return;
  const layers = container.querySelectorAll('[data-mouse-speed]');
  let currentX = 0, currentY = 0;
  let targetX = 0, targetY = 0;
  let animating = false;

  function smoothUpdate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    layers.forEach(el => {
      const speed = parseFloat(el.dataset.mouseSpeed) || 0.1;
      el.style.transform = `translate(${currentX * speed}px, ${currentY * speed}px)`;
    });

    if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
      requestAnimationFrame(smoothUpdate);
    } else {
      animating = false;
    }
  }

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    targetX = e.clientX - rect.left - rect.width / 2;
    targetY = e.clientY - rect.top - rect.height / 2;
    if (!animating) {
      animating = true;
      requestAnimationFrame(smoothUpdate);
    }
  });

  container.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });
}

/* ─── Stagger Reveal with IntersectionObserver ─── */
// Add class "stagger-item" to children; parent gets observed
export function initStaggerReveal(container, selector = '.stagger-item') {
  if (!container) return;
  const items = container.querySelectorAll(selector);
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(item => observer.observe(item));
  return () => observer.disconnect();
}

/* ─── Stagger a grid/list of elements by index ─── */
export function staggerRevealAll(elements, baseDelay = 75) {
  elements.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('revealed');
    }, i * baseDelay);
  });
}

/* ─── Letter-by-Letter Text Split ─── */
// Wraps each character in a <span class="letter"> with animation delay
export function letterByLetter(element, baseDelay = 50) {
  if (!element) return;
  const text = element.textContent;
  element.innerHTML = '';
  element.classList.add('letter-reveal');

  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${i * baseDelay}ms`;
    element.appendChild(span);
  });
}

/* ─── Word-by-Word Text Split ─── */
export function wordByWord(element, baseDelay = 80) {
  if (!element) return;
  const words = element.textContent.split(' ');
  element.innerHTML = '';
  element.classList.add('letter-reveal');

  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'letter';
    span.style.marginRight = '0.3em';
    span.textContent = word;
    span.style.animationDelay = `${i * baseDelay}ms`;
    element.appendChild(span);
  });
}

/* ─── Smooth Scroll to Element ─── */
export function smoothScrollTo(element, offset = 80) {
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

/* ─── Check if element is in viewport ─── */
export function isInViewport(element, threshold = 0.1) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  return rect.top <= windowHeight * (1 - threshold) && rect.bottom >= 0;
}

/* ─── CSS Custom Property Updater (for 3D tilt via CSS vars) ─── */
export function setCSSVar(element, name, value) {
  element.style.setProperty(name, value);
}
