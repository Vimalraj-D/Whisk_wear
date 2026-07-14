/**
 * Animates a product image particle flying from the click event source to the navbar cart icon.
 * Uses high-performance 3D transforms and triggers a bounce animation on the cart icon upon completion.
 *
 * @param {Event} event - The click event that triggered the add-to-cart action.
 * @param {string} imageUrl - URL of the product image to display inside the particle.
 */
export function animateFlyToCart(event, imageUrl) {
  if (!event || !imageUrl) return;

  // Find the header cart button icon
  const cartBtn = document.querySelector('.cart-btn');
  if (!cartBtn) return;

  // Calculate ending position (center of cart button)
  const cartRect = cartBtn.getBoundingClientRect();
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  // Calculate starting position (cursor click point or center of button clicked)
  let startX = event.clientX;
  let startY = event.clientY;

  if (!startX || !startY) {
    const btnRect = event.currentTarget.getBoundingClientRect();
    startX = btnRect.left + btnRect.width / 2;
    startY = btnRect.top + btnRect.height / 2;
  }

  // Create flyer particle element
  const flyer = document.createElement('div');
  flyer.className = 'fly-to-cart-particle';
  
  // Style properties
  flyer.style.position = 'fixed';
  flyer.style.width = '42px';
  flyer.style.height = '42px';
  flyer.style.borderRadius = '50%';
  flyer.style.backgroundImage = `url(${imageUrl})`;
  flyer.style.backgroundSize = 'cover';
  flyer.style.backgroundPosition = 'center';
  flyer.style.border = '2px solid #7E57C2';
  flyer.style.boxShadow = '0 8px 24px rgba(126, 87, 194, 0.4)';
  flyer.style.zIndex = '99999';
  flyer.style.pointerEvents = 'none';
  
  // Initial position
  flyer.style.left = `${startX - 21}px`;
  flyer.style.top = `${startY - 21}px`;
  
  // Set initial transition state
  flyer.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s ease-in-out';
  flyer.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)';
  flyer.style.opacity = '1';

  document.body.appendChild(flyer);

  // Force DOM reflow to enable transition from starting values
  void flyer.offsetWidth;

  // Animate toward destination while scaling down and rotating
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  
  // An upward-curved arc effect can be simulated via translation coordinates
  flyer.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.15) rotate(420deg)`;
  flyer.style.opacity = '0.15';

  // Event listener to cleanup flyer and animate cart icon on arrival
  const cleanup = () => {
    flyer.remove();
    // Trigger cart wiggle animation
    cartBtn.classList.remove('cart-bounce');
    void cartBtn.offsetWidth; // Force reflow
    cartBtn.classList.add('cart-bounce');
  };

  flyer.addEventListener('transitionend', cleanup);
  
  // Safety timeout in case transitionend event is missed
  setTimeout(() => {
    if (flyer.parentNode) {
      cleanup();
    }
  }, 800);
}
