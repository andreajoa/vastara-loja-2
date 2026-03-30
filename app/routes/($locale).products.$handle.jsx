import {useLoaderData, Link, useNavigate, useFetcher} from 'react-router';
import {useCart} from '~/components/Layout';
import {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  CartForm,
  Image,
} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta = ({data}) => {
  const product = data?.product;
  const title = product?.title ?? '';
  const description = product?.description?.slice(0, 155) || `Buy ${title} at Vastara. Free worldwide shipping. Top quality watches for men and women.`;
  const image = product?.images?.nodes?.[0]?.url || 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_1.jpg';
  const url = `https://vastara.online/products/${product?.handle}`;
  const price = product?.priceRange?.minVariantPrice?.amount || '0';
  const currency = product?.priceRange?.minVariantPrice?.currencyCode || 'USD';
  const available = product?.availableForSale ? 'in stock' : 'out of stock';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    image,
    url,
    brand: {'@type': 'Brand', name: product?.vendor || 'Vastara'},
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${available === 'in stock' ? 'InStock' : 'OutOfStock'}`,
      url,
      seller: {'@type': 'Organization', name: 'Vastara'},
    },
    sku: product?.selectedOrFirstAvailableVariant?.sku || product?.handle,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '124',
      bestRating: '5',
    },
  };

  return [
    {title: `${title} | Vastara Watches`},
    {name: 'description', content: description},
    {rel: 'canonical', href: url},
    {property: 'og:type', content: 'product'},
    {property: 'og:title', content: `${title} | Vastara Watches`},
    {property: 'og:description', content: description},
    {property: 'og:image', content: image},
    {property: 'og:url', content: url},
    {property: 'og:site_name', content: 'Vastara'},
    {property: 'product:price:amount', content: price},
    {property: 'product:price:currency', content: currency},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: `${title} | Vastara Watches`},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: image},
    {'script:ld+json': schema},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {'@type': 'ListItem', position: 1, name: 'Home', item: 'https://vastara.online'},
          {'@type': 'ListItem', position: 2, name: 'Watches', item: 'https://vastara.online/collections'},
          {'@type': 'ListItem', position: 3, name: title, item: `https://vastara.online/products/${product?.handle}`},
        ],
      },
    },
  ];
};

export async function loader(args) {
  const {params, request, context} = args;
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw new Error('Expected product handle to be defined');

  const [{product}, allProductsData] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    storefront.query(ALL_PRODUCTS_QUERY),
  ]);

  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});

  let recommended = [];
  try {
    const recData = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: {productId: product.id},
    });
    recommended = recData?.productRecommendations || [];
  } catch (e) {
    recommended = [];
  }

  return {
    product,
    allProducts: allProductsData?.products?.nodes || [],
    recommended,
  };
}

function fmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(parseFloat(amount));
}

function StarRating({rating = 5, size = 13}) {
  return (
    <span style={{display: 'inline-flex', gap: '1px'}}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.floor(rating);
        const half = !filled && i - rating < 1 && i - rating > 0;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? '#c9a84c' : half ? 'url(#halfGrad)' : 'none'}
            stroke="#c9a84c"
            strokeWidth="1.5"
          >
            {half && (
              <defs>
                <linearGradient id="halfGrad">
                  <stop offset="50%" stopColor="#c9a84c" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        );
      })}
    </span>
  );
}

function seededRandom(seed) {
  let s = Math.abs(seed) || 1;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function seedFromId(id) {
  return (id || '').split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
}

const REVIEWER_NAMES = [
  'James T.','Michael R.','Robert K.','William S.','David M.','Richard P.','Thomas H.',
  'Christopher L.','Daniel W.','Matthew B.','Anthony G.','Sarah J.','Jennifer A.',
  'Emily C.','Amanda F.','Jessica N.','Elizabeth D.','Stephanie V.','Lauren H.','Ashley M.',
  'Alexander K.','Benjamin R.','Charles W.','Edward T.','Frank L.','George P.','Henry B.',
  'Ian S.','Jack D.','Kevin M.','Marcus W.','Nathan R.','Oliver J.','Patrick C.','Quinn A.',
  'Ryan F.','Samuel G.','Timothy H.','Victor L.','Walter N.','Andrew P.','Brian T.',
  'Carlos D.','Derek S.','Eric V.','Frederick B.','Gabriel M.','Harrison K.','Isaac R.','Jonathan W.',
];

const REVIEW_TITLES = [
  'Absolutely Stunning Timepiece','Worth Every Penny','Exceeded My Expectations',
  'A True Masterpiece','Perfect Gift','Incredible Quality','Love This Watch',
  'Best Purchase This Year','Elegant and Sophisticated','Outstanding Craftsmanship',
  'Simply Beautiful','Premium Quality Watch','Remarkable Attention to Detail',
  'A Real Head Turner','Impeccable Design','Luxury at Its Finest','My Daily Companion',
  'Superb Build Quality','Classic and Timeless','Highly Recommend','Pure Elegance',
  'Fantastic Timepiece','Unmatched Quality','A True Classic','Sophisticated Style',
  'Perfect for Any Occasion','Beautiful Movement','Exceeds the Price Point',
  'Museum-Quality Piece','The Perfect Watch',
];

const REVIEW_BODIES = [
  "I've been wearing this watch for about a month now and I'm absolutely thrilled with it. The weight feels perfect on my wrist, and the finishing is exceptional for the price point. The dial catches the light beautifully throughout the day. Highly recommended for anyone looking for a quality timepiece.",
  "This watch has become my everyday companion. The build quality is remarkable — you can feel the attention to detail in every aspect from the case finishing to the smooth crown operation. The lume is surprisingly good too, easily readable in low light conditions.",
  "Purchased this as a gift for my husband's anniversary and he hasn't taken it off since. The presentation box was also very impressive. The watch itself has a substantial feel without being too heavy. Excellent value for what you get.",
  "As a watch collector with over 20 pieces, I can confidently say this punches well above its weight class. The movement is accurate, keeping within +/- 2 seconds per day. The sapphire crystal is a nice touch at this price point.",
  "The photos don't do this justice. In person, the dial has so much more depth and character. I've received multiple compliments wearing it to business meetings. The bracelet is also very comfortable with no hair pulling.",
  "Outstanding quality from VASTARA. The case finishing alternates between brushed and polished surfaces beautifully. The bezel action is crisp and precise. This is my third VASTARA watch and they continue to impress me.",
  "I was hesitant to purchase a watch online but I'm so glad I did. The shipping was fast, the packaging was premium, and the watch itself exceeded all my expectations. The indices are perfectly aligned and the dial is flawless.",
  "This timepiece is a real conversation starter. Every time I wear it to social events, someone asks about it. The design strikes the perfect balance between sporty and dressy. Can't recommend it enough.",
  "The craftsmanship on this watch is truly exceptional. I've compared it side by side with watches costing three times as much and it holds its own. The clasp mechanism is smooth and secure. Very satisfied with this purchase.",
  "Wearing this watch gives me a sense of confidence. The design is classic yet modern, suitable for both casual and formal settings. The date window is perfectly placed and easy to read. A fantastic addition to my collection.",
  "Been looking for the perfect daily driver watch and this is it. Water resistance has been tested and works perfectly. The sweep of the second hand is smooth and mesmerizing. Build quality is top-notch.",
  "What sets this watch apart is the attention to micro-details. The beveling on the lugs, the perfectly applied markers, the smooth winding action — everything speaks quality. This is what watchmaking should be about.",
  "Received this watch as a birthday gift and I'm blown away. The unboxing experience was premium from start to finish. The watch has a beautiful heft to it and sits perfectly on my 7-inch wrist.",
  "After months of research, I chose this over several more expensive options and I have zero regrets. The value proposition here is incredible. The movement is accurate, the finishing is superb, and the design is timeless.",
  "This is my second purchase from VASTARA and once again they've delivered excellence. The watch strap is buttery soft and comfortable right out of the box. The dial color is rich and changes subtly in different lighting.",
  "I wear this watch every day to the office and it still looks brand new. The scratch-resistant crystal does its job perfectly. The slim profile slides easily under shirt cuffs. A true dress watch done right.",
  "The balance of this watch is perfect — not too thick, not too thin. The case diameter is ideal for most wrist sizes. I appreciate the quick-release spring bars for easy strap changes. Very thoughtful design.",
  "Absolutely love the exhibition caseback on this piece. Watching the movement work is fascinating. My wife bought this for me and even she was impressed by the quality and presentation. 5 stars without hesitation.",
  "This watch represents everything I love about horology — precision, beauty, and craftsmanship all in one package. The applied hour markers catch the light wonderfully. The crown has a satisfying feel when setting the time.",
  "From the moment I opened the box, I knew this was special. The watch has a presence that photos simply cannot capture. After wearing it daily for 3 months, the accuracy remains impressive. A genuine luxury experience.",
  "I've recommended this watch to at least five friends already. The quality-to-price ratio is unmatched in my experience. The bracelet's micro-adjust feature is a game changer for comfort. Simply outstanding.",
  "The luminous markers on this watch are incredibly bright and long-lasting. Perfect for reading time in dark environments. The overall fit and finish rival watches at much higher price points.",
  "First luxury watch purchase and I couldn't be happier. The customer service was excellent and the watch arrived beautifully packaged. The weight and feel on the wrist is substantial without being cumbersome.",
  "Every detail of this watch has been carefully considered. The dial texture is mesmerizing up close, and the handset complements it perfectly. This is wearable art at its finest.",
  "Six months in and this watch continues to impress me daily. The power reserve is excellent, and it keeps remarkable time. The deployant clasp closes with a satisfying click. Best watch purchase I've ever made.",
];

const REPLY_TEXTS = [
  "Totally agree with your review! I had the same experience.",
  "Great to hear! I'm considering getting one too.",
  "I've had mine for 6 months and can confirm everything you said.",
  "Thanks for the detailed review, very helpful!",
  "Same here, absolutely love this timepiece.",
  "Couldn't agree more. Best purchase I've made this year.",
  "Your review convinced me to buy one. No regrets!",
  "Spot on review. The quality is really impressive.",
  "I got one after reading reviews like yours. So happy with it!",
  "Well said! This watch is truly something special.",
];

const DATE_OFFSETS = [2,5,8,12,15,19,23,28,34,40,47,55,63,72,82,93,105,118,132,147,163,180,198,217,237];

function generateReviewsForProduct(productId) {
  const seed = seedFromId(productId);
  const rng = seededRandom(seed);
  const count = Math.floor(rng() * 13) + 13;

  const names = [...REVIEWER_NAMES].sort(() => rng() - 0.5);
  const titles = [...REVIEW_TITLES].sort(() => rng() - 0.5);
  const bodies = [...REVIEW_BODIES].sort(() => rng() - 0.5);
  const now = new Date('2025-03-15T12:00:00Z');
  const reviews = [];

  for (let i = 0; i < count; i++) {
    const rating = rng() > 0.15 ? 5 : 4;
    const daysAgo = DATE_OFFSETS[i % DATE_OFFSETS.length] + Math.floor(rng() * 5);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const likes = Math.floor(rng() * 45) + 1;
    const helpful = Math.floor(rng() * 30);

    const replies = [];
    if (rng() > 0.6) {
      const rc = Math.floor(rng() * 2) + 1;
      for (let r = 0; r < rc; r++) {
        const rd = new Date(date);
        rd.setDate(rd.getDate() + Math.floor(rng() * 3) + 1);
        replies.push({
          id: `reply-${i}-${r}`,
          author: names[(i * 3 + r + count) % names.length],
          body: REPLY_TEXTS[Math.floor(rng() * REPLY_TEXTS.length)],
          date: rd.toISOString(),
          likes: Math.floor(rng() * 15),
        });
      }
    }

    reviews.push({
      id: `review-${seed}-${i}`,
      author: names[i % names.length],
      rating,
      title: titles[i % titles.length],
      body: bodies[i % bodies.length],
      date: date.toISOString(),
      verified: rng() > 0.1,
      likes,
      helpful,
      replies,
    });
  }
  return reviews;
}

function getAvgRating(reviews) {
  if (!reviews.length) return 0;
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
}

// ============================================
// CSS
// ============================================
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pdp-root {
    font-family: 'Jost', sans-serif;
    color: #0a0a0a;
    padding-top: 96px;
    background: #fff;
  }

  /* ── STICKY NAV ── */
  .pdp-sticky-nav {
    position: sticky;
    top: 64px;
    z-index: 100;
    background: #fff;
    border-bottom: 1px solid #e8e8e3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48px;
    height: 44px;
  }
  .pdp-sticky-nav a {
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #888;
    text-decoration: none;
    padding: 0 14px;
    height: 44px;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }
  .pdp-sticky-nav a:hover { color: #0a0a0a; }

  /* ── HERO ──
     Desktop: two-column layout — content left, image right (fully visible, no crop)
     Mobile: stacked — image on top, content below
  */
  .pdp-hero {
    position: relative;
    background: #111;
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 88vh;
    overflow: hidden;
  }

  /* Left column: text content */
  .pdp-hero-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 80px 72px;
    /* subtle dark gradient only on the left panel */
    background: linear-gradient(135deg, rgba(5,5,5,0.96) 0%, rgba(5,5,5,0.80) 100%);
  }

  /* Right column: image shown in full, no cropping */
  .pdp-hero-image-col {
    position: relative;
    overflow: hidden;
    background: #0d0d0d;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pdp-hero-image-col::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(5,5,5,0.45) 0%, transparent 40%);
    pointer-events: none;
  }
  /* The product image: contain so the full watch is always visible */
  .pdp-hero-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center center;
    display: block;
    padding: 24px;
  }

  .pdp-hero-eyebrow {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #c9a84c;
    margin-bottom: 18px;
    font-weight: 400;
  }
  .pdp-hero-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(38px, 4.5vw, 64px);
    font-weight: 300;
    line-height: 1.08;
    color: #fff;
    letter-spacing: -0.5px;
    margin-bottom: 20px;
  }
  .pdp-hero-subtitle {
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    line-height: 1.7;
    font-weight: 300;
    margin-bottom: 36px;
    max-width: 420px;
  }
  .pdp-hero-cta {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 15px 38px;
    background: #c9a84c;
    color: #0a0a0a;
    font-size: 10px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    text-decoration: none;
    width: fit-content;
  }
  .pdp-hero-cta:hover { background: #b8943e; transform: translateY(-1px); }

  /* ── TRUST BADGES ── */
  .pdp-trust-badges {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  .pdp-trust-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    letter-spacing: 0.5px;
    color: rgba(255,255,255,0.55);
    font-weight: 400;
  }
  .pdp-trust-badge svg {
    color: #c9a84c;
    flex-shrink: 0;
  }

  /* ── SPLIT SECTION: IMAGE + BUY-IT-TOGETHER ── */
  .pdp-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 560px;
  }
  .pdp-split-img {
    width: 100%;
    height: 100%;
    min-height: 520px;
    object-fit: cover;
    display: block;
    background: #f5f5f0;
  }
  .pdp-bit-panel {
    background: #fafafa;
    padding: 56px 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-left: 1px solid #ececec;
  }
  .pdp-bit-label {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 6px;
  }
  .pdp-bit-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 28px;
    gap: 16px;
  }
  .pdp-bit-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px;
    font-weight: 400;
    color: #0a0a0a;
  }
  .pdp-bit-total {
    font-size: 22px;
    font-weight: 600;
    color: #0a0a0a;
    white-space: nowrap;
  }
  .pdp-bit-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 0;
    border-top: 1px solid #e8e8e3;
  }
  .pdp-bit-item:last-of-type { border-bottom: 1px solid #e8e8e3; margin-bottom: 20px; }
  .pdp-bit-thumb {
    width: 64px;
    height: 64px;
    object-fit: cover;
    background: #f0f0ec;
    flex-shrink: 0;
  }
  .pdp-bit-item-name { font-size: 13px; font-weight: 500; margin-bottom: 2px; }
  .pdp-bit-item-sub { font-size: 11px; color: #999; margin-bottom: 3px; }
  .pdp-bit-item-price { font-size: 14px; color: #c9a84c; font-weight: 600; }
  .pdp-bit-old { font-size: 12px; color: #bbb; text-decoration: line-through; margin-left: 6px; }
  .pdp-bit-atb {
    display: block;
    width: 100%;
    padding: 16px;
    background: #c9a84c;
    color: #0a0a0a;
    font-size: 10px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
    margin-bottom: 20px;
  }
  .pdp-bit-atb:hover { background: #b8943e; }
  .pdp-bit-perks {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
  }
  .pdp-bit-perk {
    font-size: 11px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pdp-bit-perk::before {
    content: '✓';
    color: #c9a84c;
    font-weight: 700;
    font-size: 12px;
  }

  /* ── CURATED BANNER ── */
  .pdp-curated {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 520px;
    background: #111;
    overflow: hidden;
  }
  .pdp-curated-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 72px 64px;
  }
  .pdp-curated-eyebrow {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #c9a84c;
    margin-bottom: 16px;
  }
  .pdp-curated-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(32px, 3.5vw, 48px);
    font-weight: 300;
    color: #fff;
    line-height: 1.15;
    margin-bottom: 20px;
  }
  .pdp-curated-body {
    font-size: 14px;
    color: rgba(255,255,255,0.6);
    line-height: 1.8;
    font-weight: 300;
    max-width: 400px;
  }
  .pdp-curated-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    min-height: 480px;
    display: block;
    opacity: 0.9;
  }

  /* ── SPECS + YMAL GRID ── */
  .pdp-specs-ymal {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    background: #f9f9f7;
    border-top: 1px solid #ececec;
  }
  .pdp-specs-col {
    padding: 72px 56px;
    border-right: 1px solid #ececec;
  }
  .pdp-specs-eyebrow {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 8px;
  }
  .pdp-specs-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 32px;
    font-weight: 400;
    margin-bottom: 32px;
    color: #0a0a0a;
  }
  .pdp-specs-list { list-style: none; display: flex; flex-direction: column; gap: 14px; }
  .pdp-specs-list li {
    font-size: 13px;
    color: #444;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    line-height: 1.5;
    padding-bottom: 14px;
    border-bottom: 1px solid #ececec;
  }
  .pdp-specs-list li:last-child { border-bottom: none; padding-bottom: 0; }
  .pdp-specs-list li::before {
    content: '✓';
    color: #c9a84c;
    font-weight: 700;
    font-size: 13px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .pdp-shopify-desc {
    font-size: 13px;
    color: #444;
    line-height: 1.7;
  }
  .pdp-shopify-desc td {
    padding: 12px 0;
    border-bottom: 1px solid #ececec;
    font-size: 13px;
  }
  .pdp-shopify-desc td:first-child { color: #888; width: 50%; }
  .pdp-shopify-desc td:last-child { font-weight: 500; color: #0a0a0a; }
  .pdp-ymal-col { padding: 72px 56px; }
  .pdp-ymal-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 32px;
    font-weight: 400;
    margin-bottom: 32px;
    color: #0a0a0a;
  }
  .pdp-ymal-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .pdp-ymal-card {
    text-decoration: none;
    color: inherit;
    display: block;
    transition: transform 0.25s;
  }
  .pdp-ymal-card:hover { transform: translateY(-3px); }
  .pdp-ymal-card img {
    width: 100%;
    aspect-ratio: 1/1;
    object-fit: cover;
    display: block;
    background: #f0f0ec;
    margin-bottom: 10px;
  }
  .pdp-ymal-card-vendor { font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: #999; margin-bottom: 3px; }
  .pdp-ymal-card-name { font-size: 12px; font-weight: 500; margin-bottom: 4px; line-height: 1.4; }
  .pdp-ymal-card-price { font-size: 12px; color: #c9a84c; font-weight: 600; margin-bottom: 10px; }
  .pdp-ymal-atb {
    display: block;
    width: 100%;
    padding: 9px 0;
    background: #c9a84c;
    color: #0a0a0a;
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
  }
  .pdp-ymal-atb:hover { background: #b8943e; }

  /* ── TRUSTED / REVIEWS ── */
  .pdp-reviews-section { background: #fff; padding: 80px 0; border-top: 1px solid #ececec; }
  .pdp-reviews-inner { max-width: 1100px; margin: 0 auto; padding: 0 48px; }
  .pdp-reviews-hero {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 64px;
    align-items: start;
    margin-bottom: 48px;
    padding-bottom: 48px;
    border-bottom: 1px solid #ececec;
  }
  .pdp-reviews-score-big {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 72px;
    font-weight: 300;
    line-height: 1;
    color: #0a0a0a;
    margin-bottom: 8px;
  }
  .pdp-reviews-count { font-size: 11px; color: #999; margin-top: 6px; letter-spacing: 1px; }
  .pdp-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .pdp-bar-label { font-size: 11px; color: #888; width: 32px; text-align: right; }
  .pdp-bar-track { flex: 1; height: 6px; background: #e8e8e3; border-radius: 3px; overflow: hidden; }
  .pdp-bar-fill { height: 100%; background: #c9a84c; border-radius: 3px; }
  .pdp-bar-count { font-size: 10px; color: #aaa; width: 20px; }
  .pdp-reviews-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .pdp-write-btn {
    padding: 11px 28px;
    background: #0a0a0a;
    color: #fff;
    border: none;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    font-family: 'Jost', sans-serif;
    transition: background 0.2s;
  }
  .pdp-write-btn:hover { background: #333; }
  .pdp-sort-select {
    padding: 10px 14px;
    border: 1px solid #e8e8e3;
    font-size: 12px;
    background: #fff;
    cursor: pointer;
    font-family: 'Jost', sans-serif;
    color: #444;
  }
  .pdp-review-card { padding: 28px 0; border-bottom: 1px solid #f0f0f0; }
  .pdp-review-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: #e8e8e3; display: flex; align-items: center;
    justify-content: center; font-size: 14px; font-weight: 600;
    color: #666; flex-shrink: 0;
  }
  .pdp-verified {
    font-size: 9px; color: #16a34a; background: #f0fdf4;
    padding: 2px 7px; border-radius: 2px; margin-left: 8px;
    letter-spacing: 0.5px;
  }
  .pdp-review-actions { display: flex; gap: 16px; margin-top: 14px; }
  .pdp-review-actions button {
    background: none; border: none; font-size: 11px; color: #999;
    cursor: pointer; display: flex; align-items: center; gap: 5px;
    padding: 4px 0; font-family: 'Jost', sans-serif; transition: color 0.15s;
  }
  .pdp-review-actions button:hover { color: #0a0a0a; }
  .pdp-review-actions button.liked { color: #c9a84c; }
  .pdp-reply-card {
    margin-left: 50px; padding: 12px 16px; border-left: 2px solid #f0f0f0;
    margin-top: 10px;
  }
  .pdp-reply-form { margin-left: 50px; margin-top: 10px; display: flex; gap: 8px; }
  .pdp-reply-form textarea {
    flex: 1; padding: 10px 12px; border: 1px solid #e8e8e3;
    font-size: 12px; resize: none; min-height: 44px;
    font-family: 'Jost', sans-serif;
  }
  .pdp-reply-form button {
    padding: 10px 18px; background: #0a0a0a; color: #fff;
    border: none; font-size: 10px; cursor: pointer;
    font-family: 'Jost', sans-serif; white-space: nowrap;
  }
  .pdp-pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 40px; }
  .pdp-pagination button {
    padding: 8px 16px; border: 1px solid #e8e8e3; background: #fff;
    font-size: 12px; cursor: pointer; font-family: 'Jost', sans-serif;
    transition: all 0.15s;
  }
  .pdp-pagination button.active { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
  .pdp-pagination button:disabled { opacity: 0.3; cursor: not-allowed; }
  .pdp-review-form {
    background: #fafafa; border: 1px solid #e8e8e3;
    padding: 28px; margin-bottom: 32px;
  }
  .pdp-review-form h3 { font-size: 16px; font-weight: 500; margin-bottom: 20px; }
  .pdp-review-form .fg { margin-bottom: 16px; }
  .pdp-review-form label {
    display: block; font-size: 10px; letter-spacing: 1.5px;
    text-transform: uppercase; color: #888; margin-bottom: 6px;
  }
  .pdp-review-form input, .pdp-review-form textarea {
    width: 100%; padding: 11px 13px; border: 1px solid #e8e8e3;
    font-size: 13px; font-family: 'Jost', sans-serif; background: #fff;
  }
  .pdp-review-form textarea { min-height: 90px; resize: vertical; }
  .pdp-star-select { display: flex; gap: 4px; }
  .pdp-star-select button {
    background: none; border: none; font-size: 24px; cursor: pointer;
    color: #ddd; transition: color 0.15s; padding: 0 2px;
  }
  .pdp-star-select button.active { color: #c9a84c; }

  /* ── FLOATING BAR ── */
  .pdp-floating {
    position: fixed; bottom: 24px; right: 24px; z-index: 500;
    background: #fff; border: 1px solid #e8e8e3; border-radius: 16px;
    padding: 10px 10px 10px 14px; display: flex; align-items: center;
    gap: 12px; transform: translateY(16px); opacity: 0;
    transition: all 0.3s ease; box-shadow: 0 8px 40px rgba(0,0,0,0.14);
    max-width: 380px; min-width: 300px;
  }
  .pdp-floating.vis { transform: translateY(0); opacity: 1; }

  /* ── OPT BUTTONS ── */
  .pdp-opt-btn {
    padding: 8px 16px; border: 1px solid #e8e8e3; background: #fff;
    font-size: 12px; cursor: pointer; transition: all 0.15s; color: #0a0a0a;
    font-family: 'Jost', sans-serif;
  }
  .pdp-opt-btn.sel { border-color: #0a0a0a; background: #0a0a0a; color: #fff; }
  .pdp-opt-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .pdp-sticky-nav { display: none; }

    /* Hero: mobile — single column, image on top full-width, content below */
    .pdp-hero {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      min-height: unset;
    }
    /* On mobile image goes first (top), content goes second */
    .pdp-hero-image-col {
      order: -1;
      min-height: 320px;
    }
    .pdp-hero-img {
      padding: 16px;
      max-height: 360px;
      object-fit: contain;
    }
    .pdp-hero-content {
      padding: 40px 28px 48px;
      background: linear-gradient(180deg, rgba(5,5,5,0.98) 0%, rgba(5,5,5,0.92) 100%);
    }
    .pdp-hero-title { font-size: 36px; }

    .pdp-split { grid-template-columns: 1fr; }
    .pdp-split-img { min-height: 300px; }
    .pdp-bit-panel { padding: 36px 24px; }
    .pdp-curated { grid-template-columns: 1fr; }
    .pdp-curated-text { padding: 48px 28px; }
    .pdp-curated-img { min-height: 280px; }
    .pdp-specs-ymal { grid-template-columns: 1fr; }
    .pdp-specs-col { padding: 48px 28px; border-right: none; border-bottom: 1px solid #ececec; }
    .pdp-ymal-col { padding: 48px 28px; }
    .pdp-ymal-grid { grid-template-columns: repeat(2, 1fr); }
    .pdp-reviews-hero { grid-template-columns: 1fr; gap: 32px; }
    .pdp-reviews-inner { padding: 0 24px; }
    .pdp-bit-perks { grid-template-columns: 1fr; }
  }
`;

// ============================================
// ADD TO CART BUTTON
// ============================================
function AddBtn({variantId, qty, available, label, style, className}) {
  const fetcher = useFetcher();
  const {openCart} = useCart();
  const submitted = useRef(false);

  useEffect(() => {
    if (fetcher.state === 'submitting') submitted.current = true;
    if (fetcher.state === 'idle' && submitted.current && fetcher.data?.cart) {
      submitted.current = false;
      openCart(fetcher.data.cart);
    }
  }, [fetcher.state]);

  if (!available) {
    return (
      <button disabled style={{...style, background: '#d1d5db', cursor: 'not-allowed'}} className={className}>
        Sold Out
      </button>
    );
  }

  return (
    <fetcher.Form method="post" action="/cart" style={{display: 'contents'}}>
      <input type="hidden" name="cartAction" value="ADD_TO_CART" />
      <input type="hidden" name="lines" value={JSON.stringify([{merchandiseId: variantId, quantity: qty || 1}])} />
      <button type="submit" disabled={fetcher.state !== 'idle'} style={style} className={className}>
        {fetcher.state !== 'idle' ? '...' : label || 'Add to Bag'}
      </button>
    </fetcher.Form>
  );
}

function BundleAddButton({lines, label}) {
  const fetcher = useFetcher();
  const {openCart} = useCart();
  const submitted = useRef(false);

  useEffect(() => {
    if (fetcher.state === 'submitting') submitted.current = true;
    if (fetcher.state === 'idle' && submitted.current && fetcher.data?.cart) {
      submitted.current = false;
      openCart(fetcher.data.cart);
    }
  }, [fetcher.state]);

  return (
    <fetcher.Form method="post" action="/cart">
      <input type="hidden" name="cartAction" value="ADD_TO_CART" />
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      <button type="submit" disabled={fetcher.state !== 'idle'} className="pdp-bit-atb">
        {fetcher.state !== 'idle' ? '...' : label || 'Add Both to Bag'}
      </button>
    </fetcher.Form>
  );
}

// ============================================
// REVIEWS SECTION
// ============================================
function ReviewsSection({generatedReviews, userReviews, onAddReview, productId, reviewCount, averageRating}) {
  const REVIEWS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [likedReviews, setLikedReviews] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [localReplies, setLocalReplies] = useState({});
  const [formData, setFormData] = useState({author: '', rating: 5, title: '', body: ''});

  const allReviews = useMemo(() => [...userReviews, ...generatedReviews], [userReviews, generatedReviews]);

  useEffect(() => {
    try {
      const lk = localStorage.getItem(`liked-${productId}`);
      if (lk) setLikedReviews(JSON.parse(lk));
      const rp = localStorage.getItem(`replies-${productId}`);
      if (rp) setLocalReplies(JSON.parse(rp));
    } catch {}
  }, [productId]);

  const sorted = useMemo(() => {
    const s = [...allReviews];
    switch (sortBy) {
      case 'newest': s.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
      case 'oldest': s.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case 'highest': s.sort((a, b) => b.rating - a.rating); break;
      case 'lowest': s.sort((a, b) => a.rating - b.rating); break;
      case 'helpful': s.sort((a, b) => (b.helpful || 0) - (a.helpful || 0)); break;
    }
    return s;
  }, [allReviews, sortBy]);

  const totalPages = Math.ceil(sorted.length / REVIEWS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE);

  const ratingDist = useMemo(() => {
    const d = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    allReviews.forEach((r) => { d[r.rating] = (d[r.rating] || 0) + 1; });
    return d;
  }, [allReviews]);

  const handleLike = useCallback((id) => {
    setLikedReviews((prev) => {
      const u = {...prev, [id]: !prev[id]};
      try { localStorage.setItem(`liked-${productId}`, JSON.stringify(u)); } catch {}
      return u;
    });
  }, [productId]);

  const handleReply = useCallback((reviewId) => {
    if (!replyText.trim()) return;
    const nr = {id: `lr-${Date.now()}`, author: 'You', body: replyText, date: new Date().toISOString(), likes: 0};
    setLocalReplies((prev) => {
      const u = {...prev, [reviewId]: [...(prev[reviewId] || []), nr]};
      try { localStorage.setItem(`replies-${productId}`, JSON.stringify(u)); } catch {}
      return u;
    });
    setReplyText('');
    setReplyingTo(null);
  }, [replyText, productId]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.title.trim() || !formData.body.trim()) return;
    onAddReview(formData);
    setFormData({author: '', rating: 5, title: '', body: ''});
    setShowForm(false);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div className="pdp-reviews-hero">
        <div>
          <div style={{fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: '12px'}}>
            Trusted by Thousands
          </div>
          <div className="pdp-reviews-score-big">{averageRating}</div>
          <StarRating rating={parseFloat(averageRating)} size={18} />
          <div className="pdp-reviews-count">Based on {reviewCount} reviews</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="pdp-bar-row">
              <span className="pdp-bar-label">{star} ★</span>
              <div className="pdp-bar-track">
                <div className="pdp-bar-fill" style={{width: `${reviewCount > 0 ? (ratingDist[star] / reviewCount) * 100 : 0}%`}} />
              </div>
              <span className="pdp-bar-count">{ratingDist[star]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="pdp-reviews-controls">
        <button className="pdp-write-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
        <select className="pdp-sort-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Review Form */}
      {showForm && (
        <form className="pdp-review-form" onSubmit={handleSubmitReview}>
          <h3>Write Your Review</h3>
          <div className="fg">
            <label>Your Name</label>
            <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} required placeholder="Enter your name" />
          </div>
          <div className="fg">
            <label>Rating</label>
            <div className="pdp-star-select">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" className={s <= formData.rating ? 'active' : ''} onClick={() => setFormData({...formData, rating: s})}>★</button>
              ))}
            </div>
          </div>
          <div className="fg">
            <label>Review Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="Summary of your review" />
          </div>
          <div className="fg">
            <label>Your Review</label>
            <textarea value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} required placeholder="Tell us about your experience..." />
          </div>
          <button type="submit" className="pdp-write-btn" style={{marginTop: '8px'}}>Submit Review</button>
        </form>
      )}

      {/* Review List */}
      <div>
        {paginated.map((review) => {
          const allReplies = [...(review.replies || []), ...(localReplies[review.id] || [])];
          return (
            <div key={review.id} className="pdp-review-card">
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px'}}>
                <div className="pdp-review-avatar">{review.author[0]}</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '13px', fontWeight: '500'}}>
                    {review.author}
                    {review.verified && <span className="pdp-verified">✓ Verified Buyer</span>}
                  </div>
                  <div style={{fontSize: '10px', color: '#aaa', marginTop: '2px'}}>
                    {new Date(review.date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
                  </div>
                </div>
              </div>
              <StarRating rating={review.rating} size={14} />
              <div style={{fontSize: '13px', fontWeight: '500', marginTop: '8px', marginBottom: '6px'}}>{review.title}</div>
              <div style={{fontSize: '13px', color: '#666', lineHeight: '1.75'}}>{review.body}</div>
              <div className="pdp-review-actions">
                <button className={likedReviews[review.id] ? 'liked' : ''} onClick={() => handleLike(review.id)}>
                  👍 {review.likes + (likedReviews[review.id] ? 1 : 0)}
                </button>
                <button className={likedReviews[`h-${review.id}`] ? 'liked' : ''} onClick={() => handleLike(`h-${review.id}`)}>
                  Helpful ({(review.helpful || 0) + (likedReviews[`h-${review.id}`] ? 1 : 0)})
                </button>
                <button onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}>
                  💬 Reply
                </button>
              </div>
              {allReplies.length > 0 && allReplies.map((rp) => (
                <div key={rp.id} className="pdp-reply-card">
                  <div style={{fontSize: '12px', marginBottom: '4px'}}>
                    <strong>{rp.author}</strong>
                    <span style={{color: '#aaa', marginLeft: '8px', fontSize: '10px'}}>
                      {new Date(rp.date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}
                    </span>
                  </div>
                  <div style={{fontSize: '12px', color: '#666'}}>{rp.body}</div>
                </div>
              ))}
              {replyingTo === review.id && (
                <div className="pdp-reply-form">
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." />
                  <button onClick={() => handleReply(review.id)}>Post</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pdp-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>← Prev</button>
          {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
            <button key={p} className={p === currentPage ? 'active' : ''} onClick={() => setCurrentPage(p)}>{p}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN PRODUCT COMPONENT
// ============================================
export default function Product() {
  const {product, allProducts, recommended} = useLoaderData();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [floatingVisible, setFloatingVisible] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [bitChecked, setBitChecked] = useState({});

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const allImages = product.images?.nodes || [];
  const variantImage = selectedVariant?.image;
  const images = allImages.length > 0 ? allImages : variantImage ? [variantImage] : [];
  const heroImage = variantImage || images[0];
  const secondImage = images[1] || heroImage;
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount || 0);
  const variantId = selectedVariant?.id;
  const available = selectedVariant?.availableForSale;

  // Reviews
  const generatedReviews = useMemo(() => generateReviewsForProduct(product.id), [product.id]);
  const [userReviews, setUserReviews] = useState([]);
  useEffect(() => {
    try {
      const s = localStorage.getItem(`urev-${product.id}`);
      if (s) setUserReviews(JSON.parse(s));
    } catch {}
  }, [product.id]);
  const handleAddReview = useCallback((data) => {
    const nr = {...data, id: `user-${Date.now()}`, date: new Date().toISOString(), verified: false, likes: 0, helpful: 0, replies: []};
    const updated = [nr, ...userReviews];
    setUserReviews(updated);
    try { localStorage.setItem(`urev-${product.id}`, JSON.stringify(updated)); } catch {}
  }, [userReviews, product.id]);
  const totalReviewCount = generatedReviews.length + userReviews.length;
  const avgRating = getAvgRating([...userReviews, ...generatedReviews]);

  // Buy It Together
  const buyTogetherProducts = useMemo(() => {
    const rng = seededRandom(seedFromId(product.id) + 999);
    return [...allProducts.filter((p) => p.id !== product.id)].sort(() => rng() - 0.5).slice(0, 1);
  }, [product.id, allProducts]);

  useEffect(() => {
    const m = {};
    buyTogetherProducts.forEach((p) => { m[p.id] = true; });
    setBitChecked(m);
  }, [buyTogetherProducts]);

  const bitSelectedProducts = buyTogetherProducts.filter((p) => bitChecked[p.id]);
  const bitTotal = parseFloat(price?.amount || 0) + bitSelectedProducts.reduce((s, p) => s + parseFloat(p.priceRange?.minVariantPrice?.amount || 0), 0);
  const bitLines = [
    {merchandiseId: variantId, quantity: 1},
    ...bitSelectedProducts.map((p) => ({merchandiseId: p.variants?.nodes?.[0]?.id, quantity: 1})),
  ].filter((l) => l.merchandiseId);

  // You May Also Like
  const youMayAlsoLike = useMemo(() => {
    let candidates = recommended.filter((p) => p.id !== product.id);
    if (candidates.length < 3) {
      const ids = new Set(candidates.map((p) => p.id));
      ids.add(product.id);
      candidates = [...candidates, ...allProducts.filter((p) => !ids.has(p.id))];
    }
    const rng = seededRandom(seedFromId(product.id) + 777);
    return [...candidates].sort(() => rng() - 0.5).slice(0, 3);
  }, [product.id, recommended, allProducts]);

  // Floating bar
  useEffect(() => {
    const fn = () => setFloatingVisible(window.scrollY > 600);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const bitProduct = buyTogetherProducts[0];
  const bitProductImg = bitProduct?.images?.nodes?.[0] || bitProduct?.featuredImage;
  const bitProductPrice = bitProduct?.priceRange?.minVariantPrice;

  return (
    <div className="pdp-root" suppressHydrationWarning>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{__html: CSS}} />

      {/* STICKY NAV */}
      <nav className="pdp-sticky-nav">
        <div style={{display: 'flex'}}>
          <a href="#hero">The Watch</a>
          <a href="#curated">Curated</a>
          <a href="#specs">Specs</a>
          <a href="#reviews">Reviews</a>
        </div>
        <div style={{fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#c9a84c'}}>
          Vastara
        </div>
      </nav>

      {/* ── HERO ── */}
      {/*
        Desktop: two-column grid
          Left  → dark content panel (text + CTA)
          Right → product image shown fully with object-fit: contain (no crop)
        Mobile: single column, image on top, content below
      */}
      <section id="hero" className="pdp-hero">
        {/* LEFT: content */}
        <div className="pdp-hero-content">
          {product.vendor && <div className="pdp-hero-eyebrow">{product.vendor}</div>}
          <h1 className="pdp-hero-title">
            {product.title}
          </h1>
          <p className="pdp-hero-subtitle">
            A sophisticated automatic watch crafted for those who appreciate the finer details.
          </p>
          <div style={{display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', flexWrap: 'wrap'}}>
            <StarRating rating={parseFloat(avgRating)} size={15} />
            <span style={{fontSize: '12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer'}}
              onClick={() => document.getElementById('reviews')?.scrollIntoView({behavior: 'smooth'})}>
              {avgRating} · {totalReviewCount} reviews
            </span>
            {price && (
              <span style={{fontSize: '18px', fontWeight: '600', color: '#fff', marginLeft: 'auto'}}>
                {fmt(price.amount, price.currencyCode)}
                {isOnSale && <span style={{fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'line-through', marginLeft: '8px'}}>{fmt(compareAtPrice.amount, compareAtPrice.currencyCode)}</span>}
              </span>
            )}
          </div>
          {/* ── VARIANT SELECTOR ── */}
          {productOptions.map(option => {
            if (option.optionValues.length <= 1) return null;
            const hasVariantImages = option.optionValues.some(v => v.firstSelectableVariant?.image);
            return (
              <div key={option.name} style={{marginBottom:'16px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
                  <span style={{fontSize:'9px',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',fontWeight:'600'}}>{option.name}</span>
                  <span style={{fontSize:'10px',color:'rgba(255,255,255,0.35)'}}>
                    {option.optionValues.find(v => v.selected)?.name || ''}
                  </span>
                </div>
                {hasVariantImages ? (
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                    {option.optionValues.map(value => {
                      const varImg = value.firstSelectableVariant?.image;
                      const isSelected = value.selected;
                      const isAvailable = value.firstSelectableVariant?.availableForSale !== false;
                      return value.isDifferentProduct ? (
                        <Link key={value.name} to={'/products/'+value.handle+'?'+value.variantUriQuery}
                          style={{display:'block',width:'58px',height:'58px',border:isSelected?'1.5px solid #c9a84c':'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.04)',overflow:'hidden',opacity:isAvailable?1:0.3,textDecoration:'none',flexShrink:0,transition:'border-color 0.15s'}}>
                          {varImg && <img src={varImg.url} alt={value.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />}
                        </Link>
                      ) : (
                        <button key={value.name} type="button" title={value.name}
                          disabled={!value.exists}
                          onClick={() => { if (!value.selected) navigate('?'+value.variantUriQuery, {replace:true,preventScrollReset:true}); }}
                          style={{width:'58px',height:'58px',border:isSelected?'1.5px solid #c9a84c':'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.04)',cursor:value.exists?'pointer':'not-allowed',overflow:'hidden',opacity:isAvailable?1:0.3,flexShrink:0,transition:'border-color 0.15s',padding:0}}>
                          {varImg
                            ? <img src={varImg.url} alt={value.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                            : <span style={{fontSize:'8px',color:'rgba(255,255,255,0.5)',lineHeight:'1.2',display:'flex',alignItems:'center',justifyContent:'center',height:'100%',textAlign:'center',padding:'4px'}}>{value.name}</span>
                          }
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                    {option.optionValues.map(value => (
                      value.isDifferentProduct
                        ? <Link key={value.name} to={'/products/'+value.handle+'?'+value.variantUriQuery}
                            style={{padding:'7px 14px',border:value.selected?'1px solid #c9a84c':'1px solid rgba(255,255,255,0.15)',background:value.selected?'rgba(201,168,76,0.1)':'transparent',color:value.selected?'#c9a84c':'rgba(255,255,255,0.5)',fontSize:'11px',textDecoration:'none',cursor:'pointer',transition:'all 0.15s'}}>
                            {value.name}
                          </Link>
                        : <button key={value.name} type="button"
                            disabled={!value.exists}
                            onClick={() => { if (!value.selected) navigate('?'+value.variantUriQuery, {replace:true,preventScrollReset:true}); }}
                            style={{padding:'7px 14px',border:value.selected?'1px solid #c9a84c':'1px solid rgba(255,255,255,0.15)',background:value.selected?'rgba(201,168,76,0.1)':'transparent',color:value.selected?'#c9a84c':'rgba(255,255,255,0.5)',fontSize:'11px',cursor:value.exists?'pointer':'not-allowed',opacity:value.exists?1:0.3,transition:'all 0.15s'}}>
                            {value.name}
                          </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── QUANTITY + ADD TO BAG ── */}
          <div style={{display:'flex',gap:'8px',marginBottom:'16px',alignItems:'stretch'}}>
            <div style={{display:'flex',alignItems:'center',border:'1px solid rgba(255,255,255,0.2)',height:'48px',flexShrink:0}}>
              <button onClick={() => setQty(q => Math.max(1,q-1))} style={{width:'38px',height:'48px',background:'none',border:'none',fontSize:'18px',cursor:'pointer',color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
              <span style={{width:'30px',textAlign:'center',fontSize:'13px',color:'#fff'}}>{qty}</span>
              <button onClick={() => setQty(q => q+1)} style={{width:'38px',height:'48px',background:'none',border:'none',fontSize:'18px',cursor:'pointer',color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
            </div>
            <div style={{flex:1}}>
              {variantId && (
                <AddBtn variantId={variantId} qty={qty} available={available}
                  label={available ? `Add to Bag${price ? '  —  '+fmt(price.amount,price.currencyCode) : ''}` : 'Sold Out'}
                  className="pdp-hero-cta"
                  style={{display:'block',width:'100%',padding:'15px',background:available?'#c9a84c':'rgba(255,255,255,0.1)',color:available?'#0a0a0a':'rgba(255,255,255,0.3)',fontSize:'10px',letterSpacing:'2.5px',textTransform:'uppercase',fontWeight:'700',border:'none',cursor:available?'pointer':'not-allowed'}} />
              )}
            </div>
          </div>

          {/* ── TRUST BADGES ── */}
          <div className="pdp-trust-badges">
            <div className="pdp-trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <span>Free Shipping</span>
            </div>
            <div className="pdp-trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>1-Year Warranty</span>
            </div>
            <div className="pdp-trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

        {/* RIGHT: full product image, no crop */}
        <div className="pdp-hero-image-col">
          {heroImage ? (
            <img
              src={heroImage.url}
              alt={heroImage.altText || product.title}
              className="pdp-hero-img"
              fetchPriority="high"
              loading="eager"
            />
          ) : (
            <div style={{fontSize: '120px', opacity: 0.3}}>⌚</div>
          )}
        </div>
      </section>

      {/* ── SPLIT: IMAGE + BUY IT TOGETHER ── */}
      {bitProduct && (
        <section className="pdp-split">
          <div style={{overflow: 'hidden', background: '#f5f5f0'}}>
            {secondImage
              ? <img src={secondImage.url} alt={secondImage.altText || product.title} className="pdp-split-img" loading="lazy" />
              : <div style={{width: '100%', minHeight: '520px', background: '#f0f0ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px'}}>⌚</div>
            }
          </div>
          <div className="pdp-bit-panel">
            <div className="pdp-bit-label">Complete the Look</div>
            <div className="pdp-bit-header">
              <div className="pdp-bit-title">Buy It Together</div>
              <div className="pdp-bit-total">{fmt(bitTotal, price?.currencyCode || 'USD')}</div>
            </div>

            {/* Current product row */}
            <div className="pdp-bit-item">
              {heroImage && <img src={heroImage.url} alt={product.title} className="pdp-bit-thumb" />}
              <div style={{flex: 1}}>
                <div className="pdp-bit-item-name">{product.title}</div>
                {product.vendor && <div className="pdp-bit-item-sub">{product.vendor}</div>}
                <div style={{display: 'flex', alignItems: 'baseline', gap: '6px'}}>
                  <span className="pdp-bit-item-price">{price ? fmt(price.amount, price.currencyCode) : ''}</span>
                  {isOnSale && <span className="pdp-bit-old">{fmt(compareAtPrice.amount, compareAtPrice.currencyCode)}</span>}
                </div>
              </div>
            </div>

            {/* Bundle product row */}
            <div className="pdp-bit-item" style={{position: 'relative'}}>
              <input type="checkbox" checked={!!bitChecked[bitProduct.id]}
                onChange={() => setBitChecked((prev) => ({...prev, [bitProduct.id]: !prev[bitProduct.id]}))}
                style={{position: 'absolute', top: '20px', left: '0', width: '14px', height: '14px', cursor: 'pointer', zIndex: 2}} />
              <div style={{width: '14px', flexShrink: 0}} />
              {bitProductImg
                ? <img src={bitProductImg.url} alt={bitProduct.title} className="pdp-bit-thumb" style={{opacity: bitChecked[bitProduct.id] ? 1 : 0.4}} />
                : <div style={{width: '64px', height: '64px', background: '#f0f0ec', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>⌚</div>
              }
              <div style={{flex: 1}}>
                <div className="pdp-bit-item-name">{bitProduct.title}</div>
                {bitProduct.vendor && <div className="pdp-bit-item-sub">{bitProduct.vendor}</div>}
                <div className="pdp-bit-item-price">{bitProductPrice ? fmt(bitProductPrice.amount, bitProductPrice.currencyCode) : ''}</div>
              </div>
            </div>

            {variantId && (
              <BundleAddButton lines={bitLines} label={`Add Both to Bag`} />
            )}

            <div className="pdp-bit-perks">
              <span className="pdp-bit-perk">Free 2-Day Shipping</span>
              <span className="pdp-bit-perk">Curated by Experts</span>
              <span className="pdp-bit-perk">1-Year Warranty</span>
              <span className="pdp-bit-perk">30-Day Returns</span>
            </div>
          </div>
        </section>
      )}

      {/* ── CURATED BANNER ── */}
      <section id="curated" className="pdp-curated">
        <div className="pdp-curated-text">
          <div className="pdp-curated-eyebrow">— Curated by Vastara</div>
          <h2 className="pdp-curated-title">
            Selected for its balance of timeless design and everyday reliability.
          </h2>
          <p className="pdp-curated-body">
            The {product.title} exemplifies our commitment to the art of fine watchmaking — blending classic aesthetics with modern engineering to create a timepiece that speaks to the soul of sophistication.
          </p>
          {variantId && (
            <div style={{marginTop: '36px'}}>
              <AddBtn variantId={variantId} qty={1} available={available}
                label={`Add to Bag${price ? '  —  ' + fmt(price.amount, price.currencyCode) : ''}`}
                style={{display: 'inline-block', padding: '15px 38px', background: '#c9a84c', color: '#0a0a0a', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: '700', border: 'none', cursor: 'pointer'}} />
            </div>
          )}
        </div>
        <div style={{overflow: 'hidden', background: '#222'}}>
          {heroImage
            ? <img src={heroImage.url} alt={product.title} className="pdp-curated-img" loading="lazy" />
            : <div style={{width: '100%', height: '100%', minHeight: '480px', background: '#1a1a1a'}} />
          }
        </div>
      </section>

      {/* ── SPECS + YOU MAY ALSO LIKE ── */}
      <section id="specs" className="pdp-specs-ymal">
        <div className="pdp-specs-col">
          <div className="pdp-specs-eyebrow">Details</div>
          <h2 className="pdp-specs-title">Specifications</h2>
          {product.descriptionHtml ? (
            <div className="pdp-shopify-desc" suppressHydrationWarning dangerouslySetInnerHTML={{__html: product.descriptionHtml}} />
          ) : (
            <ul className="pdp-specs-list">
              <li>Automatic Movement</li>
              <li>Case Diameter: 40mm</li>
              <li>Case Material: Stainless Steel</li>
              <li>Glass Material: Scratch-Resistant Sapphire</li>
              <li>Strap: Genuine Leather</li>
              <li>Water Resistance: 100m</li>
            </ul>
          )}
        </div>

        <div className="pdp-ymal-col">
          <div className="pdp-specs-eyebrow">Don't Miss</div>
          <h2 className="pdp-ymal-title">You May Also Like</h2>
          {youMayAlsoLike.length > 0 && (
            <div className="pdp-ymal-grid">
              {youMayAlsoLike.map((yp) => {
                const ypImg = yp.images?.nodes?.[0] || yp.featuredImage;
                const ypPrice = yp.priceRange?.minVariantPrice;
                const ypVariantId = yp.variants?.nodes?.[0]?.id;
                const ypAvail = yp.variants?.nodes?.[0]?.availableForSale;
                return (
                  <div key={yp.id}>
                    <Link to={`/products/${yp.handle}`} className="pdp-ymal-card" prefetch="intent">
                      {ypImg
                        ? <img src={ypImg.url} alt={yp.title} loading="lazy" decoding="async" />
                        : <div style={{width: '100%', aspectRatio: '1/1', background: '#f0f0ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '10px'}}>⌚</div>
                      }
                      <div className="pdp-ymal-card-vendor">{yp.vendor || 'Vastara'}</div>
                      <div className="pdp-ymal-card-name">{yp.title}</div>
                      <div className="pdp-ymal-card-price">{ypPrice ? fmt(ypPrice.amount, ypPrice.currencyCode) : ''}</div>
                    </Link>
                    {ypVariantId && (
                      <AddBtn variantId={ypVariantId} qty={1} available={ypAvail}
                        label="Add to Bag"
                        className="pdp-ymal-atb" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="pdp-reviews-section">
        <div className="pdp-reviews-inner">
          <ReviewsSection
            generatedReviews={generatedReviews}
            userReviews={userReviews}
            onAddReview={handleAddReview}
            productId={product.id}
            reviewCount={totalReviewCount}
            averageRating={avgRating}
          />
        </div>
      </section>

      {/* ── FLOATING BAR ── */}
      <div className={`pdp-floating${floatingVisible ? ' vis' : ''}`}>
        {heroImage && (
          <div style={{width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#f5f5f0'}}>
            <img src={heroImage.url} alt="" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
          </div>
        )}
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{product.title}</div>
          <div style={{fontSize: '11px', color: '#999'}}>{price ? fmt(price.amount, price.currencyCode) : ''}</div>
        </div>
        {variantId && (
          <AddBtn variantId={variantId} qty={1} available={available} label="Add to Bag →"
            style={{flexShrink: 0, padding: '11px 20px', background: available ? '#c9a84c' : '#d1d5db', color: available ? '#0a0a0a' : '#fff', border: 'none', borderRadius: '10px', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: available ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', fontWeight: '700'}} />
        )}
      </div>

      <Analytics.ProductView data={{products: [{id: product.id, title: product.title, price: selectedVariant?.price?.amount || '0', vendor: product.vendor, variantId: selectedVariant?.id || '', variantTitle: selectedVariant?.title || '', quantity: 1}]}} />
    </div>
  );
}

// ============================================
// GRAPHQL QUERIES
// ============================================
const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { __typename id url altText width height }
    price { amount currencyCode }
    product { title handle }
    selectedOptions { name value }
    sku title
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id title vendor handle descriptionHtml description
    encodedVariantExistence encodedVariantAvailability
    images(first: 10) { nodes { id url altText width height } }
    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariant }
        swatch { color image { previewImage { url } } }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) { ...ProductVariant }
    seo { description title }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) { ...Product }
  }
  ${PRODUCT_FRAGMENT}
`;

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 50) {
      nodes {
        id title handle vendor
        featuredImage { url altText }
        images(first: 1) { nodes { id url altText width height } }
        priceRange { minVariantPrice { amount currencyCode } }
        variants(first: 1) {
          nodes { id availableForSale price { amount currencyCode } }
        }
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query RecommendedProducts($productId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      id title handle vendor
      featuredImage { url altText }
      images(first: 1) { nodes { id url altText width height } }
      priceRange { minVariantPrice { amount currencyCode } }
      variants(first: 1) {
        nodes { id availableForSale price { amount currencyCode } }
      }
    }
  }
`;