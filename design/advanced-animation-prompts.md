# Advanced Animation Design Prompts
## 3D Motion, Entrance Reveals, Micro Interactions & More

---

## 🎬 3D MOTION EFFECTS

### Prompt 1: 3D Card Tilt
```
Design a 3D card tilt effect that:
- Responds to mouse/touch position
- Tilts on X and Y axis based on cursor location
- Maintains perspective depth (50-100px)
- Shows subtle shadow shift with tilt
- Scales slightly on hover (1.02x)
- Resets smoothly when mouse leaves (300ms)
- Works on desktop and mobile (touch events)

Specifications:
  Max rotation: ±15 degrees
  Perspective: perspective(1000px)
  Transform origin: center
  Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)
  Reset duration: 300ms
  Shadow intensity: Increases with tilt angle
  
Code pattern:
  1. Track mouse position relative to card
  2. Calculate rotation: X = (y - center) * 0.05; Y = (x - center) * -0.05
  3. Apply: transform: rotateX(X) rotateY(Y) scale(1.02)
  4. On leave: rotateX(0) rotateY(0) scale(1)
```

### Prompt 2: 3D Flip Card
```
Design a 3D flip card animation that:
- Flips on click/hover to reveal back side
- Shows smooth 3D rotation along Y-axis
- Hides back content during flip (backface-visibility: hidden)
- Back side contains different content/info
- Plays sound effect on flip (optional)
- Works on mobile and desktop
- Smooth return animation when flipped back

Specifications:
  Duration: 600-800ms
  Easing: cubic-bezier(0.68, -0.55, 0.265, 1.55)
  Axis: rotateY (180 degrees)
  Perspective: perspective(1200px)
  Trigger: Click or hover (specify)
  
Structure:
  - Container with perspective
  - Front face (initial content)
  - Back face (hidden, rotated 180deg)
  - On flip: front rotateY(180), back rotateY(0)
  - Backface-visibility: hidden on both
```

### Prompt 3: 3D Scroll Depth Effect
```
Design a 3D depth effect that responds to scroll:
- Elements scale and rotate based on scroll position
- Objects appear to move away/toward viewer as scroll
- Creates parallax depth illusion
- Maintains readability at all scroll positions
- Smooth interpolation between scroll points
- Works with momentum scrolling

Specifications:
  Scale range: 0.8x to 1.2x
  Rotation range: -5 to +5 degrees
  Z-axis translation: -100px to +100px (via scale)
  Scroll trigger points: Define key frames
  Easing: Linear interpolation during scroll
  
Implementation:
  1. Calculate scroll progress (0-1)
  2. For each element, compute: scale = 0.8 + (progress * 0.4)
  3. Apply: transform: translateZ(progress * 200px) scale(scale)
  4. Update on scroll event at 60fps
```

### Prompt 4: 3D Text Extrusion
```
Design 3D extruded text that:
- Shows depth/shadow layers below text
- Responds to light source position
- Creates embossed or debossed effect
- Animates on hover (shifts perspective)
- Shadows follow mouse movement
- Smooth shadow transitions
- Works with custom fonts

Specifications:
  Text layers: 3-5 duplicate layers with offset
  Layer spacing: 2-4px downward
  Base color: Brand primary
  Shadow layers: Darker shade, increasing opacity
  Shadow blur: 2-4px progressive increase
  Light source: Follows cursor position (optional)
  
Shadow placement:
  Layer 1 (closest): offset(1px, 1px), blur(0px), opacity(0.3)
  Layer 2: offset(2px, 2px), blur(1px), opacity(0.2)
  Layer 3 (deepest): offset(4px, 4px), blur(3px), opacity(0.1)
```

---

## 🎭 ENTRANCE REVEAL EFFECTS

### Prompt 5: Staggered Slide-In
```
Design staggered entrance animation for list/grid items:
- Each item slides in from different direction
- Sequential delay creates cascade effect (50-100ms between items)
- Smooth easing for natural motion
- Opacity fades in simultaneously with movement
- Works on page load and content updates
- Maintains performance with 30+ items

Specifications:
  Initial state: opacity(0), translateX(-40px)
  Final state: opacity(1), translateX(0)
  Duration: 500-700ms per item
  Stagger delay: 75ms between items
  Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
  
Direction variations:
  Left-to-right: translateX(-40px) → translateX(0)
  Right-to-left: translateX(40px) → translateX(0)
  Top-to-bottom: translateY(-40px) → translateY(0)
  Bottom-to-top: translateY(40px) → translateY(0)
  
Stagger calculation:
  Delay = index * 75ms (max 1000ms)
```

### Prompt 6: Clip-Path Reveal
```
Design clip-path reveal animation for images/content:
- Image/content gradually becomes visible via clip-path
- Reveals direction: left-to-right, circular, diagonal, custom shape
- Smooth morphing between clip-path values
- Background blur effect during reveal (optional)
- Text overlays animate during reveal
- High-quality smooth animation (no jank)

Specifications:
  Initial clip-path: polygon(0 0, 0 0, 0 100%, 0 100%)
  Final clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%)
  Duration: 800ms-1.2s
  Easing: ease-out (slower start)
  
Reveal directions:
  Horizontal: polygon(0 0, X% 0, X% 100%, 0 100%)
  Vertical: polygon(0 0, 100% 0, 100% Y%, 0 Y%)
  Circular: circle(R% at 50% 50%)
  Diagonal: polygon(0 0, X% 0, 0 Y%)
  Custom: Define custom polygon points
```

### Prompt 7: Morphing Shape Entrance
```
Design morphing shape entrance animation:
- SVG shape morphs from simple to complex
- Example: Circle → Star, Line → Arrow, Square → Icon
- Smooth path interpolation (d attribute animation)
- Color shifts during morph (optional)
- Scales and positions during animation
- Works with multiple SVG paths

Specifications:
  Duration: 600-900ms
  Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)
  Path interpolation: Use SVG morphSVG or GASP plugins
  
Shape examples:
  Circle to star: Start small circle, end as star shape
  Line to arrow: Single path → arrow with head
  Square to icon: Outline → filled icon
  
Implementation:
  1. Define start and end SVG paths (same point count)
  2. Animate d attribute from start → end
  3. Optional: Animate fill, stroke, opacity simultaneously
  4. Use viewBox for scaling flexibility
```

### Prompt 8: Text Letter-by-Letter Reveal
```
Design letter-by-letter entrance animation:
- Each character animates in sequentially
- Individual animations: slide, fade, bounce, scale
- Stagger timing (30-60ms between letters)
- Maintains reading flow naturally
- Works with multiple lines
- Smooth grouping of characters by word (optional)

Specifications:
  Duration per letter: 400-600ms
  Stagger: 50ms between letters
  Initial state variations:
    Slide: translateX(-20px), opacity(0)
    Fade: opacity(0)
    Bounce: translateY(20px), opacity(0)
    Scale: scale(0.5), opacity(0)
  Final state: Default position, opacity(1), scale(1)
  Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
  
Implementation:
  1. Wrap each letter in <span> or <tspan>
  2. Calculate delay: index * 50ms
  3. Apply animation to each element
  4. Use CSS animation or GSAP for precise control
```

---

## ✨ MICRO INTERACTIONS

### Prompt 9: Button Click Ripple
```
Design button click ripple/wave effect:
- Circular ripple expands from click point
- Ripple grows and fades simultaneously (200-400ms)
- Multiple ripples can stack (if rapid clicks)
- Ripple stays within button boundaries (clip)
- Smooth performance with hardware acceleration
- Works on touch and mouse clicks

Specifications:
  Initial size: 0px diameter at click point
  Final size: Extends beyond button (1.5x diagonal)
  Initial opacity: 0.6-0.8
  Final opacity: 0
  Duration: 300-400ms
  Easing: ease-out (cubic-bezier(0, 0, 0.2, 1))
  Color: Brand color at 30-50% opacity
  
Implementation:
  1. Track click coordinates (clientX, clientY)
  2. Create ripple element at click point
  3. Animate: transform: scale(1 → 4), opacity(0.8 → 0)
  4. Remove element after animation (cleanup)
  5. Clip to button boundaries: overflow(hidden)
```

### Prompt 10: Floating Label Animation
```
Design floating label animation for form inputs:
- Label floats up when input is focused/filled
- Smooth scaling (0.75x) and position shift
- Label stays above input field
- Works with different input types
- Maintains readability in all states
- Smooth color transition (muted → primary color)

Specifications:
  Resting state: Inside input, opacity(0.6), font-size(16px)
  Floating state: Above input, opacity(1), font-size(12px), translateY(-24px)
  Duration: 200ms
  Easing: cubic-bezier(0.4, 0, 0.2, 1)
  Color change: #A0AEC0 → Brand color
  Scale: 1 → 0.75
  
Trigger conditions:
  1. On input focus
  2. On input filled (value.length > 0)
  3. On input blur (if empty, return to rest state)
  4. Preserve floating state if input has value
```

### Prompt 11: Checkbox/Toggle Animation
```
Design smooth checkbox check mark animation:
- Check mark draws/appears on selection
- Smooth transition with scaling
- Works with toggle switches (morphing shape)
- Maintains accessibility (keyboard support)
- Smooth color transition
- Optional: Subtle success animation

Specifications:
  Checkbox:
    Initial: unchecked, opacity(0)
    On check: Check mark draws or scales in (200-300ms)
    Color: Gray → Brand success/accent
    Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
  
  Toggle Switch:
    Initial: Knob left, bg off-color
    On toggle: Knob slides right (250ms), bg color changes
    Border radius: Remains constant
    Shadow: Increases on active state
    
  Checkmark SVG:
    Path animation (stroke-dasharray/stroke-dashoffset)
    Or: Scale from center with opacity fade-in
```

### Prompt 12: Counter/Number Animation
```
Design smooth counter increment animation:
- Numbers animate from current to new value
- Smooth scroll or fade-in transitions
- Maintains readability at all speeds
- Works with large numbers (thousands)
- Optional: Sound effect on count completion
- Smooth easing for natural feel

Specifications:
  Duration: 600-1000ms (based on difference)
  Easing: ease-out
  
  Animation methods:
    1. Scroll method: Numbers slide up/down
       Initial: translateY(40px), opacity(0)
       Final: translateY(0), opacity(1)
       
    2. Increment method: Count from start to end
       Update value every 16ms (60fps)
       Ease progress 0-1
       
    3. Fade method: Old value fades out, new fades in
       Duration: 300ms fade out + fade in
  
  Performance: Use transform (GPU acceleration)
```

---

## 🌀 PARALLAX EFFECTS

### Prompt 13: Scroll-Based Parallax
```
Design scroll-based parallax for hero section/images:
- Background layer moves slower than foreground
- Multiple layers with different speeds create depth
- Smooth parallax at various scroll speeds
- Works on desktop and mobile (touch)
- Performance optimized (uses transform only)
- Maintains image quality

Specifications:
  Layer speeds (multiplier of scroll distance):
    Background (furthest): 0.3x-0.5x scroll
    Mid layer: 0.6x-0.8x scroll
    Foreground (closest): 1x scroll (normal)
    Text overlay: 0.7x scroll
  
  Implementation:
    1. Calculate scroll position (window.scrollY)
    2. For each layer: offset = scrollY * speedMultiplier
    3. Apply: transform: translateY(offset)
    4. Update on scroll (throttle to 60fps)
    5. Use GPU acceleration: will-change(transform)
  
  Calculation:
    distance = scrollTop - elementOffsetTop
    translateValue = distance * speed * -1
    transform: translateY(translateValue)
```

### Prompt 14: Mouse-Following Parallax
```
Design mouse-following parallax effect:
- Multiple layers follow cursor at different speeds
- Creates depth illusion based on mouse position
- Smooth tracking without lag
- Works on desktop (ignore mobile)
- Subtle and not distracting
- Smooth easing on position updates

Specifications:
  Tracking range: Full viewport size
  Max displacement: 20-40px per layer
  Layer speeds (distance from center):
    Background: 0.1x (slowest)
    Mid layer: 0.3x
    Foreground: 0.5x (fastest)
  
  Implementation:
    1. Track mouse position (clientX, clientY)
    2. Calculate offset from center: offsetX = mouseX - centerX
    3. For each layer: moveX = offsetX * speed
    4. Apply: transform: translateX(moveX) translateY(moveY)
    5. Smooth with requestAnimationFrame
  
  Easing: Use spring animation (CSS animation or GSAP)
  Duration: 300-400ms to settle
  Damping: 0.15-0.2 (slight overshoot)
```

### Prompt 15: Text Parallax Reveal
```
Design parallax text reveal effect:
- Text animates during scroll
- Characters or words move at different speeds
- Creates staggered entrance during scroll
- Coordinates with background parallax
- Smooth readability maintained
- Works with variable line length

Specifications:
  Text animation on scroll:
    Initial: opacity(0), translateY(40px)
    On scroll into view: opacity(1), translateY(0)
    
  Speeds (as viewport scrolls):
    Headline: Slower parallax (0.4x)
    Body text: Moderate parallax (0.6x)
    Accent text: Faster parallax (0.8x)
  
  Calculation:
    1. Calculate element's scroll progress (0-1)
    2. Apply parallax: offset = progress * maxDistance * speed
    3. Apply opacity: opacity = progress
    4. Combine: transform + opacity change
    
  Trigger: When element enters viewport (50-80% visible)
```

---

## 👆 HOVER EFFECTS

### Prompt 16: Magnetic Button Hover
```
Design magnetic/attracting hover effect for buttons:
- Button content "pulls" toward cursor on hover
- Creates attraction illusion
- Smooth tracking with slight lag (easing)
- Resets smoothly on mouse leave
- Works with text and icons
- Subtle, not disruptive

Specifications:
  Max attraction: 15-20px displacement
  Tracking speed: 200-300ms response time
  Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)
  
  Implementation:
    1. Track mouse position over button
    2. Calculate cursor distance from element center
    3. Apply displacement: offsetX = (cursorX - centerX) * 0.3
    4. Transform: translate(offsetX, offsetY)
    5. Smooth with animation frame
    6. Reset on leave: translate(0, 0)
  
  Combined with:
    - Background color shift
    - Shadow increase
    - Scale: 1 → 1.05
```

### Prompt 17: Gradient Shift Hover
```
Design gradient animation on hover:
- Background gradient animates/shifts on hover
- Gradient angle or color changes smoothly
- Creates dynamic, energetic feel
- Works on buttons, cards, sections
- Smooth color transitions (no jarring shifts)
- Performance optimized

Specifications:
  Initial gradient: Two-color diagonal (45deg)
  Hover gradient: Different angle or colors (135deg)
  Duration: 400-600ms
  Easing: ease-out
  
  Gradient examples:
    Angle shift: 45deg → 135deg (colors remain)
    Color shift: blue→purple → green→cyan
    Position shift: background-position animate
    
  Implementation:
    1. Define two background gradients
    2. Use background-size and background-position
    3. On hover: background-position: change
    4. Animate background-color or gradient values
    5. Use will-change: background-color for performance
```

### Prompt 18: Icon Rotation & Scale Hover
```
Design icon animation on hover:
- Icon rotates, scales, or bounces on hover
- Smooth and playful feel
- Works on links, buttons, cards
- Multiple animation variations
- Quick response time
- Maintains alignment during animation

Specifications:
  Basic rotation:
    Initial: rotate(0deg)
    Hover: rotate(360deg)
    Duration: 400ms
    Timing: cubic-bezier(0.34, 1.56, 0.64, 1)
  
  Bounce scale:
    Initial: scale(1)
    Hover: scale(1) → scale(1.2) → scale(1)
    Duration: 300ms
    Easing: cubic-bezier(0.68, -0.55, 0.265, 1.55)
  
  Variants:
    1. Rotate + Scale: rotate(45deg) scale(1.15)
    2. Bounce: scale(1 → 1.3 → 1)
    3. Flip: scaleX(-1)
    4. Orbit: rotate around container
  
  Transform origin: center
```

### Prompt 19: Underline Grow Hover
```
Design growing underline/border on link hover:
- Underline expands from center
- Smooth growth animation
- Works with text links and buttons
- Different grow directions (horizontal, vertical)
- Color transition during growth
- Maintains text baseline

Specifications:
  Initial: scaleX(0), translateX(-50%), opacity(0)
  Hover: scaleX(1), translateX(0), opacity(1)
  Duration: 300-400ms
  Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
  
  Directions:
    Center-out: scaleX(0 → 1) at center
    Left-to-right: scaleX(0) translateX(-50%) origin left
    Right-to-left: scaleX(0) translateX(50%) origin right
    
  Implementation using ::after:
    ::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      width: 100%;
      height: 2px;
      background: brand-color;
      transform: scaleX(0);
      transform-origin: center;
      transition: transform 300ms ease-out;
    }
    &:hover::after {
      transform: scaleX(1);
    }
  
  Color: Can shift from gray → brand color
```

### Prompt 20: Card Lift & Shadow Hover
```
Design card elevation effect on hover:
- Card lifts up (translateY negative)
- Shadow increases/changes
- Smooth upward motion
- Works on all card elements
- Quick response time
- Maintains layout without shift

Specifications:
  Initial: translateY(0), shadow(0 2px 8px rgba(0,0,0,0.1))
  Hover: translateY(-8px), shadow(0 20px 32px rgba(0,0,0,0.2))
  Duration: 300-400ms
  Easing: cubic-bezier(0.4, 0, 0.2, 1)
  
  Shadow progression:
    Rest: 0 2px 8px rgba(0,0,0,0.1)
    Hover: 0 20px 32px rgba(0,0,0,0.2)
    
  Combined effects:
    1. translateY: -8px
    2. box-shadow: Multiple layers for depth
    3. border-color: Subtle change (optional)
    4. background: Slight brightening (optional)
    
  Performance: Use will-change: transform, box-shadow
```

---

## 🔄 SMOOTH LOADERS

### Prompt 21: Animated Spinner Loader
```
Design smooth animated spinner/loading icon:
- Circular spinner with rotating stroke
- Smooth infinite rotation
- Gradient colors (optional)
- Breathing/pulsing opacity
- Performance optimized
- Works at any size

Specifications:
  Spinner: Circle stroke (SVG or CSS)
  Initial size: 48-64px
  Stroke width: 3-4px
  Animation:
    Rotation: 2s full 360° rotation, infinite, linear
    Breathing: opacity 0.4 → 1 → 0.4 (pulsing)
    Pulse duration: 2s (synced with rotation)
  
  Color options:
    Solid: Brand primary color
    Gradient: Brand primary → secondary
    Pulse colors: Color shifts during rotation
  
  CSS approach:
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    animation: spin 2s linear infinite;
  
  SVG approach:
    <circle r="45" stroke="brand-color" stroke-width="4" />
    Animate via CSS rotation
```

### Prompt 22: Dots/Bouncing Loader
```
Design bouncing dots loading animation:
- 3-4 dots that bounce/scale up and down
- Sequential timing creates wave effect
- Smooth up/down motion
- Color optional (single or multiple)
- Playful, friendly feel
- Optimized performance

Specifications:
  Dots: 3-4 circles, 8-12px diameter
  Spacing: 8-12px between dots
  Animation:
    Scale: 0.5 → 1 → 0.5
    Translate: translateY(-20px) on peak
    Duration: 1200-1400ms total
    Stagger: 150-200ms between dots
  
  Easing: cubic-bezier(0.68, -0.55, 0.265, 1.55)
  
  Colors:
    Option 1: All same color (brand)
    Option 2: Each dot different color (gradient)
    Option 3: Color shifts during animation
  
  Timing sequence:
    Dot 1: 0ms start
    Dot 2: 150ms start
    Dot 3: 300ms start
    Loop: 1200ms total duration
```

### Prompt 23: Shimmer/Skeleton Loader
```
Design shimmer effect for loading skeleton:
- Gradient shimmer moves left-to-right
- Smooth, realistic content loading feeling
- Works on multiple skeleton elements
- Synchronized or staggered timing
- Placeholder matches content dimensions
- Subtle and not distracting

Specifications:
  Skeleton setup:
    Background: #E2E8F0 (light mode) / #2D3748 (dark mode)
    Border-radius: Matches target element
    Height: Matches expected content
  
  Shimmer effect:
    Gradient: Transparent → white(0.4 opacity) → transparent
    Duration: 1.8-2s
    Direction: Left-to-right
    Easing: ease-in-out
  
  Implementation using ::after:
    ::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.4),
        transparent
      );
      animation: shimmer 2s infinite;
    }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
```

### Prompt 24: Progress Bar Loader
```
Design animated progress bar for loading:
- Linear progress bar with smooth animation
- Realistic progress indication (0-100%)
- Smooth easing on value changes
- Color fills from left to right
- Optional: Indeterminate state (back-and-forth)
- Secondary progress overlay (optional)

Specifications:
  Initial: width(0%), opacity(1)
  On progress: width(current%), smooth transition
  Final: width(100%), opacity fades out
  Duration per update: 300-400ms
  Easing: cubic-bezier(0.4, 0, 0.2, 1)
  
  Bar height: 4-6px
  Border-radius: var(--radius) (rounded ends)
  Background: Gray (light mode) / Darker gray (dark mode)
  Fill color: Brand gradient or solid color
  
  States:
    1. Determinate: Shows actual progress (0-100%)
    2. Indeterminate: Animates back-and-forth
       Duration: 2s
       Movement: 0 → 100 → 0
  
  Animation for indeterminate:
    @keyframes progress {
      0% { width: 0%; }
      50% { width: 100%; }
      100% { width: 0%; }
    }
```

### Prompt 25: Circular Progress Loader
```
Design circular progress indicator for loading:
- SVG circle that fills as progress increases
- Smooth circumference animation
- Percentage display in center (optional)
- Color gradient (optional)
- Works at any size
- Supports indeterminate state

Specifications:
  SVG circle:
    Radius: Responsive (fit container)
    Stroke width: 3-4px
    Initial stroke: #E2E8F0 (background)
    Progress stroke: Brand primary → secondary gradient
  
  Animated properties:
    stroke-dasharray: Circle circumference (2πr)
    stroke-dashoffset: Changes with progress
    Rotation: Rotates container for visual effect
  
  Progress calculation:
    Circumference = 2 * π * radius
    Offset = Circumference * (1 - progress)
    animation: stroke-dashoffset change
    
  Duration: 400-500ms per update
  Easing: ease-out
  
  Center text (optional):
    Percentage: 0-100%
    Label: "Loading...", "Downloaded"
    Color: Brand primary
    Font-size: Scales with circle
```

---

## 🎨 THEME-AWARE IMPLEMENTATION

### Light Mode Colors
```
Brand Primary: #3B82F6 (blue)
Brand Secondary: #8B5CF6 (purple)
Success: #10B981 (green)
Warning: #F59E0B (amber)
Error: #EF4444 (red)
Neutral: #E2E8F0 (light gray)
Text: #1A202C (dark navy)
Muted: #A0AEC0 (muted gray)
```

### Dark Mode Colors
```
Brand Primary: #60A5FA (light blue)
Brand Secondary: #A78BFA (light purple)
Success: #86EFAC (light green)
Warning: #FBBF24 (light amber)
Error: #FCA5A5 (light red)
Neutral: #2D3748 (dark gray)
Text: #E2E8F0 (light gray)
Muted: #64748B (muted gray)
```

---

## ⚡ PERFORMANCE GUIDELINES

### Do's
- ✅ Use `transform` (GPU acceleration)
- ✅ Use `opacity` changes
- ✅ Throttle scroll/mouse events (60fps)
- ✅ Use `will-change` for expensive animations
- ✅ Use CSS animations over JS when possible
- ✅ Debounce rapid interactions
- ✅ Load images lazily during animations

### Don'ts
- ❌ Animate `width` or `height` (use `transform: scale`)
- ❌ Animate `top`/`left`/`right`/`bottom` (use `transform: translate`)
- ❌ Use excessive shadows or filters
- ❌ Create too many DOM elements
- ❌ Update animations every single scroll/mouse event
- ❌ Use expensive blur/glow effects heavily

---

## 🔧 LIBRARY RECOMMENDATIONS

### CSS Animations
```
Use for: Simple, repeating animations
Pros: Native, no dependencies, best performance
Cons: Limited control, no event-based triggers
```

### GSAP (GreenSock)
```
Use for: Complex, sequenced, staggered animations
Pros: Powerful, precise control, timeline support
Cons: External library, bundle size
```

### Framer Motion
```
Use for: React-based animations
Pros: Component-friendly, spring physics
Cons: React-only, library dependency
```

### Three.js / Babylon.js
```
Use for: 3D animations
Pros: Full 3D capabilities, powerful rendering
Cons: Large bundle, steep learning curve
```

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] All animations under 600ms for responsiveness
- [ ] GPU acceleration with `transform` properties
- [ ] Smooth easing functions (avoid linear)
- [ ] Performance tested on low-end devices
- [ ] Animations pause when `prefers-reduced-motion`
- [ ] Hover effects work on mobile (touch)
- [ ] Loading states provide feedback
- [ ] Animations don't interfere with usability
- [ ] 60fps performance maintained
- [ ] Theme switching updates animation colors
- [ ] Accessibility maintained (no motion sickness)
- [ ] Testing on various browsers/devices
