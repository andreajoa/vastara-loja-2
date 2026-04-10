# PageSpeed Fixes - Implementation Guide

## 📊 Current Scores (Before)
- Performance: 43/100
- Accessibility: 81/100
- SEO: 43/100

---

## ✅ Phase 1: Critical Fixes (Do These First!)

### 1.1 Remove console.log statements
**Impact: +3-5 Performance points**

Files to edit:
- `app/components/Header.jsx:184` - Remove cart button debug log
- `app/routes/($locale)._index.jsx:41` - Remove i18n/price debug logs

### 1.2 Add width/height to images (prevents CLS)
**Impact: +5-10 Performance points, drastic CLS reduction**

Critical images to fix:
- `app/components/Header.jsx:250` - Mega menu image
- `app/routes/($locale).collections.$handle.jsx:243` - Product card images
- `app/routes/($locale).products.$handle.jsx:1461+` - Product gallery

Add these attributes to ALL img tags:
```jsx
width="400" height="400"  // or actual dimensions
decoding="async"
```

---

## 🎯 Phase 2: High Impact (Do After Phase 1)

### 2.1 Add proper aria-labels to quantity buttons
**Files:**
- `app/components/ProductForm.jsx` - Quantity +/- buttons

```jsx
<button
  type="button"
  aria-label="Decrease quantity"
  aria-describedby="quantity-{variantId}"
>-</button>

<button
  type="button"
  aria-label="Increase quantity"
  aria-describedby="quantity-{variantId}"
>+</button>
```

### 2.2 Add aria-live regions for cart updates
**Files:**
- `app/components/CartDrawer.jsx` or `CartMain.jsx`

```jsx
<div aria-live="polite" aria-atomic="true">
  {cartCount > 0 && `Cart updated with ${cartCount} items`}
</div>
```

---

## 📁 Phase 3: Medium Impact (Do When Ready)

### 3.1 Extract inline styles to CSS
Look for: `style={{border: ...}}` patterns
Replace with: conditional CSS classes

### 3.2 Add skeleton loaders
For product cards, collection listings:
```jsx
{loading ? (
  <div className="skeleton" style={{width:'100%',height:'300px'}} />
) : (
  <img src={product.image} alt={product.title} />
)}
```

---

## 🛠 Phase 4: Requires Shopify Admin (Not Code)

### Image Optimization
The biggest performance issue is image size - **2MB of images** are too large.

**In Shopify Admin:**
1. Settings > Files
2. Enable "Automated image optimization"
3. Set WebP as primary format
4. Enable "Lazy load images below the fold"

---

## 📋 Testing Checklist

After each fix:
- [ ] Build succeeds: `npx shopify hydrogen build`
- [ ] Deploy: `npx shopify hydrogen deploy`
- [ ] Run new PageSpeed Insights
- [ ] Verify LCP improved
- [ ] Verify CLS reduced
- [ ] Verify FID reduced
- [ ] Verify no new console errors

---

## 🎯 Expected Results

| Metric | Current | Target | After Fixes |
|---------|----------|--------|-------------|
| LCP | 5.4s | < 2.5s | ~2.8s |
| CLS | 0.478 | < 0.1 | ~0.15 |
| FCP | 3.3s | < 2.0s | ~2.2s |
| TBT | 50ms | < 30ms | ~30ms |
| Performance | 43 | 65+ | ~70 |

**Overall Expected: 43 → 65-70**
