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

export const meta = ({data}) => [
  {title: `${data?.product?.title ?? ''} | Vastara`},
  {rel: 'canonical', href: `/products/${data?.product?.handle}`},
];

export async function loader(args) {
  const {params, request, context} = args;
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw new Error('Expected product handle to be defined');

  const [{product}, allProductsData, recommendedData] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    storefront.query(ALL_PRODUCTS_QUERY),
    null,
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
    <span style={{display:'inline-flex',gap:'1px'}}>
      {[1,2,3,4,5].map(i => {
        const filled = i <= Math.floor(rating);
        const half = !filled && i - rating < 1 && i - rating > 0;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24"
            fill={filled ? '#c9a84c' : half ? 'url(#halfGrad)' : 'none'} stroke="#c9a84c" strokeWidth="1.5">
            {half && (
              <defs>
                <linearGradient id="halfGrad">
                  <stop offset="50%" stopColor="#c9a84c"/>
                  <stop offset="50%" stopColor="transparent"/>
                </linearGradient>
              </defs>
            )}
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        );
      })}
    </span>
  );
}

// ============================================
// SEEDED RANDOM FOR DETERMINISTIC GENERATION
// ============================================
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

// ============================================
// REVIEW GENERATION SYSTEM
// ============================================
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
  'Totally agree with your review! I had the same experience.',
  'Great to hear! I\'m considering getting one too.',
  'I\'ve had mine for 6 months and can confirm everything you said.',
  'Thanks for the detailed review, very helpful!',
  'Same here, absolutely love this timepiece.',
  'Couldn\'t agree more. Best purchase I\'ve made this year.',
  'Your review convinced me to buy one. No regrets!',
  'Spot on review. The quality is really impressive.',
  'I got one after reading reviews like yours. So happy with it!',
  'Well said! This watch is truly something special.',
];

const DATE_OFFSETS = [2,5,8,12,15,19,23,28,34,40,47,55,63,72,82,93,105,118,132,147,163,180,198,217,237];

function generateReviewsForProduct(productId) {
  const seed = seedFromId(productId);
  const rng = seededRandom(seed);
  const count = Math.floor(rng() * 13) + 13; // 13–25

  const names = [...REVIEWER_NAMES].sort(() => rng() - 0.5);
  const titles = [...REVIEW_TITLES].sort(() => rng() - 0.5);
  const bodies = [...REVIEW_BODIES].sort(() => rng() - 0.5);
  // Use fixed reference date to avoid hydration mismatch (server vs client time diff)
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
  .pdp-sticky-nav{position:sticky;top:64px;z-index:100;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:44px;}
  .pdp-sticky-nav a{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#666;text-decoration:none;padding:0 14px;height:44px;display:flex;align-items:center;}
  .pdp-hero-right{position:sticky;top:24px;width:400px;height:calc(100vh - 48px);overflow-y:auto;padding:36px 32px;background:#fff;display:flex;flex-direction:column;z-index:10;border:1px solid #f0f0f0;border-radius:12px;margin:24px 24px 24px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);}
  .pdp-hero-right::-webkit-scrollbar{width:3px;}
  .pdp-hero-right::-webkit-scrollbar-thumb{background:#e0e0e0;}
  .pdp-specs{max-width:1100px;margin:0 auto;padding:80px 40px;display:grid;grid-template-columns:280px 1fr;gap:80px;}
  .pdp-spec-title{font-family:Georgia,serif;font-size:clamp(28px,3vw,42px);font-weight:400;position:sticky;top:120px;}
  .pdp-reviews{background:#fafafa;padding:64px 24px;}
  .pdp-reviews-inner{max-width:1100px;margin:0 auto;}
  .pdp-review-card{padding:24px 0;border-bottom:1px solid #f0f0f0;}
  .pdp-opt-btn{padding:8px 14px;border:1px solid #e5e7eb;background:#fff;font-size:12px;cursor:pointer;transition:all 0.15s;color:#0a0a0a;}
  .pdp-opt-btn.sel{border-color:#0a0a0a;background:#0a0a0a;color:#fff;}
  .pdp-opt-btn:disabled{opacity:0.3;cursor:not-allowed;}
  .pdp-floating{position:fixed;bottom:24px;right:24px;z-index:500;background:#fff;border:1px solid #e8e8e8;border-radius:20px;padding:8px 8px 8px 12px;display:flex;align-items:center;gap:12px;transform:translateY(16px);opacity:0;transition:all 0.3s ease;box-shadow:0 8px 40px rgba(0,0,0,0.18);max-width:400px;min-width:320px;}
  .pdp-floating.vis{transform:translateY(0);opacity:1;}
  .pdp-shopify-desc{font-size:13px;color:#444;line-height:1.7;}
  .pdp-shopify-desc td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;}
  .pdp-shopify-desc td:first-child{color:#666;width:50%;}
  .pdp-shopify-desc td:last-child{font-weight:500;color:#0a0a0a;}
  .pdp-bit-section{background:#fafafa;padding:64px 40px;}
  .pdp-bit-inner{max-width:1000px;margin:0 auto;}
  .pdp-ymal-section{max-width:1200px;margin:0 auto;padding:64px 24px;}
  .pdp-ymal-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
  .pdp-ymal-card{text-decoration:none;color:inherit;transition:transform 0.3s;}
  .pdp-ymal-card:hover{transform:translateY(-4px);}
  .pdp-ymal-card img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;background:#f5f5f0;}
  .pdp-reviews-header{display:grid;grid-template-columns:260px 1fr;gap:60px;margin-bottom:32px;}
  .pdp-rating-bars{width:100%;}
  .pdp-bar-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
  .pdp-bar-label{font-size:12px;color:#666;width:32px;text-align:right;}
  .pdp-bar-track{flex:1;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;}
  .pdp-bar-fill{height:100%;background:#c9a84c;border-radius:4px;transition:width 0.3s;}
  .pdp-bar-count{font-size:11px;color:#999;width:24px;}
  .pdp-reviews-controls{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;}
  .pdp-write-btn{padding:10px 24px;background:#0a0a0a;color:#fff;border:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;}
  .pdp-write-btn:hover{background:#333;}
  .pdp-sort-select{padding:8px 12px;border:1px solid #e5e7eb;font-size:12px;background:#fff;cursor:pointer;}
  .pdp-review-avatar{width:36px;height:36px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#666;flex-shrink:0;}
  .pdp-review-actions{display:flex;gap:16px;margin-top:12px;}
  .pdp-review-actions button{background:none;border:none;font-size:12px;color:#888;cursor:pointer;display:flex;align-items:center;gap:4px;padding:4px 0;}
  .pdp-review-actions button:hover{color:#0a0a0a;}
  .pdp-review-actions button.liked{color:#c9a84c;}
  .pdp-reply-card{margin-left:48px;padding:12px 0;border-left:2px solid #f0f0f0;padding-left:16px;margin-top:8px;}
  .pdp-reply-form{margin-left:48px;margin-top:8px;display:flex;gap:8px;}
  .pdp-reply-form textarea{flex:1;padding:8px 12px;border:1px solid #e5e7eb;font-size:12px;resize:none;min-height:40px;font-family:inherit;}
  .pdp-reply-form button{padding:8px 16px;background:#0a0a0a;color:#fff;border:none;font-size:11px;cursor:pointer;white-space:nowrap;}
  .pdp-pagination{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:32px;}
  .pdp-pagination button{padding:8px 14px;border:1px solid #e5e7eb;background:#fff;font-size:12px;cursor:pointer;}
  .pdp-pagination button.active{background:#0a0a0a;color:#fff;border-color:#0a0a0a;}
  .pdp-pagination button:disabled{opacity:0.3;cursor:not-allowed;}
  .pdp-review-form{background:#fff;border:1px solid #e5e7eb;padding:24px;margin-bottom:24px;}
  .pdp-review-form h3{font-size:16px;font-weight:500;margin-bottom:16px;}
  .pdp-review-form .fg{margin-bottom:14px;}
  .pdp-review-form label{display:block;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#666;margin-bottom:6px;}
  .pdp-review-form input,.pdp-review-form textarea{width:100%;padding:10px 12px;border:1px solid #e5e7eb;font-size:13px;font-family:inherit;box-sizing:border-box;}
  .pdp-review-form textarea{min-height:80px;resize:vertical;}
  .pdp-star-select{display:flex;gap:4px;}
  .pdp-star-select button{background:none;border:none;font-size:22px;cursor:pointer;color:#ddd;transition:color 0.15s;padding:0 2px;}
  .pdp-star-select button.active{color:#c9a84c;}
  .pdp-verified{font-size:10px;color:#16a34a;background:#f0fdf4;padding:2px 7px;border-radius:2px;margin-left:8px;}
  @media(max-width:900px){
    .pdp-sticky-nav{display:none;}
    #the-watch{grid-template-columns:1fr !important;}
    .pdp-hero-right{position:relative;top:0;width:100%;height:auto;margin:0;border-radius:0;border:none;box-shadow:none;}
    .pdp-specs{grid-template-columns:1fr;gap:32px;padding:48px 24px;}
    .pdp-reviews-header{grid-template-columns:1fr;}
    .pdp-ymal-grid{grid-template-columns:repeat(2,1fr);}
    .pdp-bit-section{padding:40px 16px;}
  }
`;

// ============================================
// ADD TO CART BUTTON
// ============================================
function AddBtn({variantId, qty, available, label, style}) {
  const fetcher = useFetcher();
  const {openCart} = useCart();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__fetcherDebug = {state: fetcher.state, data: fetcher.data};
    }
    if (fetcher.state === 'idle' && fetcher.data?.cart) {
      openCart(fetcher.data.cart);
    }
  }, [fetcher.state, fetcher.data]);

  if (!available) {
    return (
      <button
        disabled
        style={{...style, background:'#d1d5db', cursor:'not-allowed'}}
      >
        Sold Out
      </button>
    );
  }

  return (
    <fetcher.Form method="post" action="/cart">
      <input type="hidden" name="cartAction" value="ADD_TO_CART" />
      <input type="hidden" name="lines" value={JSON.stringify([{merchandiseId: variantId, quantity: qty || 1}])} />
      <button
        type="submit"
        disabled={fetcher.state !== 'idle'}
        style={style}
      >
        {fetcher.state !== 'idle' ? '...' : (label || 'Add to Bag')}
      </button>
    </fetcher.Form>
  );
}

function BundleAddButton({lines, count}) {
  const fetcher = useFetcher();
  const {openCart} = useCart();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__fetcherDebug = {state: fetcher.state, data: fetcher.data};
    }
    if (fetcher.state === 'idle' && fetcher.data?.cart) {
      openCart(fetcher.data.cart);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form method="post" action="/cart">
      <input type="hidden" name="cartAction" value="ADD_TO_CART" />
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      <button
        type="submit"
        disabled={fetcher.state !== 'idle'}
        style={{
          display:'inline-block',
          padding:'14px 40px',
          background:'#0a0a0a',
          color:'#fff',
          fontSize:'11px',
          letterSpacing:'2px',
          textTransform:'uppercase',
          cursor:'pointer',
          border:'none'
        }}
      >
        {fetcher.state !== 'idle' ? '...' : ('Add All ' + count + ' Items to Bag')}
      </button>
    </fetcher.Form>
  );
}

// ============================================
// REVIEWS SECTION COMPONENT
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
  const [formData, setFormData] = useState({author:'',rating:5,title:'',body:''});

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
      case 'newest': s.sort((a,b) => new Date(b.date) - new Date(a.date)); break;
      case 'oldest': s.sort((a,b) => new Date(a.date) - new Date(b.date)); break;
      case 'highest': s.sort((a,b) => b.rating - a.rating); break;
      case 'lowest': s.sort((a,b) => a.rating - b.rating); break;
      case 'helpful': s.sort((a,b) => (b.helpful||0) - (a.helpful||0)); break;
    }
    return s;
  }, [allReviews, sortBy]);

  const totalPages = Math.ceil(sorted.length / REVIEWS_PER_PAGE);
  const paginated = sorted.slice((currentPage-1)*REVIEWS_PER_PAGE, currentPage*REVIEWS_PER_PAGE);

  const ratingDist = useMemo(() => {
    const d = {5:0,4:0,3:0,2:0,1:0};
    allReviews.forEach(r => { d[r.rating] = (d[r.rating]||0)+1; });
    return d;
  }, [allReviews]);

  const handleLike = useCallback((id) => {
    setLikedReviews(prev => {
      const u = {...prev, [id]: !prev[id]};
      try { localStorage.setItem(`liked-${productId}`, JSON.stringify(u)); } catch {}
      return u;
    });
  }, [productId]);

  const handleReply = useCallback((reviewId) => {
    if (!replyText.trim()) return;
    const nr = {id:`lr-${Date.now()}`, author:'You', body:replyText, date:new Date().toISOString(), likes:0};
    setLocalReplies(prev => {
      const u = {...prev, [reviewId]: [...(prev[reviewId]||[]), nr]};
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
    setFormData({author:'',rating:5,title:'',body:''});
    setShowForm(false);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="pdp-reviews-header">
        <div>
          <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'10px'}}>Customer Reviews</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'52px',fontWeight:'400',lineHeight:'1'}}>{averageRating}</div>
          <StarRating rating={parseFloat(averageRating)} size={16} />
          <div style={{fontSize:'12px',color:'#999',marginTop:'5px'}}>Based on {reviewCount} reviews</div>
        </div>
        <div className="pdp-rating-bars">
          {[5,4,3,2,1].map(star => (
            <div key={star} className="pdp-bar-row">
              <span className="pdp-bar-label">{star} ★</span>
              <div className="pdp-bar-track">
                <div className="pdp-bar-fill" style={{width: `${reviewCount > 0 ? (ratingDist[star]/reviewCount)*100 : 0}%`}} />
              </div>
              <span className="pdp-bar-count">{ratingDist[star]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pdp-reviews-controls">
        <button className="pdp-write-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
        <select className="pdp-sort-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {showForm && (
        <form className="pdp-review-form" onSubmit={handleSubmitReview}>
          <h3>Write Your Review</h3>
          <div className="fg">
            <label>Your Name</label>
            <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} required placeholder="Enter your name" />
          </div>
          <div className="fg">
            <label>Rating</label>
            <div className="pdp-star-select">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" className={s <= formData.rating ? 'active':''} onClick={() => setFormData({...formData, rating:s})}>★</button>
              ))}
            </div>
          </div>
          <div className="fg">
            <label>Review Title</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Summary of your review" />
          </div>
          <div className="fg">
            <label>Your Review</label>
            <textarea value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} required placeholder="Tell us about your experience..." />
          </div>
          <button type="submit" className="pdp-write-btn" style={{marginTop:'8px'}}>Submit Review</button>
        </form>
      )}

      <div>
        {paginated.map(review => {
          const allReplies = [...(review.replies||[]), ...(localReplies[review.id]||[])];
          return (
            <div key={review.id} className="pdp-review-card">
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                <div className="pdp-review-avatar">{review.author[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'12px',fontWeight:'500'}}>
                    {review.author}
                    {review.verified && <span className="pdp-verified">✓ Verified Buyer</span>}
                  </div>
                  <div style={{fontSize:'10px',color:'#999'}}>
                    {new Date(review.date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}
                  </div>
                </div>
              </div>
              <StarRating rating={review.rating} />
              <div style={{fontSize:'13px',fontWeight:'500',marginTop:'7px',marginBottom:'5px'}}>{review.title}</div>
              <div style={{fontSize:'13px',color:'#666',lineHeight:'1.7'}}>{review.body}</div>
              <div className="pdp-review-actions">
                <button className={likedReviews[review.id] ? 'liked':''} onClick={() => handleLike(review.id)}>
                  👍 {review.likes + (likedReviews[review.id] ? 1 : 0)}
                </button>
                <button className={likedReviews[`h-${review.id}`] ? 'liked':''} onClick={() => handleLike(`h-${review.id}`)}>
                  Helpful ({(review.helpful||0) + (likedReviews[`h-${review.id}`] ? 1 : 0)})
                </button>
                <button onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}>
                  💬 Reply
                </button>
              </div>
              {allReplies.length > 0 && allReplies.map(rp => (
                <div key={rp.id} className="pdp-reply-card">
                  <div style={{fontSize:'12px',marginBottom:'4px'}}>
                    <strong>{rp.author}</strong>
                    <span style={{color:'#999',marginLeft:'8px',fontSize:'10px'}}>
                      {new Date(rp.date).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}
                    </span>
                  </div>
                  <div style={{fontSize:'12px',color:'#666'}}>{rp.body}</div>
                </div>
              ))}
              {replyingTo === review.id && (
                <div className="pdp-reply-form">
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." />
                  <button onClick={() => handleReply(review.id)}>Post</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pdp-pagination">
          <button disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)}>← Prev</button>
          {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
            <button key={p} className={p===currentPage?'active':''} onClick={() => setCurrentPage(p)}>{p}</button>
          ))}
          <button disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)}>Next →</button>
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
  const [activeTab, setActiveTab] = useState('description');
  const bitPrevRef = useRef(null);

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
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount || 0);
  const variantId = selectedVariant?.id;
  const available = selectedVariant?.availableForSale;

  // ============================================
  // REVIEWS
  // ============================================
  const generatedReviews = useMemo(() => generateReviewsForProduct(product.id), [product.id]);
  const [userReviews, setUserReviews] = useState([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem(`urev-${product.id}`);
      if (s) setUserReviews(JSON.parse(s));
    } catch {}
  }, [product.id]);

  const handleAddReview = useCallback((data) => {
    const nr = {
      ...data,
      id: `user-${Date.now()}`,
      date: new Date().toISOString(),
      verified: false,
      likes: 0,
      helpful: 0,
      replies: [],
    };
    const updated = [nr, ...userReviews];
    setUserReviews(updated);
    try { localStorage.setItem(`urev-${product.id}`, JSON.stringify(updated)); } catch {}
  }, [userReviews, product.id]);

  const totalReviewCount = generatedReviews.length + userReviews.length;
  const avgRating = getAvgRating([...userReviews, ...generatedReviews]);

  // ============================================
  // BUY IT TOGETHER — different products
  // ============================================
  const buyTogetherProducts = useMemo(() => {
    const currentId = product.id;
    const others = allProducts.filter(p => p.id !== currentId);
    if (others.length === 0) return [];
    const rng = seededRandom(seedFromId(currentId) + 999);
    const shuffled = [...others].sort(() => rng() - 0.5);
    return shuffled.slice(0, 2);
  }, [product.id, allProducts]);

  // ============================================
  // YOU MAY ALSO LIKE — different products
  // ============================================
  const youMayAlsoLike = useMemo(() => {
    const currentId = product.id;
    let candidates = recommended.filter(p => p.id !== currentId);
    if (candidates.length < 4) {
      const ids = new Set(candidates.map(p => p.id));
      ids.add(currentId);
      const extras = allProducts.filter(p => !ids.has(p.id));
      candidates = [...candidates, ...extras];
    }
    const rng = seededRandom(seedFromId(currentId) + 777);
    const shuffled = [...candidates].sort(() => rng() - 0.5);
    return shuffled.slice(0, 4);
  }, [product.id, recommended, allProducts]);

  useEffect(() => {
    const fn = () => setFloatingVisible(window.scrollY > 700);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const addBtnStyle = {
    display:'block', width:'100%', padding:'14px',
    background: available ? '#0a0a0a' : '#d1d5db',
    color:'#fff', fontSize:'11px', letterSpacing:'2.5px',
    textTransform:'uppercase', cursor: available ? 'pointer' : 'not-allowed',
    marginTop:'10px', border:'none',
  };

  // Buy together total
  const bitSelected = useMemo(() => {
    const m = {};
    buyTogetherProducts.forEach(p => { m[p.id] = true; });
    return m;
  }, [buyTogetherProducts]);
  const [bitChecked, setBitChecked] = useState({});
  useEffect(() => {
    const m = {};
    buyTogetherProducts.forEach(p => { m[p.id] = true; });
    setBitChecked(m);
  }, [buyTogetherProducts]);

  const bitSelectedProducts = buyTogetherProducts.filter(p => bitChecked[p.id]);
  const bitTotal = parseFloat(price?.amount || 0) + bitSelectedProducts.reduce((s,p) => s + parseFloat(p.priceRange?.minVariantPrice?.amount || 0), 0);
  const bitLines = [
    {merchandiseId: variantId, quantity: 1},
    ...bitSelectedProducts.map(p => ({merchandiseId: p.variants?.nodes?.[0]?.id, quantity: 1})),
  ].filter(l => l.merchandiseId);

  return (
    <div style={{fontFamily:'sans-serif',color:'#0a0a0a',paddingTop:'96px'}} suppressHydrationWarning>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{__html: CSS}} />

      <div className="pdp-sticky-nav">
        <div style={{display:'flex'}}>
          <a href="#the-watch">The Watch</a>
          <a href="#specs">Specs</a>
          <a href="#reviews">Reviews</a>
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="the-watch" style={{display:'grid',gridTemplateColumns:'1fr 448px',alignItems:'start'}}>
        <div>
          <div style={{width:'100%',background:'#f5f5f0'}}>
            {heroImage
              ? <img src={heroImage.url} alt={heroImage.altText || product.title} style={{width:'100%',minHeight:'70vh',maxHeight:'95vh',objectFit:'cover',display:'block'}} />
              : <div style={{width:'100%',height:'85vh',background:'#f8f8f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'80px'}}>⌚</div>
            }
          </div>
          {images.length > 1 && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px',margin:'40px 0'}}>
              {images.slice(1,3).map((im,i) => (
                <img key={im.id||i} src={im.url} alt={im.altText||''} style={{width:'100%',aspectRatio:'1/1',objectFit:'cover',display:'block'}} />
              ))}
            </div>
          )}
        </div>

        <div className="pdp-hero-right">
          <div style={{fontSize:'10px',letterSpacing:'1.5px',textTransform:'uppercase',color:'#bbb',marginBottom:'14px'}}>
            <Link to="/" style={{color:'#bbb',textDecoration:'none'}}>Home</Link>
            <span style={{margin:'0 5px'}}>/</span>
            <Link to="/collections" style={{color:'#bbb',textDecoration:'none'}}>Watches</Link>
          </div>

          {product.vendor && <div style={{fontSize:'10px',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'5px'}}>{product.vendor}</div>}

          <h1 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:'400',lineHeight:'1.3',marginBottom:'10px'}}>{product.title}</h1>

          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px',cursor:'pointer'}}
            onClick={() => document.getElementById('reviews')?.scrollIntoView({behavior:'smooth'})}>
            <StarRating rating={parseFloat(avgRating)} />
            <span style={{fontSize:'11px',color:'#999'}}>{avgRating} · {totalReviewCount} reviews</span>
          </div>

          <div style={{display:'flex',alignItems:'baseline',gap:'10px',marginBottom:'20px',paddingBottom:'20px',borderBottom:'1px solid #f0f0f0'}}>
            {price && <span style={{fontSize:'26px',fontWeight:'600'}}>{fmt(price.amount, price.currencyCode)}</span>}
            {isOnSale && <span style={{fontSize:'15px',color:'#9ca3af',textDecoration:'line-through'}}>{fmt(compareAtPrice.amount, compareAtPrice.currencyCode)}</span>}
            {isOnSale && <span style={{background:'#dc2626',color:'#fff',fontSize:'10px',padding:'2px 8px'}}>SALE</span>}
          </div>

          {productOptions.map(option => {
            if (option.optionValues.length <= 1) return null;
            const hasVariantImages = option.optionValues.some(v => v.firstSelectableVariant?.image);
            return (
              <div key={option.name} style={{marginBottom:'20px'}}>
                <div style={{fontSize:'10px',letterSpacing:'1.5px',textTransform:'uppercase',color:'#666',marginBottom:'10px'}}>{option.name}</div>
                {hasVariantImages ? (
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    {option.optionValues.map(value => {
                      const varImg = value.firstSelectableVariant?.image;
                      const isSelected = value.selected;
                      const isAvailable = value.firstSelectableVariant?.availableForSale !== false;
                      return value.isDifferentProduct ? (
                        <Link key={value.name} to={'/products/'+value.handle+'?'+value.variantUriQuery}
                          title={value.name}
                          style={{display:'block',width:'64px',height:'64px',padding:'2px',border:isSelected?'2px solid #0a0a0a':'2px solid #e5e7eb',borderRadius:'10px',background:'#f5f5f0',overflow:'hidden',opacity:isAvailable?1:0.35,textDecoration:'none',flexShrink:0,transition:'border-color 0.15s'}}>
                          {varImg && <img src={varImg.url} alt={value.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'7px',display:'block'}} />}
                        </Link>
                      ) : (
                        <button key={value.name} type="button" title={value.name}
                          disabled={!value.exists}
                          onClick={() => { if (!value.selected) navigate('?'+value.variantUriQuery, {replace:true,preventScrollReset:true}); }}
                          style={{width:'64px',height:'64px',padding:'2px',border:isSelected?'2px solid #0a0a0a':'2px solid #e5e7eb',borderRadius:'10px',background:'#f5f5f0',cursor:value.exists?'pointer':'not-allowed',overflow:'hidden',opacity:isAvailable?1:0.35,flexShrink:0,transition:'border-color 0.15s'}}>
                          {varImg
                            ? <img src={varImg.url} alt={value.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'7px',display:'block'}} />
                            : <span style={{fontSize:'9px',color:'#666',lineHeight:'1.2',display:'flex',alignItems:'center',justifyContent:'center',height:'100%',textAlign:'center',padding:'4px'}}>{value.name}</span>
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
                            className={'pdp-opt-btn'+(value.selected?' sel':'')}
                            style={{textDecoration:'none',color:'inherit'}}>
                            {value.name}
                          </Link>
                        : <button key={value.name} type="button"
                            className={'pdp-opt-btn'+(value.selected?' sel':'')}
                            disabled={!value.exists}
                            onClick={() => { if (!value.selected) navigate('?'+value.variantUriQuery, {replace:true,preventScrollReset:true}); }}>
                            {value.name}
                          </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{display:'flex',gap:'8px',marginTop:'20px'}}>
            <div style={{display:'flex',alignItems:'center',border:'1px solid #e5e7eb',height:'48px'}}>
              <button onClick={() => setQty(q => Math.max(1,q-1))} style={{width:'34px',height:'48px',background:'none',border:'none',fontSize:'16px',cursor:'pointer',color:'#666'}}>−</button>
              <span style={{width:'26px',textAlign:'center',fontSize:'13px'}}>{qty}</span>
              <button onClick={() => setQty(q => q+1)} style={{width:'34px',height:'48px',background:'none',border:'none',fontSize:'16px',cursor:'pointer',color:'#666'}}>+</button>
            </div>
            <button onClick={() => setWishlist(w => !w)} style={{width:'48px',height:'48px',background:'none',border:'1px solid #e5e7eb',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill={wishlist?'#dc2626':'none'} stroke={wishlist?'#dc2626':'#888'} strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {variantId && (
            <AddBtn variantId={variantId} qty={qty} available={available}
              label={`Add to Bag  |  ${price ? fmt(price.amount, price.currencyCode) : ''}`}
              style={addBtnStyle} />
          )}

          <div style={{marginTop:'16px',paddingTop:'14px',borderTop:'1px solid #f5f5f5',display:'flex',flexDirection:'column',gap:'10px'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:'10px'}}>
              <span style={{fontSize:'16px'}}>🚚</span>
              <div>
                <div style={{fontSize:'11px',fontWeight:'600',color:'#0a0a0a'}}>FREE SHIPPING WORLDWIDE</div>
                <div style={{fontSize:'11px',color:'#999',marginTop:'3px',lineHeight:'1.6'}}>US & Canada: 5–10 Business Days</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',paddingTop:'8px',borderTop:'1px solid #f5f5f5'}}>
              <span style={{fontSize:'16px'}}>🔒</span>
              <div style={{fontSize:'11px',color:'#0a0a0a',fontWeight:'500'}}>30-Day Money-Back Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-IMAGE STRIP */}
      {images.length > 3 && (
        <div style={{position:'relative',margin:'0 0 60px'}}>
          <button onClick={()=>{const el=document.getElementById('pdp-strip');if(el)el.scrollBy({left:-400,behavior:'smooth'})}}
            style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',zIndex:10,width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.9)',border:'1px solid #e5e7eb',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>←</button>
          <div id="pdp-strip" style={{display:'flex',gap:'4px',overflowX:'auto',scrollbarWidth:'none'}}>
            {images.slice(3).map((im,i) => (
              <img key={im.id||i} src={im.url} alt={im.altText||''} style={{flexShrink:0,width:'calc(20% - 4px)',minWidth:'200px',aspectRatio:'1/1',objectFit:'cover',display:'block'}} />
            ))}
          </div>
          <button onClick={()=>{const el=document.getElementById('pdp-strip');if(el)el.scrollBy({left:400,behavior:'smooth'})}}
            style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',zIndex:10,width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.9)',border:'1px solid #e5e7eb',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>→</button>
        </div>
      )}

      {/* SPECS */}
      <section id="specs">
        <div className="pdp-specs">
          <div><h2 className="pdp-spec-title">Specifications</h2></div>
          <div>
            {product.descriptionHtml
              ? <div className="pdp-shopify-desc" suppressHydrationWarning dangerouslySetInnerHTML={{__html: product.descriptionHtml ?? ''}} />
              : <p style={{color:'#777',fontSize:'13px'}} suppressHydrationWarning>{product.description}</p>
            }
          </div>
        </div>
      </section>

      {/* EDITORIAL BANNER */}
      <div style={{position:'relative',minHeight:'520px',overflow:'hidden',display:'flex',alignItems:'center',background:'#111',marginBottom:'0'}}>
        {heroImage && <img src={heroImage.url} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.35}} />}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(10,10,10,0.75) 0%,rgba(10,10,10,0.2) 100%)'}} />
        <div style={{position:'relative',zIndex:2,padding:'60px 80px',color:'#fff',maxWidth:'600px'}}>
          <p style={{fontSize:'10px',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'20px',fontFamily:'monospace'}}>— Editorial</p>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(32px,4vw,52px)',fontWeight:'400',lineHeight:'1.15',marginBottom:'20px',letterSpacing:'-0.5px'}}>
            Some watches tell time.<br/><em>This one tells your story.</em>
          </h2>
          <p style={{fontSize:'14px',lineHeight:'1.85',color:'rgba(255,255,255,0.7)',marginBottom:'32px',maxWidth:'460px',fontWeight:'300'}}>
            The {product.title} is engineered for those who move with intention.
            Where precision meets permanence — a timepiece built not just to be worn, but to be remembered.
          </p>
          <div style={{display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
            {variantId && available && (
              <AddBtn variantId={variantId} qty={1} available={available}
                label={`Add to Bag — ${price ? fmt(price.amount,price.currencyCode) : ''}`}
                style={{padding:'14px 36px',background:'#fff',color:'#0a0a0a',fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer',border:'none',fontWeight:'500'}} />
            )}
            <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',letterSpacing:'1px'}}>Free shipping on orders $75+</span>
          </div>
        </div>
      </div>

      {/* BUY IT TOGETHER — real different products */}
      {buyTogetherProducts.length > 0 && (
        <div className="pdp-bit-section">
          <div className="pdp-bit-inner">
            <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'6px'}}>Complete the Look</div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'26px',fontWeight:'400',marginBottom:'36px'}}>Buy It Together</h2>
            <div style={{display:'grid',gridTemplateColumns: buyTogetherProducts.length === 2 ? '1fr 40px 1fr 40px 1fr' : '1fr 40px 1fr',gap:'0',alignItems:'center'}}>
              {/* Current product */}
              <div style={{background:'#fff',border:'1px solid #f0f0f0',padding:'20px'}}>
                {heroImage && <img src={heroImage.url} alt={product.title} style={{width:'100%',aspectRatio:'1/1',objectFit:'cover',display:'block',marginBottom:'12px'}} />}
                <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'3px'}}>{product.vendor || 'Vastara'}</div>
                <div style={{fontSize:'13px',fontWeight:'500',marginBottom:'2px'}}>{product.title}</div>
                <div style={{fontSize:'10px',color:'#999',marginBottom:'4px'}}>This item</div>
                <div style={{fontSize:'14px',color:'#c9a84c',fontWeight:'600'}}>{price ? fmt(price.amount, price.currencyCode) : ''}</div>
              </div>

              {buyTogetherProducts.map((bp, i) => (
                <div key={bp.id} style={{display:'contents'}}>
                  <div style={{textAlign:'center',fontSize:'24px',color:'#ccc',fontWeight:'200'}}>+</div>
                  <div style={{background:'#fff',border:'1px solid #f0f0f0',padding:'20px',position:'relative'}}>
                    <div style={{position:'absolute',top:'12px',left:'12px',zIndex:2}}>
                      <input type="checkbox" checked={!!bitChecked[bp.id]}
                        onChange={() => setBitChecked(prev => ({...prev, [bp.id]: !prev[bp.id]}))}
                        style={{width:'16px',height:'16px',cursor:'pointer'}} />
                    </div>
                    <Link to={`/products/${bp.handle}`}>
                      {bp.images?.nodes?.[0]
                        ? <img src={bp.images.nodes[0].url} alt={bp.title} style={{width:'100%',aspectRatio:'1/1',objectFit:'cover',display:'block',marginBottom:'12px',opacity:bitChecked[bp.id]?1:0.4}} />
                        : bp.featuredImage
                          ? <img src={bp.featuredImage.url} alt={bp.title} style={{width:'100%',aspectRatio:'1/1',objectFit:'cover',display:'block',marginBottom:'12px',opacity:bitChecked[bp.id]?1:0.4}} />
                          : <div style={{width:'100%',aspectRatio:'1/1',background:'#f0f0f0',marginBottom:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px'}}>⌚</div>
                      }
                    </Link>
                    <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'3px'}}>{bp.vendor || 'Vastara'}</div>
                    <Link to={`/products/${bp.handle}`} style={{textDecoration:'none',color:'inherit'}}>
                      <div style={{fontSize:'13px',fontWeight:'500',marginBottom:'4px'}}>{bp.title}</div>
                    </Link>
                    <div style={{fontSize:'14px',color:'#c9a84c',fontWeight:'600'}}>
                      {bp.priceRange?.minVariantPrice ? fmt(bp.priceRange.minVariantPrice.amount, bp.priceRange.minVariantPrice.currencyCode) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:'24px',textAlign:'center'}}>
              <div style={{fontSize:'14px',fontWeight:'600',marginBottom:'12px'}}>
                Bundle Price: {fmt(bitTotal, price?.currencyCode || 'USD')}
              </div>
              {variantId && (
                <BundleAddButton lines={bitLines} count={bitSelectedProducts.length + 1} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* YOU MAY ALSO LIKE — real different products */}
      {youMayAlsoLike.length > 0 && (
        <div className="pdp-ymal-section">
          <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'6px'}}>Don't Miss</div>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'26px',fontWeight:'400',marginBottom:'28px'}}>You May Also Like</h2>
          <div className="pdp-ymal-grid">
            {youMayAlsoLike.map(yp => {
              const ypImg = yp.images?.nodes?.[0] || yp.featuredImage;
              const ypPrice = yp.priceRange?.minVariantPrice;
              return (
                <Link key={yp.id} to={`/products/${yp.handle}`} className="pdp-ymal-card" prefetch="intent">
                  {ypImg
                    ? <img src={ypImg.url} alt={yp.title} />
                    : <div style={{width:'100%',aspectRatio:'1/1',background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px'}}>⌚</div>
                  }
                  <div style={{padding:'12px 0'}}>
                    <div style={{fontSize:'11px',color:'#999',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'3px'}}>{yp.vendor || 'Vastara'}</div>
                    <div style={{fontSize:'13px',fontWeight:'500'}}>{yp.title}</div>
                    <div style={{fontSize:'13px',color:'#c9a84c',marginTop:'3px'}}>{ypPrice ? fmt(ypPrice.amount, ypPrice.currencyCode) : ''}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* REVIEWS SECTION */}
      <section id="reviews" className="pdp-reviews">
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

      {/* FLOATING BAR */}
      <div className={`pdp-floating${floatingVisible?' vis':''}`}>
        {heroImage && (
          <div style={{width:'42px',height:'42px',borderRadius:'10px',overflow:'hidden',flexShrink:0,background:'#f5f5f0'}}>
            <img src={heroImage.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:'12px',fontWeight:'500',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{product.title}</div>
          <div style={{fontSize:'11px',color:'#999'}}>{price ? fmt(price.amount,price.currencyCode) : ''}</div>
        </div>
        {variantId && (
          <AddBtn variantId={variantId} qty={1} available={available}
            label="Add to Bag →"
            style={{flexShrink:0,padding:'11px 20px',background:available?'#0a0a0a':'#d1d5db',color:'#fff',border:'none',borderRadius:'12px',fontSize:'11px',letterSpacing:'1px',textTransform:'uppercase',cursor:available?'pointer':'not-allowed',whiteSpace:'nowrap',fontWeight:'500'}}
            onDone={() => openCart()} />
        )}
      </div>

      <Analytics.ProductView data={{products:[{id:product.id,title:product.title,price:selectedVariant?.price?.amount||'0',vendor:product.vendor,variantId:selectedVariant?.id||'',variantTitle:selectedVariant?.title||'',quantity:1}]}} />
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

// Import at top - add this manually if needed