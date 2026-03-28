import React from 'react';
import {useLoaderData, Link} from 'react-router';
import {WatchQuiz} from '~/components/WatchQuiz';
import {ReviewsStrip} from '~/components/ReviewsStrip';
import {useState, useEffect, useRef} from 'react';

export const meta = () => [{title: 'VASTARA | Luxury Timepieces'}];

export async function loader({context}) {
  const {language, country} = context.storefront.i18n;
  const {storefront} = context;
  const [{collections}, {products}, bulovaData, spotlightData] = await Promise.all([
    storefront.query(COLLECTIONS_QUERY, {variables: {country, language}}),
    storefront.query(PRODUCTS_QUERY, {variables: {country, language}}),
    storefront.query(BULOVA_QUERY, {variables: {country, language}}).catch(() => ({collection: null})),
    storefront.query(SPOTLIGHT_QUERY, {variables: {country, language}}).catch(() => ({product: null})),
  ]);
  console.log("I18N:", JSON.stringify(context.storefront.i18n)); console.log("PRICE:", JSON.stringify(products?.nodes?.[0]?.priceRange)); return {
    collections: collections.nodes,
    products: products.nodes,
    bulovaProducts: bulovaData?.collection?.products?.nodes || [],
    bulovaTitle: bulovaData?.collection?.title || 'Bulova Collection',
    spotlightProduct: spotlightData?.product || null,
  };
}

const img = {
  hero: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/banner_1_e7421a31-581d-4825-a5a0-f4d325d4697a.jpg?v=1772467291',
  banner2: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/BANNER_2_f12e13b1-14a7-4c27-809f-d15d80b8bf1a.jpg?v=1772467291',
  banner3: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/BANNER_3_4dabbf09-daef-4686-a495-b3693a8bc6f4.jpg?v=1772467291',
  banner4: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/BANNER_4.jpg?v=1772467292',
  banner5: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/BANNER_5.jpg?v=1772467312',
  bannerSlim: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/BANNER_SLIM_1.jpg?v=1772467312',
  quad1: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/QUADRADO_1.jpg?v=1772467333',
  quad2: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/QUADRADO_2.jpg?v=1772467333',
  quad3: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/QUADRADO_3.jpg?v=1772467333',
  quad5: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/QUADRADO_5.jpg?v=1772467333',
  quad6: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/QUADRADO_6.jpg?v=1772467333',
  quad7: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/QUADRADO_7.jpg?v=1772467333',
  quad8: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/QUADRADO_8.jpg?v=1772467333',
  quad9: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/QUADRADO_9.jpg?v=1772467333',
  quad10: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/Whisk_edb0dca5c14859199834f95b8a481fe1dr.png?v=1772489152',
  quad11: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/QUADRADO_11.jpg?v=1772467333',
  retangular1: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/RETANGULAR_1.jpg?v=1772467354',
  vertical1: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_1.jpg?v=1772467367',
  vertical2: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_2.jpg?v=1772467366',
  vertical3: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_3.jpg?v=1772467367',
  vertical4: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_4.jpg?v=1772467366',
};


function EditorialSection({products, getProductImage, bulovaProducts}) {
  const editorialProducts = bulovaProducts.length > 0 ? bulovaProducts : products.slice(4, 12);
  const scrollRef = useRef(null);

  const editorialNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({left: 380, behavior: 'smooth'});
    }
  };
  const editorialPrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({left: -380, behavior: 'smooth'});
    }
  };

  return (
    <section className="hp-premium-editorial">
      <div className="hp-premium-left">
        <div className="hp-premium-media">
          <div className="hide-on-mobile">
            <AutoPlayVideo src="https://cdn.shopify.com/videos/c/o/v/f027b635fb744591b3b550d87636de63.mp4" />
          </div>
          <div className="show-on-mobile">
            <MobileFade images={['https://cdn.shopify.com/s/files/1/0778/2921/0327/files/1_ef7d86c9-66f8-4623-b34d-226d928023a0.jpg?v=1774215389','https://cdn.shopify.com/s/files/1/0778/2921/0327/files/3_6737b1bb-d696-4062-8fee-ee78d12bb1cc.jpg?v=1774216753']} />
          </div>
          <div className="hp-premium-overlay" />
        </div>
        <div className="hp-premium-content">
          <div className="hp-premium-top-line" />
          <p className="hp-premium-tag">COLLECTION EXCLUSIVE</p>
          <h2>Ice Blue <span className="italic">Timepieces</span></h2>
          <p className="hp-premium-desc">A fusion of precision engineering and refined elegance. Each timepiece captures the essence of cool sophistication.</p>
          <div className="hp-premium-cta">
            <Link to="/collections/ice-blue" className="hp-premium-btn">Discover Collection</Link>
            <span className="hp-premium-count">{editorialProducts.length} Timepieces</span>
          </div>
        </div>
      </div>
      <div className="hp-premium-right">
        <div className="hp-premium-header">
          <div className="hp-premium-header-title">
            <span className="hp-premium-line" />
            <h3>Featured</h3>
          </div>
          <div className="hp-premium-arrows">
            <button onClick={editorialPrev} aria-label="Previous">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/></svg>
            </button>
            <button onClick={editorialNext} aria-label="Next">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/></svg>
            </button>
          </div>
        </div>
        <div className="hp-premium-scroll" ref={scrollRef}>
          {editorialProducts.map((p, i) => (
            <Link
              key={p.id}
              to={`/products/${p.handle}`}
              className="hp-premium-card"
            >
              <div className="hp-premium-card-img">
                <img src={p.featuredImage?.url || getProductImage(p, i + 4)} alt={p.title} loading="lazy" />
                <div className="hp-premium-card-overlay" />
                <span className="hp-premium-badge">Exclusive</span>
                <div className="hp-premium-card-action">Quick View</div>
              </div>
              <div className="hp-premium-card-info">
                <div className="hp-premium-card-top">
                  <h4>{p.title}</h4>
                  <span className="hp-premium-ref">REF: {String(i + 1001).padStart(4, '0')}</span>
                </div>
                <div className="hp-premium-card-bottom">
                  <p className="hp-premium-price">
                    {p.priceRange?.minVariantPrice ? new Intl.NumberFormat("en-US", {style:"currency", currency: p.priceRange.minVariantPrice.currencyCode}).format(p.priceRange.minVariantPrice.amount) : "$299.00"}
                  </p>
                  <div className="hp-premium-specs">
                    <span>Swiss Movement</span>
                    <span>•</span>
                    <span>Sapphire Crystal</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <div className="hp-premium-card-spacer" />
        </div>
      </div>
    </section>
  );
}

function FadingHeadlines({headlines}) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(c => (c + 1) % headlines.length);
        setVisible(true);
      }, 600);
    }, 4000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  return (
    <div style={{
      padding:'80px 48px',
      textAlign:'center',
      background:'#fff',
      minHeight:'220px',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
    }}>
      <h2 style={{
        fontSize:'38px',
        fontWeight:400,
        lineHeight:1.3,
        maxWidth:'620px',
        margin:'0 auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition:'opacity 0.6s ease, transform 0.6s ease',
        fontStyle:'italic',
        color:'#111',
        letterSpacing:'-0.3px',
      }}>
        "{headlines[current]}"
      </h2>
    </div>
  );
}

function BeforeAfterSlider({leftImg, rightImg, leftLabel, rightLabel}) {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const getPos = (clientX) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  };

  const onMouseDown = (e) => { dragging.current = true; e.preventDefault(); };
  const onMouseMove = (e) => { if (dragging.current) setPos(getPos(e.clientX)); };
  const onMouseUp = () => { dragging.current = false; };
  const onTouchMove = (e) => { setPos(getPos(e.touches[0].clientX)); };

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      style={{position:'relative', width:'100%', height:'min(480px, 60vw)', minHeight:'220px', overflow:'hidden', cursor:'col-resize', userSelect:'none'}}
    >
      {/* Imagem direita (fundo) */}
      <img src={rightImg} alt={rightLabel} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />

      {/* Label direita */}
      <div style={{position:'absolute',top:'50%',right:'32px',transform:'translateY(-50%)',color:'#fff',fontSize:'11px',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',opacity: pos > 85 ? 0 : 1, transition:'opacity 0.3s'}}>
        {rightLabel}
      </div>

      {/* Imagem esquerda (clip) */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',width: pos + '%'}}>
        <img src={leftImg} alt={leftLabel} style={{position:'absolute',inset:0,width:'100vw',maxWidth:'100vw',height:'100%',objectFit:'cover'}} />
      </div>

      {/* Label esquerda */}
      <div style={{position:'absolute',top:'50%',left:'32px',transform:'translateY(-50%)',color:'#fff',fontSize:'11px',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',opacity: pos < 15 ? 0 : 1, transition:'opacity 0.3s'}}>
        {leftLabel}
      </div>

      {/* Divisor */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={(e) => { dragging.current = true; }}
        style={{
          position:'absolute',
          top:0, bottom:0,
          left: pos + '%',
          transform:'translateX(-50%)',
          width:'3px',
          background:'#fff',
          cursor:'col-resize',
          zIndex:10,
        }}
      >
        {/* Handle circular */}
        <div style={{
          position:'absolute',
          top:'50%',
          left:'50%',
          transform:'translate(-50%,-50%)',
          width:'44px',
          height:'44px',
          borderRadius:'50%',
          background:'#fff',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          boxShadow:'0 4px 20px rgba(0,0,0,0.3)',
          fontSize:'16px',
          color:'#000',
          fontWeight:700,
        }}>⇔</div>
      </div>
    </div>
  );
}


function shopifyImg(url, width) {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('width', String(width));
    u.searchParams.set('crop', 'center');
    return u.toString();
  } catch { return url; }
}


function MobileFade({images, style}) {
  const [idx, setIdx] = React.useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images.length]);
  return (
    <div style={{position:'relative', width:'100%', height:'100%', ...style}}>
      {images.map((src, i) => (
        <img key={src} src={src} alt="" style={{
          position:'absolute', inset:0, width:'100%', height:'100%',
          objectFit:'cover', display:'block',
          opacity: i === idx ? 1 : 0,
          transition:'opacity 1s ease',
        }} />
      ))}
    </div>
  );
}

function AutoPlayVideo({src, style, className}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Try to play immediately
    el.play().catch(() => {});
    // Also play when visible (mobile)
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.play().catch(() => {}); },
      {threshold: 0.2}
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      autoPlay
      style={style}
      className={className}
    />
  );
}


function seededRng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function getProductReviews(productId) {
  const seed = productId ? productId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 42;
  const rng = seededRng(seed);
  const count = Math.floor(rng() * 80) + 20; // 20-100
  const rating = (rng() * 1.2 + 3.8).toFixed(1); // 3.8-5.0
  const stars = Math.round(parseFloat(rating));
  return {count, rating, stars};
}

export default function Homepage() {
  const {collections, products, bulovaProducts, bulovaTitle, spotlightProduct} = useLoaderData();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % 3), 5000);
    return () => clearInterval(timer);
  }, []);

  const heroSlides = [
    { image: img.hero, tag: 'Curated Timepieces', title: 'We Select What Deserves\nYour Wrist', subtitle: 'A refined selection of watches from trusted brands, chosen for design, quality, and presence.' },
    { image: img.banner2, tag: 'Our Selection Process', title: 'Only the Best\nMake It Here', subtitle: 'Every watch is evaluated for craftsmanship, materials, and real-world performance before joining Vastara.' },
    { image: img.banner3, tag: 'From Leading Watchmakers', title: 'One Destination.\nMultiple Icons.', subtitle: 'Discover timepieces from globally recognized brands — curated into a single premium experience.' },
  ];

  const getProductImage = (p, i) => p?.featuredImage?.url || [img.quad1, img.quad2, img.quad3, img.quad5, img.quad6, img.quad7, img.quad8, img.quad9][i % 8];

  const scrollLeft = () => {
    if (sliderRef.current) { sliderRef.current.scrollBy({ left: -1520, behavior: 'smooth' }); }
  };
  const scrollRight = () => {
    if (sliderRef.current) { sliderRef.current.scrollBy({ left: 1520, behavior: 'smooth' }); }
  };

  return (
    <div className="hp">
      <style suppressHydrationWarning>{`
        /* font loaded in root.jsx */
        *{box-sizing:border-box;margin:0;padding:0}
        .hp{font-family:'Inter',-apple-system,sans-serif;background:#fff;color:#000;overflow-x:hidden}

        /* TOPBAR */
        .hp-top{background:#000;color:#fff;display:flex;align-items:center;justify-content:center;padding:10px 20px;font-size:13px}
        .hp-top-inner{display:flex;align-items:center;gap:16px}
        .hp-top button{background:none;border:none;color:#fff;cursor:pointer;font-size:16px;opacity:0.7}
        .hp-top button:hover{opacity:1}

        /* HEADER */
        .hp-header{position:sticky;top:0;z-index:200;background:#fff;border-bottom:1px solid #ebebeb;display:flex;align-items:center;justify-content:center;height:64px;padding:0}
        .hp-header-left{display:flex;align-items:center}
        .hp-logo{font-size:15px;font-weight:700;letter-spacing:8px;color:#000;text-decoration:none;white-space:nowrap;flex-shrink:0;position:absolute;left:40px;top:50%;transform:translateY(-50%)}
        .hp-nav{display:flex;align-items:center;gap:0}
        .hp-nav-item{position:relative}
        .hp-nav-item>a{font-size:11px;color:#111;text-decoration:none;font-weight:400;letter-spacing:1.2px;text-transform:uppercase;padding:0 18px;height:64px;display:flex;align-items:center;transition:color 0.2s}
        .hp-nav-item>a:hover{color:#999}
        .hp-nav-item:hover .hp-mega{opacity:1;pointer-events:all;transform:translateY(0)}
        .hp-mega{opacity:0;pointer-events:none;transform:translateY(-4px);transition:all 0.25s ease;position:fixed;top:64px;left:0;right:0;background:#fff;border-top:1px solid #ebebeb;box-shadow:0 20px 60px rgba(0,0,0,0.08);padding:48px 80px;display:flex;gap:64px;z-index:300}
        .hp-mega-col h6{font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#bbb;margin-bottom:20px}
        .hp-mega-col a{display:block;font-size:13px;color:#222;text-decoration:none;padding:7px 0;font-weight:300;letter-spacing:0.3px;transition:all 0.2s;white-space:nowrap;border-bottom:1px solid #f5f5f5}
        .hp-mega-col a:hover{color:#000;padding-left:6px}
        .hp-mega-col-img{min-width:180px}
        .hp-mega-col-img img{width:180px;height:220px;object-fit:cover}
        .hp-mega-col-img span{display:block;font-size:11px;color:#999;margin-top:10px;letter-spacing:0.5px}
        .hp-icons{display:flex;align-items:center;gap:2px}
        .hp-icons a,.hp-icons button{background:none;border:none;cursor:pointer;color:#000;text-decoration:none;padding:10px;display:flex;align-items:center;justify-content:center;transition:opacity 0.2s}
        .hp-icons a:hover,.hp-icons button:hover{opacity:0.5}
        .hp-icon{width:19px;height:19px}

        /* HERO */
        .hp-hero{position:relative;height:560px;overflow:hidden;margin-top:96px;}
        .hide-on-mobile{display:block;}
        .show-on-mobile{display:none;}
        @media(max-width:768px){
          .hide-on-mobile{display:none!important;}
          .show-on-mobile{display:block!important;}
        }
        .hp-hero-slide{position:absolute;inset:0;contain:layout;opacity:0;transition:opacity 1s ease}
        .hp-hero-slide.active{opacity:1}
        .hp-hero-slide img{width:100%;height:100%;object-fit:cover}
        .hp-hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.2) 50%,transparent 100%)}
        .hp-hero-content{position:absolute;top:50%;left:56px;transform:translateY(-50%);max-width:460px;z-index:10}
        .hp-hero-tag{font-size:12px;color:#fff;margin-bottom:12px;font-weight:500}
        .hp-hero h1{font-size:48px;font-weight:600;color:#fff;line-height:1.1;margin-bottom:12px;white-space:pre-line}
        .hp-hero-sub{font-size:15px;color:rgba(255,255,255,0.85);margin-bottom:28px}
        .hp-hero-btns{display:flex;gap:12px;flex-wrap:wrap}
        .hp-btn{padding:14px 24px;font-size:12px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all 0.2s;border:none;cursor:pointer}
        .hp-btn-white{background:#fff;color:#000}
        .hp-btn-white:hover{background:#f0f0f0}
        .hp-btn-black{background:#000;color:#fff}
        .hp-btn-black:hover{background:#222}
        .hp-hero-dots{position:absolute;bottom:32px;left:56px;display:flex;gap:10px;z-index:10}
        .hp-hero-dot{width:32px;height:3px;background:rgba(255,255,255,0.4);cursor:pointer;transition:all 0.3s}
        .hp-hero-dot.active{background:#fff;width:48px}
        .hp-hero-arrows{position:absolute;bottom:32px;right:56px;display:flex;gap:8px;z-index:10}
        .hp-hero-arrow{width:44px;height:44px;border:1px solid rgba(255,255,255,0.4);background:transparent;color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .hp-hero-arrow:hover{background:rgba(255,255,255,0.1);border-color:#fff}

        /* 2 COLUMN */
        .hp-2col{display:grid;grid-template-columns:1fr 1fr;gap:4px}
        .hp-2col-card{position:relative;aspect-ratio:1.1;overflow:hidden;display:block;text-decoration:none}
        .hp-2col-card img{width:100%;height:100%;object-fit:cover;transition:transform 0.7s ease}
        .hp-2col-card:hover img{transform:scale(1.04)}
        .hp-2col-info{position:absolute;bottom:24px;left:24px;right:24px;background:#fff;display:flex;align-items:stretch;border:3px solid #000;box-shadow:0 8px 32px rgba(0,0,0,0.25)}
        .hp-2col-info-text{flex:1;padding:22px 28px;background:#fff}
        .hp-2col-info-text span{font-size:13px;color:#555;display:block;margin-bottom:6px}
        .hp-2col-info-text p{font-size:16px;font-weight:700;color:#000}
        .hp-2col-info-arrow{width:70px;background:#000;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px}
        .hp-2col-card:hover .hp-2col-info-arrow{background:#333}

        /* SECTION */
        .hp-section{padding:48px 48px 56px;background:#f4f4f4}
        .hp-section-inner{max-width:1400px;margin:0 auto}
        .hp-section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
        .hp-section-head h2{font-size:20px;font-weight:500;letter-spacing:0.3px}
        .hp-section-arrows{display:flex;gap:8px}
        .hp-section-arrows button{width:38px;height:38px;border:1px solid #bbb;background:#fff;cursor:pointer;font-size:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.2s}
        .hp-section-arrows button:hover{border-color:#000;background:#000;color:#fff}

        /* PRODUCT SLIDER - 4 cards */
        .hp-products{display:flex;gap:20px;overflow-x:auto;scroll-behavior:smooth;padding:4px 0 16px;scrollbar-width:none;-ms-overflow-style:none}
        .hp-products::-webkit-scrollbar{display:none}
        .hp-product{width:360px;min-width:360px;flex-shrink:0;text-decoration:none;color:inherit}
        .hp-product-img{width:360px;height:360px;background:#e8e8e8;margin-bottom:14px;overflow:hidden}
        .hp-product-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.6s ease}
        .hp-product:hover .hp-product-img img{transform:scale(1.05)}
        .hp-product h4{font-size:13px;font-weight:400;line-height:1.45;margin-bottom:5px;color:#111}
        .hp-product-rating{display:flex;align-items:center;gap:4px;margin-bottom:5px}
        .hp-product-stars{color:#111;font-size:12px}
        .hp-product-count{font-size:11px;color:#999}
        .hp-product p{font-size:14px;font-weight:600;color:#000}

        /* EDITORIAL PRODUCTS - Full Bleed Luxury Magazine Style */
        .hp-editorial-products{padding:60px 48px;background:#f8f8f8}
        .hp-editorial-products-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;padding:0 4px}
        .hp-editorial-products-head h2{font-size:28px;font-weight:300;letter-spacing:-0.5px;color:#111;font-style:italic}
        .hp-editorial-products-arrows{display:flex;gap:12px}
        .hp-editorial-products-arrows button{width:44px;height:44px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.25s ease;color:#111}
        .hp-editorial-products-arrows button:hover{border-color:#000;background:#000;color:#fff;transform:translateY(-2px)}
        .hp-editorial-products-scroll{display:flex;gap:0;overflow-x:auto;scroll-behavior:smooth;scrollbar-width:none;-ms-overflow-style:none}
        .hp-editorial-products-scroll::-webkit-scrollbar{display:none}
        .hp-editorial-card{width:320px;min-width:320px;height:480px;position:relative;text-decoration:none;color:inherit;display:block;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);transition:all 0.35s ease;margin-right:1px}
        .hp-editorial-card:first-child{margin-left:1px}
        .hp-editorial-card:hover{transform:scale(1.02);box-shadow:0 8px 32px rgba(0,0,0,0.15);z-index:2}
        .hp-editorial-card-img{width:100%;height:100%;position:relative}
        .hp-editorial-card-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease}
        .hp-editorial-card:hover .hp-editorial-card-img img{transform:scale(1.06)}
        .hp-editorial-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.25) 40%,transparent 65%);transition:background 0.3s ease}
        .hp-editorial-card:hover .hp-editorial-card-overlay{background:linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.35) 40%,transparent 60%)}
        .hp-editorial-card-content{position:absolute;bottom:0;left:0;right:0;padding:28px 24px;z-index:1;transform:translateY(0);transition:transform 0.3s ease}
        .hp-editorial-card:hover .hp-editorial-card-content{transform:translateY(-4px)}
        .hp-editorial-card-content h4{font-size:15px;font-weight:400;color:#fff;line-height:1.4;margin-bottom:8px;letter-spacing:-0.2px;max-width:280px}
        .hp-editorial-card-meta{display:flex;justify-content:space-between;align-items:center}
        .hp-editorial-card-meta span{font-size:16px;font-weight:500;color:#fff;letter-spacing:-0.3px}
        .hp-editorial-arrow{font-size:20px;color:#fff;opacity:0.8;transition:opacity 0.25s ease,transform 0.25s ease}
        .hp-editorial-card:hover .hp-editorial-arrow{opacity:1;transform:translateX(4px)}

        /* PREMIUM EDITORIAL - Luxury Watch Collection */
        .hp-premium-editorial{display:flex;height:700px;overflow:hidden;background:#faf9f7}
        .hp-premium-left{width:45%;min-width:480px;position:relative;display:flex;flex-direction:column}
        .hp-premium-media{flex:1;position:relative;overflow:hidden}
        .hp-premium-media video,.hp-premium-media img{width:100%;height:100%;object-fit:cover}
        .hp-premium-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(15,30,50,0.7) 0%,rgba(20,60,90,0.5) 50%,rgba(10,40,70,0.6) 100%)}
        .hp-premium-content{position:absolute;bottom:0;left:0;right:0;padding:48px 56px;z-index:1;color:#fff}
        .hp-premium-top-line{width:48px;height:1px;background:rgba(255,255,255,0.6);margin-bottom:20px}
        .hp-premium-tag{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:16px;color:rgba(255,255,255,0.85);font-weight:300}
        .hp-premium-content h2{font-size:42px;font-weight:300;line-height:1.15;margin-bottom:18px;letter-spacing:-1px;font-family:'Times New Roman',serif}
        .hp-premium-content h2 .italic{font-style:italic;font-weight:400;color:#7fb3d3}
        .hp-premium-desc{font-size:15px;line-height:1.65;color:rgba(255,255,255,0.85);margin-bottom:32px;max-width:380px;font-weight:300}
        .hp-premium-cta{display:flex;align-items:center;gap:24px}
        .hp-premium-btn{display:inline-flex;align-items:center;gap:10px;padding:16px 32px;background:#fff;color:#1a1a1a;text-decoration:none;font-size:13px;font-weight:500;letter-spacing:0.5px;transition:all 0.3s ease;border:none;cursor:pointer}
        .hp-premium-btn:hover{background:#1a1a1a;color:#fff;transform:translateY(-2px)}
        .hp-premium-count{font-size:12px;letter-spacing:1px;color:rgba(255,255,255,0.7);text-transform:uppercase}
        .hp-premium-right{flex:1;display:flex;flex-direction:column;min-width:0}
        .hp-premium-header{padding:32px 40px 24px;border-bottom:1px solid rgba(0,0,0,0.06);display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
        .hp-premium-header-title{display:flex;align-items:center;gap:16px}
        .hp-premium-line{width:32px;height:1px;background:#1a1a1a}
        .hp-premium-header h3{font-size:14px;font-weight:400;letter-spacing:1.5px;text-transform:uppercase;color:#1a1a1a}
        .hp-premium-arrows{display:flex;gap:12px}
        .hp-premium-arrows button{width:40px;height:40px;border:1px solid rgba(0,0,0,0.15);background:transparent;cursor:pointer;transition:all 0.3s ease;border-radius:0;display:flex;align-items:center;justify-content:center;color:#1a1a1a}
        .hp-premium-arrows button:hover{border-color:#1a1a1a;background:#1a1a1a;color:#fff}
        .hp-premium-scroll{display:flex;gap:0;overflow-x:auto;flex:1;scrollbar-width:none;-ms-overflow-style:none;padding-top:8px}
        .hp-premium-scroll::-webkit-scrollbar{display:none}
        .hp-premium-card{width:340px;min-width:340px;height:100%;flex-shrink:0;text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:32px 32px 28px;border-right:1px solid rgba(0,0,0,0.04);transition:all 0.35s ease;background:transparent}
        .hp-premium-card:hover{background:rgba(255,255,255,0.6)}
        .hp-premium-card-spacer{min-width:32px;flex-shrink:0}
        .hp-premium-card-img{width:100%;height:320px;position:relative;margin-bottom:20px;overflow:hidden;background:rgba(0,0,0,0.02)}
        .hp-premium-card-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease}
        .hp-premium-card:hover .hp-premium-card-img img{transform:scale(1.05)}
        .hp-premium-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.2) 0%,transparent 50%);opacity:0;transition:opacity 0.3s ease}
        .hp-premium-card:hover .hp-premium-card-overlay{opacity:1}
        .hp-premium-badge{position:absolute;top:16px;left:16px;padding:8px 14px;background:rgba(255,255,255,0.95);font-size:10px;letter-spacing:1px;text-transform:uppercase;font-weight:500;color:#1a1a1a}
        .hp-premium-card-action{position:absolute;bottom:20px;left:50%;transform:translateX(-50%) translateY(10px);padding:12px 24px;background:#1a1a1a;color:#fff;font-size:11px;letter-spacing:0.5px;opacity:0;transition:all 0.3s ease;white-space:nowrap}
        .hp-premium-card:hover .hp-premium-card-action{opacity:1;transform:translateX(-50%) translateY(0)}
        .hp-premium-card-info{flex:1;display:flex;flex-direction:column}
        .hp-premium-card-top{margin-bottom:auto}
        .hp-premium-card h4{font-size:15px;font-weight:400;line-height:1.4;color:#1a1a1a;margin-bottom:6px;font-family:'Times New Roman',serif}
        .hp-premium-ref{font-size:11px;color:rgba(0,0,0,0.5);letter-spacing:0.5px}
        .hp-premium-card-bottom{padding-top:16px;border-top:1px solid rgba(0,0,0,0.06)}
        .hp-premium-price{font-size:18px;font-weight:500;color:#1a1a1a;margin-bottom:8px;letter-spacing:-0.5px}
        .hp-premium-specs{display:flex;align-items:center;gap:8px;font-size:11px;color:rgba(0,0,0,0.5)}
        .hp-premium-specs span:first-child,.hp-premium-specs span:last-child{font-weight:400}
        .hp-premium-specs span:nth-child(2){color:rgba(0,0,0,0.2)}

        /* BLUE LINK */
        .hp-blue-link{text-align:center;padding:20px}
        .hp-blue-link a{font-size:14px;color:#000;text-decoration:none;display:inline-flex;align-items:center;gap:10px;font-weight:500}
        .hp-blue-dot{width:14px;height:14px;background:#5DADE2;border-radius:50%}

        /* HIGHLIGHTS */
        .hp-highlights{display:grid;grid-template-columns:1fr 1fr;min-height:420px}
        .hp-highlights-list{padding:48px;display:flex;flex-direction:column;justify-content:center}
        .hp-highlights-list span{font-size:10px;font-weight:400;text-transform:uppercase;letter-spacing:2.5px;color:#aaa;margin-bottom:36px;display:block}
        .hp-highlights-list a{font-size:32px;font-weight:300;color:#111;text-decoration:none;padding:11px 0;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;letter-spacing:-0.3px;font-family:Georgia,serif;transition:all 0.25s}
        .hp-highlights-list a:first-of-type{border-top:1px solid #f0f0f0}
        .hp-highlights-list a::after{content:'→';font-size:16px;font-family:sans-serif;font-weight:300;color:#bbb;transition:all 0.25s;opacity:0;transform:translateX(-6px)}
        .hp-highlights-list a:hover{color:#000;padding-left:6px}
        .hp-highlights-list a:hover::after{opacity:1;transform:translateX(0)}
        .hp-highlights-img{background:#FFE566;display:flex;align-items:center;justify-content:center;padding:40px}
        .hp-highlights-img img{max-width:85%;max-height:85%;object-fit:contain}

        /* SPOTLIGHT */
        .hp-spotlight{position:relative;min-height:480px;overflow:hidden}
        .hp-spotlight>img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
        .hp-spotlight-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0.35) 0%,transparent 60%)}
        .hp-spotlight-content{position:absolute;bottom:28px;left:28px}
        .hp-spotlight-tag{font-size:10px;color:rgba(255,255,255,0.8);margin-bottom:5px;text-transform:uppercase;letter-spacing:1.5px}
        .hp-spotlight h3{font-size:20px;font-weight:500;color:#fff}
        .hp-spotlight-card{position:absolute;top:50%;right:48px;transform:translateY(-50%);background:#fff;padding:20px;width:250px;box-shadow:0 8px 32px rgba(0,0,0,0.15)}
        .hp-spotlight-card img{width:100%;aspect-ratio:1;object-fit:contain;margin-bottom:14px;background:#f5f5f0;display:block;margin-left:auto;margin-right:auto;}
        .hp-spotlight-card h4{font-size:13px;font-weight:500;margin-bottom:5px;line-height:1.4}
        .hp-spotlight-card .specs{font-size:11px;color:#666;margin-bottom:6px}
        .hp-spotlight-card p{font-size:14px;font-weight:600}
        .hp-spotlight-controls{position:absolute;bottom:28px;right:28px;display:flex;gap:10px}
        .hp-spotlight-controls button{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);border:none;color:#fff;cursor:pointer;font-size:13px}

        /* QUOTE */
        .hp-quote{padding:100px 48px;text-align:center}
        .hp-quote h2{font-size:42px;font-weight:400;line-height:1.25;max-width:550px;margin:0 auto}

        /* BANNER */
        .hp-banner-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,0.95) 0%,rgba(255,255,255,0.7) 30%,transparent 55%)}
        .hp-banner-content{position:absolute;top:50%;left:48px;transform:translateY(-50%);max-width:300px}
        .hp-banner h3{font-size:28px;font-weight:600;margin-bottom:6px;line-height:1.2}
        .hp-banner .price{font-size:14px;margin-bottom:20px}
        .hp-stack-wrap{position:relative}
        .hp-stack-quote{padding:100px 48px;text-align:center}
        .hp-stack-quote h2{font-size:42px;font-weight:400;line-height:1.25;max-width:550px;margin:0 auto}
        .hp-stack-banners{position:absolute;top:0;left:0;right:0;height:100vh;pointer-events:none}
        .hp-stack-banners.active{pointer-events:all}
        .hp-stack-banner{position:absolute;inset:0;overflow:hidden;transform:translateY(100%);transition:transform 0.8s cubic-bezier(0.77,0,0.175,1);will-change:transform}
        .hp-stack-banner img{width:100%;height:100%;object-fit:cover;display:block}
        .hp-stack-banner video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
        .hp-stack-banner.visible{transform:translateY(0)}

        /* MORE */
        .hp-more{padding:50px 48px;position:relative}
        .hp-more-head h2{font-size:18px;font-weight:600}
        .hp-more-head p{font-size:13px;color:#666;margin-top:5px}
        .hp-more-arrows{position:absolute;top:50px;right:48px;display:flex;gap:8px}
        .hp-more-arrows button{width:36px;height:36px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:14px;border-radius:50%}
        .hp-more-arrows button:hover{border-color:#000;background:#000;color:#fff}
        .hp-more-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:28px}
        .hp-more-item{text-decoration:none;color:inherit}
        .hp-more-item img{width:100%;aspect-ratio:4/5;object-fit:cover;margin-bottom:10px}
        .hp-more-item:hover img{transform:scale(1.02)}
        .hp-more-item span{font-size:14px;font-weight:500}

        /* GOAT */
        .hp-goat{position:relative;height:160px;margin:20px 48px;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .hp-goat img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
        .hp-goat-overlay{position:absolute;inset:0;background:rgba(0,30,60,0.75)}
        .hp-goat-content{position:relative;z-index:2;text-align:center}
        .hp-goat h3{font-size:22px;font-weight:700;color:#fff;letter-spacing:2px;margin-bottom:16px}

        /* FINDER */
        .hp-finder{display:flex;align-items:center;justify-content:space-between;padding:20px 48px;background:#f5f5f5;margin:20px 48px}
        .hp-finder-left{display:flex;align-items:center;gap:16px}
        .hp-finder-icon{font-size:32px}
        .hp-finder h4{font-size:14px;font-weight:600;margin-bottom:3px}
        .hp-finder p{font-size:12px;color:#666}

        /* FOOTER */

        /* RESPONSIVE */
        @media(max-width:1200px){
          .hp-editorial-products{padding:48px 24px}
          .hp-editorial-products-head h2{font-size:22px}
          .hp-editorial-card{width:280px;min-width:280px;height:420px}
          .hp-editorial-card-content h4{font-size:13px}
          .hp-product{min-width:calc(25% - 15px)}
          .hp-premium-editorial{height:620px}
          .hp-premium-left{min-width:420px}
          .hp-premium-content{padding:40px 48px}
          .hp-premium-content h2{font-size:36px}
          .hp-premium-card{width:300px;min-width:300px;padding:24px}
          .hp-premium-card-img{height:280px}
        }
        @media(max-width:900px){
          .hp-nav{display:none}
          .hp-2col,.hp-highlights{grid-template-columns:1fr}
          .hp-editorial{flex-direction:column;height:auto;margin-top:16px}
          .hp-editorial-main{width:100%!important;min-width:100%!important;height:220px;opacity:1!important;border-radius:12px;overflow:hidden;margin-bottom:16px;}
          .hp-editorial-main-content{padding:20px!important;bottom:0!important;left:0!important;right:0!important;}
          .hp-editorial-main-content h3{font-size:16px!important;}
          .hp-editorial-right{min-height:400px}
          .hp-product{min-width:calc(33.333% - 14px)}
          .hp-spotlight{min-height:auto;display:flex;flex-direction:column}
          .hp-spotlight-card{position:relative;right:auto;top:auto;transform:none;margin:16px auto;width:calc(100% - 32px);max-width:320px;z-index:2}
          .hp-spotlight-content{position:relative;bottom:auto;left:auto;padding:20px 20px 0;z-index:2}
          .hp-spotlight h3{color:#000;font-size:18px}
          .hp-spotlight-tag{color:#999}
          .hp-spotlight-overlay{display:none}
          .hp-spotlight>video{position:relative!important;height:280px;width:100%}
          .hp-spotlight-controls{display:none}
          .hp-more-grid{grid-template-columns:repeat(2,1fr)}
          .hp-finder{flex-direction:column;gap:16px;text-align:center}
          .hp-premium-editorial{flex-direction:column;height:auto}
          .hp-premium-left{width:100%;min-width:0;height:280px}
          .hp-premium-media{height:100%}
          .hp-premium-content{padding:24px 20px}
          .hp-premium-content h2{font-size:28px}
          .hp-premium-desc{font-size:13px;max-width:100%}
          .hp-premium-cta{flex-direction:column;align-items:flex-start;gap:16px}
          .hp-premium-right{height:auto;min-height:380px}
          .hp-premium-header{padding:20px 24px}
          .hp-premium-card{padding:20px 16px;border:none;margin-right:16px;width:240px;min-width:240px}
          .hp-premium-card-img{height:220px}
        }
        @media(max-width:600px){
          .hp-hero{height:85vw;min-height:300px;margin-top:88px;}
          .hp-hero h1{font-size:24px}
          .hp-hero-content{left:16px;right:16px;max-width:100%}
          .hp-hero-tag{font-size:10px}
          .hp-hero-sub{font-size:12px;margin-bottom:14px}
          .hp-hero-btns{gap:8px;flex-direction:column;align-items:flex-start}
          .hp-btn{padding:9px 14px;font-size:10px;width:auto;display:inline-flex;letter-spacing:0.5px}
          .hp-hero-btns .hp-btn:nth-child(2){display:none}
          .hp-hero-arrows{bottom:12px;right:12px}
          .hp-hero-dots{bottom:12px;left:12px}
          .hp-2col{grid-template-columns:1fr}
          .hp-2col-card{aspect-ratio:1.2}
          .hp-2col-info{bottom:12px;left:12px;right:12px}
          .hp-2col-info-text{padding:14px 16px}
          .hp-2col-info-text p{font-size:14px}
          .hp-2col-info-arrow{width:50px;font-size:18px}
          .hp-section{padding:24px 16px 32px;margin-bottom:8px}
          .hp-products{display:grid!important;grid-template-columns:1fr 1fr;gap:12px;overflow-x:visible!important;padding:4px 0 8px}
          .hp-product{width:100%!important;min-width:0!important}
          .hp-product-img{width:100%!important;height:auto!important;aspect-ratio:1}
          .hp-section-head h2{font-size:16px}
          .hp-product{min-width:calc(50% - 8px);width:calc(50% - 8px)}
          .hp-product-img{width:100%;height:auto;aspect-ratio:1}
          .hp-product h4{font-size:11px}
          .hp-product p{font-size:12px}
          .hp-editorial-products{padding:32px 16px}
          .hp-editorial-products-head h2{font-size:18px;margin-bottom:20px}
          .hp-editorial-products-arrows{display:none}
          .hp-editorial-products-scroll{display:grid;grid-template-columns:1fr 1fr;gap:12px;overflow-x:visible}
          .hp-editorial-card{width:100%!important;min-width:0!important;height:280px;margin:0!important}
          .hp-editorial-card-content{padding:18px 14px}
          .hp-editorial-card-content h4{font-size:12px;max-width:100%}
          .hp-editorial-card-meta span{font-size:13px}
          .hp-editorial-arrow{font-size:16px}
          .hp-premium-editorial{height:auto}
          .hp-premium-left{height:240px}
          .hp-premium-content{padding:20px 16px}
          .hp-premium-top-line{width:32px;margin-bottom:12px}
          .hp-premium-tag{font-size:9px;letter-spacing:1.5px;margin-bottom:10px}
          .hp-premium-content h2{font-size:22px}
          .hp-premium-desc{font-size:12px;margin-bottom:20px}
          .hp-premium-btn{padding:12px 24px;font-size:12px}
          .hp-premium-cta{gap:12px}
          .hp-premium-right{min-height:320px}
          .hp-premium-header{padding:16px 20px}
          .hp-premium-arrows{display:none}
          .hp-premium-scroll{display:grid;grid-template-columns:1fr 1fr;gap:12px;overflow-x:visible;padding-top:0}
          .hp-premium-card{width:100%!important;min-width:0!important;padding:16px 12px;border:none;margin:0!important}
          .hp-premium-card-spacer{display:none}
          .hp-premium-card-img{height:180px;margin-bottom:12px}
          .hp-premium-badge{padding:6px 10px;font-size:9px;top:12px;left:12px}
          .hp-premium-card h4{font-size:13px;margin-bottom:4px}
          .hp-premium-ref{font-size:10px}
          .hp-premium-price{font-size:15px;margin-bottom:6px}
          .hp-premium-specs{font-size:10px}
          .hp-premium-card-action{display:none}
          .hp-highlights{grid-template-columns:1fr}
          .hp-highlights-list{padding:28px 16px}
          .hp-highlights-list a{font-size:20px;padding:9px 0}
          .hp-highlights-img{padding:20px;min-height:240px}
          .hp-spotlight{min-height:auto;display:flex;flex-direction:column}
          .hp-spotlight>video{position:relative!important;height:240px;width:100%}
          .hp-spotlight{display:flex!important;flex-direction:column!important;min-height:auto!important;}
          .hp-spotlight-card{position:relative!important;top:auto!important;right:auto!important;transform:none!important;width:calc(100% - 32px)!important;margin:16px auto!important;box-shadow:0 4px 16px rgba(0,0,0,0.1)!important;text-align:center!important;}
          .hp-spotlight-content{position:relative!important;bottom:auto!important;left:auto!important;padding:16px!important;background:#111;}
          .hp-spotlight-overlay{display:none!important;}
          .hp-spotlight-controls{position:relative!important;bottom:auto!important;right:auto!important;padding:0 16px 16px;background:#111;}
          .hp-spotlight-controls button{background:rgba(255,255,255,0.15)!important;}
          .hp-spotlight-overlay{display:none}
          .hp-spotlight-content{position:relative;bottom:auto;left:auto;padding:16px 16px 0}
          .hp-spotlight h3{color:#000;font-size:16px}
          .hp-spotlight-tag{color:#999}
          .hp-spotlight-card{position:relative;right:auto;top:auto;transform:none;margin:12px auto;width:calc(100% - 32px);box-shadow:0 4px 16px rgba(0,0,0,0.08)}
          .hp-spotlight-card img{width:70%!important;margin:0 auto 14px!important;display:block!important;}
          .hp-spotlight-controls{display:none}
          .hp-banner{height:260px;margin:10px 12px}
          .hp-banner h3{font-size:18px}
          .hp-banner-content{left:16px;max-width:200px}
          .hp-banner .price{font-size:13px;margin-bottom:14px}
          .hp-goat{height:110px;margin:10px 12px}
          .hp-goat h3{font-size:13px;letter-spacing:1px;margin-bottom:12px}
          .hp-more{padding:24px 16px}
          .hp-more-grid{grid-template-columns:repeat(2,1fr);gap:10px}
          .hp-more-item span{font-size:12px}
          .hp-finder{flex-direction:column;gap:12px;text-align:center;padding:16px;margin:10px 12px}
          .hp-finder-left{flex-direction:column;gap:6px}
          .hp-finder h4{font-size:13px}
          .hp-finder p{font-size:11px}
          .hp-top{font-size:10px;padding:7px 12px}
        }
      `}</style>



      <section className="hp-hero">
        {heroSlides.map((s, i) => (<div key={i} className={`hp-hero-slide ${i === currentSlide ? 'active' : ''}`}><img src={s.image} alt={s.title} /><div className="hp-hero-overlay" /></div>))}
        <div className="hp-hero-content">
          <p className="hp-hero-tag">{heroSlides[currentSlide].tag}</p>
          <h1>{heroSlides[currentSlide].title}</h1>
          <p className="hp-hero-sub">{heroSlides[currentSlide].subtitle}</p>
          <div className="hp-hero-btns"><Link to="/collections/under-100" className="hp-btn hp-btn-white">Shop Now →</Link></div>
        </div>
        <div className="hp-hero-dots">{heroSlides.map((_, i) => (<div key={i} className={`hp-hero-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} />))}</div>
        <div className="hp-hero-arrows"><button className="hp-hero-arrow" onClick={() => setCurrentSlide((currentSlide - 1 + 3) % 3)}>←</button><button className="hp-hero-arrow" onClick={() => setCurrentSlide((currentSlide + 1) % 3)}>→</button></div>
      </section>

      <section className="hp-2col">
        <Link to="/collections/mens-watches" className="hp-2col-card"><img src={img.quad5} alt="Men's Best Sellers" /><div className="hp-2col-info"><div className="hp-2col-info-text"><span>Men's Best Sellers</span><p>Shop Now</p></div><div className="hp-2col-info-arrow">→</div></div></Link>
        <Link to="/collections/womens-watches" className="hp-2col-card"><img src={img.quad6} alt="Women's Best Sellers" /><div className="hp-2col-info"><div className="hp-2col-info-text"><span>Women's Best Sellers</span><p>Shop Now</p></div><div className="hp-2col-info-arrow">→</div></div></Link>
      </section>

      <section className="hp-editorial-products">
        <div className="hp-editorial-products-head">
          <h2>Our Most-Loved Styles</h2>
          <div className="hp-editorial-products-arrows"><button onClick={scrollLeft}>&#8592;</button><button onClick={scrollRight}>&#8594;</button></div>
        </div>
        <div className="hp-editorial-products-scroll" ref={sliderRef}>
          {products.slice(0, 12).map((p, i) => (
            <Link key={p.id} to={`/products/${p.handle}`} className="hp-editorial-card">
              <div className="hp-editorial-card-img">
                <img src={getProductImage(p, i)} alt={p.title} />
                <div className="hp-editorial-card-overlay" />
              </div>
              <div className="hp-editorial-card-content">
                <h4>{p.title}</h4>
                <div className="hp-editorial-card-meta">
                  <span>{p.priceRange?.minVariantPrice ? new Intl.NumberFormat('en-US', {style:'currency', currency: p.priceRange.minVariantPrice.currencyCode}).format(p.priceRange.minVariantPrice.amount) : '$199.00'}</span>
                  <span className="hp-editorial-arrow">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <EditorialSection products={products} getProductImage={getProductImage} bulovaProducts={bulovaProducts} />

      <div className="hp-blue-link"><Link to="/collections/blue"><span className="hp-blue-dot"></span>Blue → Watches</Link></div>

      <section className="hp-highlights">
        <div className="hp-highlights-list"><span>Our Brands</span><Link to="/collections/north-edge-collection">North Edge</Link><Link to="/collections/fossil-watch">Fossil</Link><Link to="/collections/naviforce-collection">Naviforce</Link><Link to="/collections/pagani-collection">Pagani</Link><Link to="/collections/berny-collection">Berny</Link></div>
        <div className="hp-highlights-img"><img src={img.quad11} alt="Featured" /></div>
      </section>

      <section className="hp-spotlight">
        <div className="hide-on-mobile" style={{position:'absolute',inset:0}}><AutoPlayVideo src="https://cdn.shopify.com/videos/c/o/v/b63d7cc54c244acfad0aa19665dde9f7.mp4" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}} /></div>
        <div className="show-on-mobile" style={{position:'relative',width:'100%',height:'240px'}}><MobileFade images={['https://cdn.shopify.com/s/files/1/0778/2921/0327/files/1_d6e9dd92-29ed-4ea1-bd70-3954e2e35b9b.jpg?v=1774215573','https://cdn.shopify.com/s/files/1/0778/2921/0327/files/2_d0d75584-e7bd-4547-9e9c-59038db9146e.jpg?v=1774215589']} style={{width:'100%',height:'100%'}} /></div>
        <div className="hp-spotlight-overlay" />
        <div className="hp-spotlight-content"><p className="hp-spotlight-tag">Watchmakers Spotlight</p><h3>Marlin® Chronograph Tachymeter</h3></div>
        <Link to={spotlightProduct ? `/products/${spotlightProduct.handle}` : '/collections'} className="hp-spotlight-card" style={{textDecoration:'none',color:'inherit',display:'block'}}>
          <img className="hide-on-mobile" src={spotlightProduct?.featuredImage?.url || img.quad10} alt={spotlightProduct?.title || "Watch"} />

          <h4>{spotlightProduct?.title || "Marlin® Chronograph Tachymeter 40mm"}</h4>
          <p className="specs">{spotlightProduct?.variants?.nodes?.[0]?.selectedOptions?.map(o => o.value).join(" | ") || "40 mm | 3 Colors"}</p>
          <p>{spotlightProduct?.priceRange?.minVariantPrice ? new Intl.NumberFormat('en-US', {style:'currency', currency: spotlightProduct.priceRange.minVariantPrice.currencyCode}).format(spotlightProduct.priceRange.minVariantPrice.amount) : '$209.00'}</p>
        </Link>
        <div className="hp-spotlight-controls"><button>▶</button><button>🔊</button></div>
      </section>

      <ReviewsStrip />

      <FadingHeadlines headlines={[
        "Every watch has a soul and a story to be told.",
        "Crafted for those who understand that time is the only true luxury.",
        "From the first light of dawn to the last hour of night — wear it all."
      ]} />
      <BeforeAfterSlider
        leftImg="https://cdn.shopify.com/s/files/1/0778/2921/0327/files/dia.jpg?v=1772493338"
        rightImg="https://cdn.shopify.com/s/files/1/0778/2921/0327/files/noite.jpg?v=1772493357"
        leftLabel="Day"
        rightLabel="Night"
      />

      <section className="hp-more">
        <div className="hp-more-head"><h2>More to Love</h2><p>You don't want to miss these</p></div>
        <div className="hp-more-arrows"><button>←</button><button>→</button></div>
        <div className="hp-more-grid">
          <Link to="/collections/sport-watches" className="hp-more-item"><img src={img.vertical1} alt="Sport" /><span>Sport</span></Link>
          <Link to="/collections/vintage" className="hp-more-item"><img src={img.vertical2} alt="Deepwater" /><span>Deepwater</span></Link>
          <Link to="/collections/automatic-watches" className="hp-more-item"><img src={img.vertical3} alt="Automatic" /><span>Automatic</span></Link>
          <Link to="/collections/classic" className="hp-more-item"><img src={img.vertical4} alt="Quartz" /><span>Quartz</span></Link>
        </div>
      </section>

      <section className="hp-goat"><img src={img.bannerSlim} alt="GOAT" /><div className="hp-goat-overlay" /><div className="hp-goat-content"><h3>THE GREATEST OF ALL TIMEKEEPERS</h3><Link to="/collections/under-100" className="hp-btn hp-btn-white">Shop Now →</Link></div></section>

      <section className="hp-finder"><div className="hp-finder-left"><span className="hp-finder-icon">⌚</span><div><h4>Watch Finder</h4><p>Let our watch finder quiz lead you to the perfect watch</p></div></div><button onClick={()=>setQuizOpen(true)} className="hp-btn hp-btn-black">Take The Quiz →</button></section>
      {quizOpen && <WatchQuiz onClose={()=>setQuizOpen(false)} />}


    </div>
  );
}

const COLLECTIONS_QUERY = `#graphql
  query HomepageCollections($country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    collections(first: 6, sortKey: UPDATED_AT, reverse: true) { nodes { id title handle image { url } } }
  }
`;

const PRODUCTS_QUERY = `#graphql
  query HomepageProducts($country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: UPDATED_AT, reverse: true) { nodes { id title handle featuredImage { url } priceRange { minVariantPrice { amount currencyCode } } } }
  }
`;

const BULOVA_QUERY = `#graphql
  query BulovaCollection($country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    collection(handle: "bulova") {
      title
      products(first: 8) {
        nodes {
          id title handle
          featuredImage { url altText }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;

const SPOTLIGHT_QUERY = `#graphql
  query SpotlightProduct($country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    product(id: "gid://shopify/Product/9121915896023") {
      id title handle
      featuredImage { url altText }
      priceRange { minVariantPrice { amount currencyCode } }
      variants(first: 1) {
        nodes {
          selectedOptions { name value }
        }
      }
    }
  }
`;
