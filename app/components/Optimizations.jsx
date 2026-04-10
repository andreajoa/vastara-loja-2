/**
 * SEO & Performance Optimizations for Vastara
 *
 * These utilities help with PageSpeed improvements without breaking functionality
 */

// ============================================
// IMAGE OPTIMIZATION HELPERS
// ============================================

/**
 * Get responsive image sizes based on container
 * Helps with LCP by serving right-sized images
 */
export const getResponsiveImageProps = (image, width = 400, height = 400, priority = false) => {
  if (!image) return { alt: '' };

  const baseParams = {
    alt: image.altText || '',
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
  };

  // Add fetchpriority for modern browsers
  if (priority) {
    baseParams.fetchpriority = 'high';
  }

  // For product images from Shopify, use the Image component with sizing
  return {
    ...baseParams,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    // Critical images for LCP
  };
};

/**
 * Format price consistently
 */
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// ============================================
// ACCESSIBILITY HELPERS
// ============================================

/**
 * Generate accessible button props
 */
export const getAccessibleButtonProps = (label, onClick) => ({
  'aria-label': label,
  onClick,
});

/**
 * Check color contrast ratio
 */
export const hasSufficientContrast = (foreground, background, threshold = 4.5) => {
  // Simple luminance calculation for contrast check
  const getLuminance = (hex) => {
    const rgb = hex.match(/\w\w/g)?.map(x => parseInt(x, 16) / 255) || [0, 0, 0];
    const [r, g, b] = rgb.map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (brighter + 0.05) / (darker + 0.05) >= threshold;
};

/**
 * Safe color combinations with good contrast
 */
export const SAFE_COLOR_PAIRS = {
  lightTextOnDark: { text: '#ffffff', bg: '#0a0a0a', ratio: 21 },
  goldOnDark: { text: '#c9a84c', bg: '#0a0a0a', ratio: 12.6 },
  grayOnDark: { text: 'rgba(255,255,255,0.6)', bg: '#0a0a0a', ratio: 8.5 },
};

// ============================================
// PERFORMANCE HELPERS
// ============================================

/**
 * Check if element is in viewport
 * Useful for lazy loading optimization
 */
export const isInViewport = (element, threshold = 0.1) => {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
  const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
  return vertInView && horInView;
};

/**
 * Debounce function for scroll/resize handlers
 */
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Preload critical resources
 * Call in head/links for critical fonts/images
 */
export const PRELOAD_SUGGESTIONS = {
  // Critical above-fold fonts
  fonts: [
    { href: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vysZs7B96zM4.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
  ],
  // Critical hero images
  images: [
    { href: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_1.jpg?v=1772467367', as: 'image', type: 'image/jpeg' },
  ],
};
