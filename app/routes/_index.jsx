import { useState } from 'react'

const images = {
  hero: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&q=80',
  watch1: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
  watch2: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80',
  watch3: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  watch4: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
  watch5: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
  watch6: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
  watch7: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80',
  watch8: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80',
  watchHand: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80',
  watchGold: 'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=800&q=80',
  watchBlack: 'https://images.unsplash.com/photo-1544117519-31a4b7193333?w=800&q=80',
}

const featuredProducts = [
  { id: '1', title: 'Marlin Chronograph', price: '$249.00', image: images.watch1 },
  { id: '2', title: 'Harborside Coast', price: '$149.00', image: images.watch2 },
  { id: '3', title: 'Automatic 1983', price: '$299.00', image: images.watch3 },
  { id: '4', title: 'Ice Blue Collection', price: '$179.00', image: images.watch4 },
  { id: '5', title: 'Cavatina Mini', price: '$129.00', image: images.watch5 },
  { id: '6', title: 'Vintage Inspired', price: '$189.00', image: images.watch6 },
  { id: '7', title: 'Military Style', price: '$159.00', image: images.watch7 },
  { id: '8', title: 'Digital Sport', price: '$99.00', image: images.watch8 },
]

const collections = [
  { id: '1', title: 'Ice Blue Collection', handle: 'ice-blue', image: images.hero },
  { id: '2', title: 'Military Inspired', handle: 'military', image: images.watch2 },
  { id: '3', title: 'Automatic Series', handle: 'automatic', image: images.watch3 },
  { id: '4', title: 'Vintage Collection', handle: 'vintage', image: images.watch4 },
  { id: '5', title: 'Digital Sport', handle: 'digital', image: images.watch5 },
  { id: '6', title: 'Dress Watches', handle: 'dress', image: images.watch6 },
]

const categories = [
  ['Best Sellers', 'best-sellers'],
  ['Military Inspired', 'military'],
  ['Automatic', 'automatic'],
  ['Vintage Inspired', 'vintage'],
  ['Digital', 'digital'],
]

const footerLinks = [
  { id: 'explore', title: 'EXPLORE WATCHES', links: [
    { label: 'New Arrivals', url: '#' },
    { label: "Men's Watches", url: '#' },
    { label: "Women's Watches", url: '#' },
    { label: 'Sport Watches', url: '#' },
    { label: 'Automatic', url: '#' },
    { label: 'Quartz', url: '#' },
    { label: 'Watch Blog', url: '#' },
  ]},
  { id: 'support', title: 'SUPPORT', links: [
    { label: 'FAQ', url: '#' },
    { label: 'Returns & Refunds', url: '#' },
    { label: 'Shipping Policy', url: '#' },
    { label: 'Contact Us', url: '#' },
    { label: 'Warranty', url: '#' },
  ]},
  { id: 'company', title: 'COMPANY', links: [
    { label: 'Our Story', url: '#' },
    { label: 'Careers', url: '#' },
    { label: 'Press', url: '#' },
    { label: 'Privacy Policy', url: '#' },
    { label: 'Terms of Service', url: '#' },
    { label: 'Cookie Policy', url: '#' },
    { label: 'Your Privacy Choices', url: '#' },
  ]},
]

function FooterAccordion({ sections }) {
  const [openSections, setOpenSections] = useState({})

  const toggleSection = (id) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className="hp-footer-acc-grid">
      {sections.map((section) => {
        const isOpen = openSections[section.id]
        return (
          <div key={section.id} className="hp-footer-acc-col">
            <button
              type="button"
              className="hp-footer-acc-btn"
              onClick={() => toggleSection(section.id)}
              aria-expanded={isOpen}
            >
              <span>{section.title}</span>
              <svg
                className={`hp-footer-acc-icon ${isOpen ? 'open' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
            <div
              className={`hp-footer-acc-content ${isOpen ? 'open' : ''}`}
              style={{
                display: isOpen ? 'block' : 'none'
              }}
            >
              <div className="hp-footer-acc-inner">
                {section.links.map((link, i) => (
                  <a key={i} href={link.url} className="hp-footer-link">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Homepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const p = featuredProducts

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', background: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hp-header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: #fff; border-bottom: 1px solid #eee; padding: 0 32px; height: 72px; display: flex; align-items: center; justify-content: space-between; }
        .hp-nav { display: flex; align-items: center; gap: 32px; }
        .hp-nav a { text-decoration: none; color: #0a0a0a; font-size: 12px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; transition: color 0.2s; }
        .hp-nav a:hover { color: #c9a84c; }
        .hp-logo { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #0a0a0a; text-decoration: none; letter-spacing: 4px; text-transform: uppercase; }
        .hp-header-right { display: flex; align-items: center; gap: 8px; }
        .hp-icon-btn { background: none; border: none; cursor: pointer; font-size: 18px; color: #0a0a0a; padding: 8px; transition: color 0.2s; }
        .hp-icon-btn:hover { color: #c9a84c; }
        .hp-hero { position: relative; width: 100%; height: 85vh; min-height: 500px; background: #1a1a2e; overflow: hidden; margin-top: 72px; }
        .hp-hero img { width: 100%; height: 100%; object-fit: cover; object-position: center; }
        .hp-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.2) 60%, transparent); }
        .hp-hero-text { position: absolute; bottom: 0; left: 0; padding: 0 56px 80px; max-width: 700px; }
        .btn-gold { padding: 14px 32px; background: #c9a84c; color: #0a0a0a; text-decoration: none; font-size: 11px; font-family: monospace; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; display: inline-block; transition: all 0.3s; border: none; cursor: pointer; }
        .btn-gold:hover { background: #d4b85e; transform: translateY(-2px); }
        .btn-ghost { padding: 14px 32px; border: 1px solid rgba(255,255,255,0.7); color: #fff; text-decoration: none; font-size: 11px; font-family: monospace; letter-spacing: 3px; text-transform: uppercase; display: inline-block; background: transparent; transition: all 0.3s; }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); }
        .hp-2col { display: grid; grid-template-columns: 1fr 1fr; }
        .hp-ccard { position: relative; aspect-ratio: 4/3; display: block; overflow: hidden; text-decoration: none; background: #f0ede8; }
        .hp-ccard img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s; }
        .hp-ccard:hover img { transform: scale(1.04); }
        .hp-sec { padding: 80px 40px; max-width: 1440px; margin: 0 auto; }
        .hp-sec-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 48px; flex-wrap: wrap; gap: 16px; }
        .hp-tag { font-size: 10px; font-family: monospace; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; margin-bottom: 8px; }
        .hp-title { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 3.5vw, 3rem); color: #0a0a0a; font-weight: 500; }
        .hp-view-all { font-size: 11px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; color: #0a0a0a; text-decoration: none; border-bottom: 1px solid #0a0a0a; padding-bottom: 4px; transition: color 0.2s; }
        .hp-view-all:hover { color: #c9a84c; border-color: #c9a84c; }
        .hp-pgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .hp-pcard { text-decoration: none; color: inherit; display: block; transition: transform 0.3s; }
        .hp-pcard:hover { transform: translateY(-4px); }
        .hp-pcard-img { aspect-ratio: 1; background: #f5f5f0; overflow: hidden; margin-bottom: 16px; }
        .hp-pcard-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .hp-pcard:hover .hp-pcard-img img { transform: scale(1.05); }
        .hp-pcard-title { font-size: 14px; font-weight: 600; color: #0a0a0a; margin-bottom: 4px; }
        .hp-pcard-price { font-size: 14px; color: #c9a84c; font-weight: 500; }
        .hp-edit { display: grid; grid-template-columns: 1fr 1fr; }
        .hp-edit-l { position: relative; min-height: 480px; overflow: hidden; background: #e8e4dc; }
        .hp-edit-l img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
        .hp-edit-r { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
        .hp-ecell { position: relative; min-height: 240px; overflow: hidden; display: block; text-decoration: none; }
        .hp-ecell img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .hp-ecell:hover img { transform: scale(1.05); }
        .hp-catlist { display: grid; grid-template-columns: 1fr 1fr; background: #fff; }
        .hp-catlist-l { padding: 64px 56px; display: flex; flex-direction: column; justify-content: center; }
        .hp-catlist-r { position: relative; min-height: 480px; overflow: hidden; background: #1a1a2e; }
        .hp-catlist-r img { width: 100%; height: 100%; object-fit: cover; }
        .hp-cat-row { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; border-bottom: 1px solid #f0ede8; text-decoration: none; color: #0a0a0a; transition: color 0.2s; }
        .hp-cat-row:hover { color: #c9a84c; }
        .hp-stky-wrap { position: relative; }
        .hp-stky { height: 100vh; display: flex; align-items: center; overflow: hidden; position: sticky; top: 72px; }
        .hp-stky-in { max-width: 1400px; margin: 0 auto; width: 100%; padding: 0 56px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hp-stky-img { width: 100%; max-width: 480px; aspect-ratio: 4/5; overflow: hidden; margin: 0 auto; }
        .hp-stky-img img { width: 100%; height: 100%; object-fit: cover; }
        .hp-quote { padding: 120px 24px; text-align: center; background: #fff; }
        .hp-quote h2 { font-family: 'Playfair Display', serif; font-size: clamp(2.5rem, 6vw, 5.5rem); line-height: 1.15; color: #0a0a0a; max-width: 720px; margin: 0 auto; font-weight: 400; font-style: italic; }
        .hp-cgrid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .hp-citem { position: relative; aspect-ratio: 3/4; display: block; overflow: hidden; text-decoration: none; background: #e5e7eb; }
        .hp-citem img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s; }
        .hp-citem:hover img { transform: scale(1.04); }
        .hp-mlgrid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .hp-mlitem { position: relative; aspect-ratio: 3/4; display: block; overflow: hidden; text-decoration: none; }
        .hp-mlitem img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .hp-mlitem:hover img { transform: scale(1.05); }
        .hp-banner { position: relative; height: 50vh; min-height: 400px; background: #1a1a2e; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .hp-banner img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.5; }
        .hp-banner-content { position: relative; z-index: 2; text-align: center; color: #fff; padding: 0 24px; }
        .hp-footer { background: #2d4a3d; color: #fff; padding: 64px 40px 32px; }
        .hp-footer-grid { display: grid; grid-template-columns: 2fr repeat(3, 1fr); gap: 48px; max-width: 1400px; margin: 0 auto; }
        .hp-footer-col h4 { font-size: 11px; font-family: monospace; letter-spacing: 3px; text-transform: uppercase; color: #c9a84c; margin-bottom: 20px; }
        .hp-footer-col a { display: block; color: #9ca3af; text-decoration: none; font-size: 14px; margin-bottom: 12px; transition: color 0.2s; }
        .hp-footer-col a:hover { color: #fff; }
        .hp-footer-logo { font-family: 'Playfair Display', serif; font-size: 28px; color: #c9a84c; margin-bottom: 20px; letter-spacing: 4px; }
        .hp-footer-input { display: flex; gap: 8px; margin-top: 16px; }
        .hp-footer-input input { flex: 1; padding: 12px 16px; background: #1a1a1a; border: 1px solid #333; color: #fff; font-size: 14px; outline: none; }
        .hp-footer-input button { padding: 12px 24px; background: #c9a84c; color: #0a0a0a; border: none; font-size: 11px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; }
        .hp-footer-bottom { max-width: 1400px; margin: 48px auto 0; padding-top: 32px; border-top: 1px solid #222; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .hp-footer-bottom p { color: #666; font-size: 13px; }
        .hp-mobile-menu-btn { display: none; background: none; border: none; font-size: 24px; cursor: pointer; color: #0a0a0a; }

        /* Footer Accordion Styles */
        .hp-footer-acc { display: none; }
        .hp-footer-acc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .hp-footer-acc-col { display: flex; flex-direction: column; }
        .hp-footer-acc-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 12px 0; background: none; border: none; border-bottom: 2px solid #c9a84c; cursor: pointer; color: #c9a84c; font-size: 11px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
        .hp-footer-acc-btn:hover { color: #d4b85e; }
        .hp-footer-acc-btn span { flex: 1; text-align: left; }
        .hp-footer-acc-icon { color: #9ca3af; transition: transform 0.3s ease; flex-shrink: 0; margin-left: 12px; }
        .hp-footer-acc-icon.open { transform: rotate(180deg); }
        .hp-footer-acc-content { display: none; }
        .hp-footer-acc-content.open { display: block; }
        .hp-footer-acc-inner { padding: 16px 0; }
        .hp-footer-link { display: block; padding: 6px 0; color: #9ca3af; text-decoration: none; font-size: 14px; transition: color 0.2s; line-height: 1.6; }
        .hp-footer-link:hover { color: #fff; }

        @media (max-width: 1024px) {
          .hp-pgrid { grid-template-columns: repeat(2, 1fr); }
          .hp-mlgrid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .hp-nav { display: none; }
          .hp-mobile-menu-btn { display: block; }
          .hp-2col, .hp-edit, .hp-catlist { grid-template-columns: 1fr; }
          .hp-edit-r { grid-template-columns: 1fr 1fr; }
          .hp-ecell { min-height: 160px; }
          .hp-catlist-r { min-height: 300px; }
          .hp-catlist-l { padding: 40px 32px; }
          .hp-stky-in { grid-template-columns: 1fr; padding: 0 32px; gap: 40px; }
          .hp-stky { height: auto; min-height: 70vh; padding: 60px 0; position: relative; top: 0; }
          .hp-stky-img { max-width: 100%; aspect-ratio: 16/9; }
          .hp-cgrid { grid-template-columns: repeat(2, 1fr); }
          .hp-mlgrid { grid-template-columns: repeat(2, 1fr); }
          .hp-sec { padding: 60px 24px; }

          /* Show accordion on mobile/tablet, hide static footer cols */
          .hp-footer-col { display: none; }
          .hp-footer-acc { display: block; }
          .hp-footer-acc-grid { grid-template-columns: 1fr; gap: 0; }
        }
        @media (max-width: 600px) {
          .hp-hero { height: 70vh; min-height: 400px; }
          .hp-hero-text { padding: 0 24px 40px; }
          .hp-pgrid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .hp-edit-r { grid-template-columns: 1fr; }
          .hp-cgrid, .hp-mlgrid { grid-template-columns: repeat(2, 1fr); }
          .hp-quote { padding: 72px 20px; }
          .hp-footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .hp-footer-bottom { flex-direction: column; text-align: center; }
          .hp-footer-acc-btn { font-size: 10px; padding: 10px 0; }
        }
      `}</style>

      {/* HEADER */}
      <header className="hp-header">
        <nav className="hp-nav">
          <a href="#">Shop</a>
          <a href="#">Collections</a>
          <a href="#">Co-Labs</a>
          <a href="#">Archive</a>
        </nav>
        <a href="#" className="hp-logo">VASTARA</a>
        <div className="hp-header-right">
          <nav className="hp-nav">
            <a href="#">Blog</a>
            <a href="#">Explore</a>
          </nav>
          <button className="hp-icon-btn">🔍</button>
          <button className="hp-icon-btn">👤</button>
          <button className="hp-icon-btn">🛒</button>
          <button className="hp-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
        </div>
      </header>

      {/* HERO */}
      <div className="hp-hero">
        <img src={images.hero} alt="Vastara Premium Watches" fetchPriority="high" loading="eager" decoding="async" style={{width:"100%",height:"100%",objectFit:"cover"}} />
        <div className="hp-hero-overlay" />
        <div className="hp-hero-text">
          <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '16px' }}>
            New Collection 2026
          </p>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2.5rem, 5vw, 5rem)', color: '#fff', lineHeight: '1.1', marginBottom: '32px', fontWeight: '700' }}>
            Bold Style<br />in Ice Blue
          </h1>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="#" className="btn-gold">Shop Now</a>
            <a href="#" className="btn-ghost">Explore All</a>
          </div>
        </div>
      </div>

      {/* TWO COLUMN COLLECTIONS */}
      <div className="hp-2col">
        {[collections[1], collections[2]].map((col) => (
          <a key={col.id} href="#" className="hp-ccard">
            <img src={col.image} alt={col.title} loading="lazy" decoding="async" style={{width:"100%",height:"100%",objectFit:"cover"}} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '32px', color: '#fff' }}>
              <p style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '3px', textTransform: 'uppercase', color: '#e8d5a3', marginBottom: '8px' }}>
                {col.handle}
              </p>
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.8rem', lineHeight: '1.2', marginBottom: '12px' }}>
                {col.title}
              </h3>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase', color: '#c9a84c', borderBottom: '1px solid #c9a84c', paddingBottom: '2px' }}>
                Shop Now
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* FEATURED PRODUCTS */}
      <section className="hp-sec">
        <div className="hp-sec-header">
          <div>
            <p className="hp-tag">Curated Selection</p>
            <h2 className="hp-title">Our Most-Loved Styles</h2>
          </div>
          <a href="#" className="hp-view-all">View All</a>
        </div>
        <div className="hp-pgrid">
          {p.slice(0, 4).map((prod) => (
            <a key={prod.id} href="#" className="hp-pcard">
              <div className="hp-pcard-img">
                <img src={prod.image} alt={prod.title} loading="lazy" decoding="async" style={{width:"100%",height:"100%",objectFit:"cover"}} />
              </div>
              <p className="hp-pcard-title">{prod.title}</p>
              <p className="hp-pcard-price">{prod.price}</p>
            </a>
          ))}
        </div>
      </section>

      {/* EDITORIAL MIXED */}
      <div className="hp-edit">
        <div className="hp-edit-l">
          <img src={p[0].image} alt={p[0].title} />
          <div style={{ position: 'absolute', bottom: '24px', left: '24px', background: 'rgba(255,255,255,0.96)', padding: '16px 20px', maxWidth: '240px' }}>
            <p style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '6px' }}>Featured</p>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#0a0a0a', lineHeight: '1.3', marginBottom: '6px' }}>{p[0].title}</p>
            <a href="#" style={{ fontSize: '12px', color: '#c9a84c', textDecoration: 'none', fontFamily: 'monospace' }}>Shop →</a>
          </div>
        </div>
        <div className="hp-edit-r">
          {p.slice(1, 5).map((prod, i) => (
            <a key={prod.id} href="#" className="hp-ecell" style={{ background: i % 2 === 0 ? '#ede9e0' : '#f5f2eb' }}>
              <img src={prod.image} alt={prod.title} loading="lazy" decoding="async" style={{width:"100%",height:"100%",objectFit:"cover"}} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}>
                <p style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>{prod.title}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* CATEGORY LIST + IMAGE */}
      <div className="hp-catlist">
        <div className="hp-catlist-l">
          <p style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '3px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '32px' }}>
            Collection Highlights
          </p>
          {categories.map(([label, handle]) => (
            <a key={handle} href="#" className="hp-cat-row">
              <span style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem' }}>{label}</span>
              <span style={{ fontSize: '20px', color: '#c9a84c' }}>→</span>
            </a>
          ))}
        </div>
        <div className="hp-catlist-r">
          <img src={images.watchHand} alt="" />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
        </div>
      </div>

      {/* STICKY STACKING BANNERS */}
      <div className="hp-stky-wrap">
        {[
          { prod: p[1], bg: '#f0ede6', dark: false, tag: 'Dive Collection', title: 'Harborside Coast', sub: 'Water-resistant to 300M. Built for deep.', rev: false },
          { prod: p[2], bg: '#1c2331', dark: true, tag: 'Automatic', title: 'Automatic 1983 Line', sub: 'The original automatic. Reborn for a new generation.', rev: true },
          { prod: p[4], bg: '#fdf8f0', dark: false, tag: 'Dress Watches', title: 'Courthouse Men', sub: 'Refined dress watches for modern gentleman.', rev: false },
        ].map(({ prod, bg, dark, tag, title, sub, rev }, i) => (
          <div key={i} className="hp-stky" style={{ background: bg, zIndex: 10 + i }}>
            <div className="hp-stky-in" style={{ direction: rev ? 'rtl' : 'ltr' }}>
              <div style={{ direction: 'ltr' }}>
                <p className="hp-tag">{tag}</p>
                <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem, 4vw, 3.8rem)', color: dark ? '#fff' : '#0a0a0a', lineHeight: '1.15', marginBottom: '20px' }}>
                  {title}
                </h2>
                <p style={{ fontSize: '16px', color: dark ? '#9ca3af' : '#4b5563', maxWidth: '400px', lineHeight: '1.7', marginBottom: '32px' }}>
                  {sub}
                </p>
                <a href="#" className="btn-gold">Shop Now</a>
              </div>
              <div style={{ direction: 'ltr', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="hp-stky-img" style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  <img src={prod.image} alt={title} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QUOTE */}
      <div className="hp-quote">
        <h2>Every watch has<br />a soul and a story<br />to be told.</h2>
      </div>

      {/* COLLECTIONS GRID */}
      <div className="hp-cgrid">
        {collections.slice(0, 3).map((col) => (
          <a key={col.id} href="#" className="hp-citem">
            <img src={col.image} alt={col.title} loading="lazy" decoding="async" style={{width:"100%",height:"100%",objectFit:"cover"}} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '32px', color: '#fff' }}>
              <p style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '3px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '8px' }}>
                {col.handle}
              </p>
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', lineHeight: '1.2' }}>
                {col.title}
              </h3>
            </div>
          </a>
        ))}
      </div>

      {/* MORE TO LOVE */}
      <section className="hp-sec">
        <div className="hp-sec-header">
          <div>
            <p className="hp-tag">Explore More</p>
            <h2 className="hp-title">More to Love</h2>
          </div>
          <a href="#" className="hp-view-all">See All</a>
        </div>
        <div className="hp-mlgrid">
          {[
            ['Best Sellers', '#f0ede8'],
            ['Military', '#e8ede0'],
            ['Automatic', '#1c2331'],
            ['Vintage', '#ede8e0'],
            ['Digital', '#e0e8ed'],
          ].map(([cat, bg], i) => (
            <a key={cat} href="#" className="hp-mlitem" style={{ background: bg }}>
              <img src={p[i].image} alt={cat} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', color: '#fff' }}>
                <p style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase', color: '#e8d5a3', marginBottom: '4px' }}>Shop</p>
                <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.1rem' }}>{cat}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* PROMO BANNER */}
      <div className="hp-banner">
        <img src={images.watchGold} alt="" />
        <div className="hp-banner-content">
          <p style={{ fontFamily: 'monospace', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '16px' }}>
            Limited Edition
          </p>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem, 4vw, 4rem)', marginBottom: '24px' }}>
            The Greatest of All Timekeepers
          </h2>
          <a href="#" className="btn-gold">Shop Now</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="hp-footer">
        <div className="hp-footer-grid">
          <div className="hp-footer-col">
            <div className="hp-footer-logo">VASTARA</div>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px', maxWidth: '300px' }}>
              Premium timepieces crafted with precision and elegance. Discover our collection of luxury watches.
            </p>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '12px' }}>Subscribe to our newsletter</p>
            <div className="hp-footer-input">
              <input type="email" placeholder="Enter your email" />
              <button>Subscribe</button>
            </div>
          </div>

          {/* Static columns for desktop */}
          <div className="hp-footer-col">
            <h4>Shop</h4>
            <a href="#">New Arrivals</a>
            <a href="#">Best Sellers</a>
            <a href="#">Collections</a>
            <a href="#">Automatic</a>
            <a href="#">Digital</a>
          </div>
          <div className="hp-footer-col">
            <h4>Support</h4>
            <a href="#">Contact Us</a>
            <a href="#">FAQ</a>
            <a href="#">Shipping</a>
            <a href="#">Returns</a>
            <a href="#">Warranty</a>
          </div>
          <div className="hp-footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
            <a href="#">Blog</a>
            <a href="#">Stores</a>
          </div>

          {/* Accordion for mobile/tablet */}
          <FooterAccordion sections={footerLinks} />
        </div>
        <div className="hp-footer-bottom">
          <p>© 2026 Vastara. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px' }}>Privacy</a>
            <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px' }}>Terms</a>
            <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px' }}>Refunds</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
