import {Link, useLocation} from 'react-router';
import {useState, useEffect} from 'react';

const MENU_IMAGES = {
  default: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_1.jpg?v=1772467367',
  watches: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_2.jpg?v=1772467366',
  collections: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_3.jpg?v=1772467367',
  brands: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_4.jpg?v=1772467366',
  men: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/QUADRADO_5.jpg?v=1772467333',
  women: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/QUADRADO_6.jpg?v=1772467333',
};

// Static brand submenu — shown when "By Brands" menu is active
const BRAND_ITEMS = [
  {id:'b1', title:'Addiesdive', url:'/collections/addiesdive-collection'},
  {id:'b2', title:'Agelocar', url:'/collections/agelocar-collection'},
  {id:'b3', title:'Baltany', url:'/collections/baltany-collection'},
  {id:'b4', title:'Berny', url:'/collections/berny-collection'},
  {id:'b5', title:'Boderry', url:'/collections/boderry-collection'},
  {id:'b6', title:'Bulova', url:'/collections/bulova'},
  {id:'b7', title:'Ciloa', url:'/collections/ciloa-collection'},
  {id:'b8', title:'Citizen', url:'/collections/citizen'},
  {id:'b9', title:'Corgeut', url:'/collections/corgeut-collection'},
  {id:'b10', title:'Curren', url:'/collections/curren-collection'},
  {id:'b11', title:'Ebony', url:'/collections/ebony-collection'},
  {id:'b12', title:'Fossil', url:'/collections/fossil-watch'},
  {id:'b13', title:'Foxbox', url:'/collections/foxbox-collection'},
  {id:'b14', title:'Incaseda', url:'/collections/incaseda-collection'},
  {id:'b15', title:'Megir', url:'/collections/megir-collection'},
  {id:'b16', title:'Merkur', url:'/collections/merkur-collection'},
  {id:'b17', title:'Naviforce', url:'/collections/naviforce-collection'},
  {id:'b18', title:'North Edge', url:'/collections/north-edge-collection'},
  {id:'b19', title:'OFNS', url:'/collections/ofns-collection'},
  {id:'b20', title:'Onola', url:'/collections/onola-collection'},
  {id:'b21', title:'Pagani', url:'/collections/pagani-collection'},
  {id:'b22', title:'Poedagar', url:'/collections/poedagar-collection'},
  {id:'b23', title:'San Martin', url:'/collections/san-martin'},
  {id:'b24', title:'Seagull', url:'/collections/seagull'},
  {id:'b25', title:'Seakoss', url:'/collections/seakoss-collection'},
  {id:'b26', title:'SKMEI', url:'/collections/skmei-collection'},
];

function getImage(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('watch')) return MENU_IMAGES.watches;
  if (t.includes('collect')) return MENU_IMAGES.collections;
  if (t.includes('brand')) return MENU_IMAGES.brands;
  if (t.includes('men') && !t.includes('women')) return MENU_IMAGES.men;
  if (t.includes('women')) return MENU_IMAGES.women;
  return MENU_IMAGES.default;
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

export default function Header({header, cartCount, onCartOpen}) {
  const {menu, shop} = header || {};
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoveredSub, setHoveredSub] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setActiveMenu(null); }, [location.pathname]);

  const buildUrl = (url) => {
    if (!url) return '/';
    try { return new URL(url).pathname; } catch { return url; }
  };

  const activeItem = menu?.items?.find(i => i.id === activeMenu);
  const megaImage = hoveredSub ? getImage(hoveredSub.title) : activeItem ? getImage(activeItem.title) : MENU_IMAGES.default;

  // How many items — drives column layout
  // Inject static brand list when CMS menu has no subs or is brand menu
  const isBrandMenu = activeItem && (activeItem.title || '').toLowerCase().includes('brand');
  const effectiveItems = isBrandMenu ? BRAND_ITEMS : (activeItem?.items || []);
  const subCount = effectiveItems.length;
  // For large menus (>12), use more columns with fewer rows; for small, use 1 col
  const itemsPerCol = subCount > 18 ? 7 : subCount > 10 ? 6 : subCount > 6 ? 5 : subCount;
  const cols = subCount > 0 ? chunkArray(effectiveItems, itemsPerCol) : [];

  return (
    <>
      <style suppressHydrationWarning>{`
        

        .vst-header{position:fixed;top:0;left:0;right:0;z-index:1000;transition:background 0.3s,box-shadow 0.3s;}
        .vst-topbar{background:#0a0a0a;color:#fff;text-align:center;padding:7px;font-size:10px;letter-spacing:3px;}
        .vst-bar{display:flex;align-items:center;justify-content:space-between;height:64px;padding:0 40px;max-width:1600px;margin:0 auto;position:relative;}

        .vst-logo{text-decoration:none;flex-shrink:0;}
        .vst-logo-text{font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:500;letter-spacing:8px;text-transform:uppercase;color:#0a0a0a;transition:opacity 0.2s;}
        .vst-logo:hover .vst-logo-text{opacity:0.55;}

        .vst-nav{display:flex;align-items:center;position:absolute;left:50%;transform:translateX(-50%);}
        .vst-nav-link{font-size:11px;font-weight:400;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;color:#0a0a0a;padding:0 18px;height:64px;display:flex;align-items:center;transition:color 0.2s;white-space:nowrap;position:relative;}
        .vst-nav-link::after{content:'';position:absolute;bottom:0;left:18px;right:18px;height:1px;background:#0a0a0a;transform:scaleX(0);transition:transform 0.25s ease;}
        .vst-nav-item:hover .vst-nav-link::after{transform:scaleX(1);}

        .vst-icons{display:flex;align-items:center;gap:2px;flex-shrink:0;}
        .vst-icon-btn{padding:10px;color:#0a0a0a;text-decoration:none;display:flex;align-items:center;background:none;border:none;cursor:pointer;position:relative;transition:opacity 0.2s;}
        .vst-icon-btn:hover{opacity:0.45;}
        .vst-cart-badge{position:absolute;top:4px;right:4px;background:#0a0a0a;color:#fff;font-size:9px;width:15px;height:15px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;}

        /* MEGAMENU */
        .vst-mega-wrap{position:fixed;left:0;right:0;z-index:999;opacity:0;pointer-events:none;transform:translateY(-8px);transition:opacity 0.22s ease,transform 0.22s ease;}
        .vst-mega-wrap.open{opacity:1;pointer-events:all;transform:translateY(0);}
        .vst-mega{display:grid;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,0.11);border-top:1px solid #ebebeb;}

        /* LEFT — dark panel, always fixed width */
        .vst-mega-left{background:#0a0a0a;padding:40px 36px;display:flex;flex-direction:column;justify-content:space-between;min-width:260px;max-width:260px;}
        .vst-mega-left-eyebrow{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#444;margin-bottom:20px;}
        .vst-mega-left-title{font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:400;color:#fff;line-height:1.2;letter-spacing:-0.3px;}
        .vst-mega-left-count{font-size:10px;color:#555;letter-spacing:1px;margin-top:10px;}
        .vst-mega-left-cta{display:inline-flex;align-items:center;gap:8px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#fff;text-decoration:none;border-bottom:1px solid #333;padding-bottom:3px;transition:border-color 0.2s;width:fit-content;}
        .vst-mega-left-cta:hover{border-color:#fff;}

        /* CENTER — links */
        .vst-mega-center{padding:36px 44px;display:flex;gap:36px;flex:1;}
        .vst-mega-col{min-width:140px;}
        .vst-mega-col-title{font-size:9px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#ccc;margin-bottom:16px;height:16px;}
        .vst-mega-link{display:flex;align-items:center;justify-content:space-between;font-size:12.5px;color:#222;text-decoration:none;padding:7px 0;font-weight:300;letter-spacing:0.2px;border-bottom:1px solid #f5f5f5;transition:all 0.18s;white-space:nowrap;}
        .vst-mega-link .arr{font-size:11px;color:#ddd;opacity:0;transform:translateX(-4px);transition:all 0.18s;}
        .vst-mega-link:hover{color:#000;padding-left:5px;}
        .vst-mega-link:hover .arr{opacity:1;transform:translateX(0);}

        /* RIGHT — image, fixed width */
        .vst-mega-right{width:200px;min-width:200px;position:relative;overflow:hidden;}
        .vst-mega-right img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;}
        .vst-mega-right:hover img{transform:scale(1.03);}
        .vst-mega-right-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 55%);}
        .vst-mega-right-tag{position:absolute;bottom:20px;left:18px;right:18px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#fff;line-height:1.4;}

        /* MOBILE */
        @media(max-width:900px){.vst-nav{display:none!important;}.vst-mobile-btn{display:flex!important;}}
        .vst-mobile-btn{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px;position:absolute;right:20px;}
        .vst-mobile-drawer{position:fixed;top:96px;left:0;right:0;z-index:998;background:#fff;border-top:1px solid #f0f0f0;padding:16px 24px;max-height:80vh;overflow-y:auto;}
        .vst-mobile-item{display:block;padding:12px 0;font-size:11px;font-weight:400;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;color:#0a0a0a;border-bottom:1px solid #f5f5f5;}
        .vst-mobile-sub{display:block;padding:8px 0 8px 16px;font-size:13px;text-decoration:none;color:#888;border-bottom:1px solid #fafafa;font-weight:300;}
      `}</style>

      {/* HEADER BAR */}
      <div className="vst-header" suppressHydrationWarning style={{background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff', boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.07)' : 'none'}}>
        <div className="vst-topbar">FREE SHIPPING ALL ORDERS &nbsp;·&nbsp; USE CODE: VASTARA10</div>
        <div className="vst-bar">

          <Link to="/" className="vst-logo">
            <span className="vst-logo-text">{shop?.name || 'VASTARA'}</span>
          </Link>

          <nav className="vst-nav">
            {menu?.items?.map((item) => (
              <div key={item.id} className="vst-nav-item"
                onMouseEnter={() => { setActiveMenu(item.id); setHoveredSub(null); }}
                onMouseLeave={() => { setActiveMenu(null); setHoveredSub(null); }}>
                <Link to={buildUrl(item.url)} className="vst-nav-link">{item.title}</Link>
              </div>
            ))}
          </nav>

          <div className="vst-icons">
            <Link to="/search" className="vst-icon-btn" title="Search">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </Link>
            <Link to="/account" className="vst-icon-btn" title="Account">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCartOpen();
              }}
              className="vst-icon-btn"
              aria-label={`Shopping cart${cartCount > 0 ? ` with ${cartCount} items` : ''}`}
              type="button"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && <span className="vst-cart-badge" aria-live="polite">{cartCount}</span>}
            </button>
          </div>

          <button
            className="vst-mobile-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span style={{display:'block',width:'22px',height:'1.5px',background:'#0a0a0a',transition:'all 0.3s',transform:mobileOpen?'rotate(45deg) translate(5px,5px)':'none'}} aria-hidden="true"/>
            <span style={{display:'block',width:'22px',height:'1.5px',background:'#0a0a0a',transition:'all 0.3s',opacity:mobileOpen?0:1}} aria-hidden="true"/>
            <span style={{display:'block',width:'22px',height:'1.5px',background:'#0a0a0a',transition:'all 0.3s',transform:mobileOpen?'rotate(-45deg) translate(5px,-5px)':'none'}} aria-hidden="true"/>
          </button>
        </div>
      </div>

      {/* MEGAMENU — one shared panel, content driven by activeMenu */}
      <div
        className={`vst-mega-wrap${activeMenu && activeItem?.items?.length > 0 ? ' open' : ''}`}
        style={{top: '96px'}}
        onMouseEnter={() => activeMenu && setActiveMenu(activeMenu)}
        onMouseLeave={() => { setActiveMenu(null); setHoveredSub(null); }}
      >
        {activeItem?.items?.length > 0 && (
          <div className="vst-mega" style={{gridTemplateColumns: `260px 1fr 200px`}}>

            {/* LEFT */}
            <div className="vst-mega-left">
              <div>
                <div className="vst-mega-left-eyebrow">Vastara Collection</div>
                <div className="vst-mega-left-title">{activeItem.title}</div>
                <div className="vst-mega-left-count">{subCount} {subCount === 1 ? 'category' : 'categories'}</div>
              </div>
              <Link to={buildUrl(activeItem.url)} className="vst-mega-left-cta">
                View All <span>→</span>
              </Link>
            </div>

            {/* CENTER — auto columns */}
            <div className="vst-mega-center">
              {cols.map((col, ci) => (
                <div key={ci} className="vst-mega-col">
                  <div className="vst-mega-col-title">{ci === 0 ? 'Browse' : ''}</div>
                  {col.map(sub => (
                    <Link key={sub.id} to={buildUrl(sub.url)} className="vst-mega-link"
                      onMouseEnter={() => setHoveredSub(sub)}
                      onMouseLeave={() => setHoveredSub(null)}>
                      {sub.title}
                      <span className="arr">→</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            {/* RIGHT — image */}
            <div className="vst-mega-right">
              <img src={megaImage} alt={hoveredSub?.title || activeItem.title} loading="lazy" decoding="async" width="200" height="200" style={{width:"100%",height:"100%",objectFit:"cover"}} />
              <div className="vst-mega-right-overlay"/>
              <div className="vst-mega-right-tag">{hoveredSub?.title || activeItem.title}</div>
            </div>

          </div>
        )}
      </div>

      {/* MOBILE DRAWER */}
      {mounted && mobileOpen && (
        <div className="vst-mobile-drawer">
          {menu?.items?.map(item => (
            <div key={item.id}>
              <Link to={buildUrl(item.url)} className="vst-mobile-item">{item.title}</Link>
              {item.items?.map(sub => (
                <Link key={sub.id} to={buildUrl(sub.url)} className="vst-mobile-sub">{sub.title}</Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
