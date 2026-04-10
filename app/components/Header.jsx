import {Link, useLocation, useFetcher, useNavigate} from 'react-router';
import {useState, useEffect, useRef, useCallback} from 'react';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimerRef = useRef(null);
  const searchFetcher = useFetcher({key: 'header-search'});
  const navigate = useNavigate();
  useEffect(() => setMounted(true), []);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Predictive search with debounce
  const doSearch = useCallback((term) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!term.trim()) { setSearchResults(null); setSearchLoading(false); return; }
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(() => {
      searchFetcher.load(`/search?predictive=true&q=${encodeURIComponent(term.trim())}&limit=6`);
    }, 250);
  }, [searchFetcher]);

  // Read fetcher results
  useEffect(() => {
    if (searchFetcher.data?.result) {
      setSearchResults(searchFetcher.data.result);
      setSearchLoading(false);
    }
  }, [searchFetcher.data]);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Close search on route change
  useEffect(() => { setSearchOpen(false); setSearchTerm(''); setSearchResults(null); }, [location.pathname]);

  // Close search on Escape
  useEffect(() => {
    if (!searchOpen) return;
    const fn = (e) => { if (e.key === 'Escape') { setSearchOpen(false); setSearchTerm(''); setSearchResults(null); } };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [searchOpen]);

  const totalResults = searchResults?.total || 0;
  const products = searchResults?.items?.products || [];
  const collections = searchResults?.items?.collections || [];
  const queries = searchResults?.items?.queries || [];

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

        /* SEARCH OVERLAY */
        .vst-search-backdrop{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.4);display:flex;justify-content:center;padding-top:96px;animation:vst-fade-in 0.15s ease;}
        @keyframes vst-fade-in{from{opacity:0}to{opacity:1}}
        .vst-search-overlay{background:#fff;width:100%;max-width:680px;max-height:calc(100vh - 120px);border-radius:0 0 12px 12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.2);display:flex;flex-direction:column;animation:vst-slide-down 0.2s ease;}
        @keyframes vst-slide-down{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        .vst-search-bar{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid #f0f0f0;}
        .vst-search-input{flex:1;border:none;outline:none;font-size:15px;font-weight:300;color:#0a0a0a;background:transparent;letter-spacing:0.2px;}
        .vst-search-input::placeholder{color:#bbb;font-weight:300;}
        .vst-search-input::-webkit-search-cancel-button{-webkit-appearance:none;}
        .vst-search-close{background:none;border:none;cursor:pointer;padding:4px;display:flex;transition:opacity 0.15s;}
        .vst-search-close:hover{opacity:0.5;}

        .vst-search-results{flex:1;overflow-y:auto;padding:8px 0;}
        .vst-search-loading{display:flex;align-items:center;gap:10px;padding:32px 20px;color:#999;font-size:13px;font-weight:300;}
        .vst-search-spinner{width:16px;height:16px;border:1.5px solid #eee;border-top-color:#0a0a0a;border-radius:50%;animation:vst-spin 0.6s linear infinite;}
        @keyframes vst-spin{to{transform:rotate(360deg)}}

        .vst-search-empty{padding:32px 20px;text-align:center;color:#999;font-size:13px;font-weight:300;}
        .vst-search-empty-hint{font-size:11px;color:#ccc;margin-top:6px;}
        .vst-search-placeholder{padding:32px 20px;text-align:center;color:#bbb;font-size:13px;font-weight:300;}

        .vst-search-section{padding:0 20px 12px;}
        .vst-search-section-title{font-size:9px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#aaa;padding:12px 0 8px;}
        .vst-search-result-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f7f7f7;text-decoration:none;color:#0a0a0a;transition:all 0.15s;}
        .vst-search-result-item:hover{padding-left:4px;}
        .vst-search-result-item:hover .vst-search-result-title{color:#000;}
        .vst-search-result-img{width:48px;height:48px;border-radius:6px;object-fit:cover;background:#f5f5f5;flex-shrink:0;}
        .vst-search-result-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
        .vst-search-result-title{font-size:13px;font-weight:400;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.15s;}
        .vst-search-result-price{font-size:12px;color:#888;font-weight:300;}
        .vst-search-result-vendor{font-size:11px;color:#bbb;font-weight:300;text-transform:uppercase;letter-spacing:0.5px;}

        .vst-search-view-all{display:block;padding:12px 0 4px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#0a0a0a;text-decoration:none;font-weight:400;transition:opacity 0.15s;}
        .vst-search-view-all:hover{opacity:0.5;}

        .vst-search-suggestion{display:flex;align-items:center;gap:10px;width:100%;padding:9px 0;border:none;background:none;cursor:pointer;font-size:13px;color:#666;text-align:left;transition:color 0.15s;font-family:inherit;}
        .vst-search-suggestion:hover{color:#0a0a0a;}

        .vst-search-popular{display:flex;align-items:center;gap:8px;margin-top:16px;flex-wrap:wrap;justify-content:center;}
        .vst-search-popular-label{font-size:10px;color:#ccc;text-transform:uppercase;letter-spacing:1px;}
        .vst-search-popular-tag{padding:6px 14px;border-radius:20px;border:1px solid #e8e8e8;background:none;cursor:pointer;font-size:11px;color:#777;transition:all 0.15s;font-family:inherit;}
        .vst-search-popular-tag:hover{border-color:#0a0a0a;color:#0a0a0a;}

        @media(max-width:600px){
          .vst-search-overlay{max-width:100%;border-radius:0;max-height:calc(100vh - 96px);}
          .vst-search-backdrop{padding-top:64px;}
        }
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
            <button onClick={() => setSearchOpen(true)} className="vst-icon-btn" title="Search" type="button" aria-label="Search">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
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

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div className="vst-search-backdrop" onClick={() => { setSearchOpen(false); setSearchTerm(''); setSearchResults(null); }}>
          <div className="vst-search-overlay" onClick={e => e.stopPropagation()}>
            <div className="vst-search-bar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                ref={searchInputRef}
                type="search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); doSearch(e.target.value); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    setSearchOpen(false);
                    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                  }
                }}
                placeholder="Search watches, brands, collections..."
                className="vst-search-input"
                autoComplete="off"
                autoFocus
              />
              <button onClick={() => { setSearchOpen(false); setSearchTerm(''); setSearchResults(null); }} className="vst-search-close" type="button" aria-label="Close search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="vst-search-results">
              {searchLoading && searchTerm.trim() && (
                <div className="vst-search-loading">
                  <div className="vst-search-spinner" />
                  <span>Searching...</span>
                </div>
              )}

              {!searchLoading && searchTerm.trim() && totalResults === 0 && (
                <div className="vst-search-empty">
                  <p>No results for "<strong>{searchTerm}</strong>"</p>
                  <p className="vst-search-empty-hint">Try different keywords or browse our collections</p>
                </div>
              )}

              {!searchLoading && products.length > 0 && (
                <div className="vst-search-section">
                  <div className="vst-search-section-title">Products</div>
                  {products.slice(0, 4).map(p => (
                    <Link key={p.id} to={`/products/${p.handle}`} className="vst-search-result-item" onClick={() => { setSearchOpen(false); setSearchTerm(''); setSearchResults(null); }}>
                      {p.selectedOrFirstAvailableVariant?.image?.url && (
                        <img src={p.selectedOrFirstAvailableVariant.image.url} alt={p.title} className="vst-search-result-img" width="48" height="48" loading="lazy" />
                      )}
                      <div className="vst-search-result-info">
                        <span className="vst-search-result-title">{p.title}</span>
                        <span className="vst-search-result-price">
                          {p.selectedOrFirstAvailableVariant?.price?.amount && `$${Number(p.selectedOrFirstAvailableVariant.price.amount).toFixed(2)}`}
                        </span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="m9 18 6-6-6-6"/></svg>
                    </Link>
                  ))}
                  {products.length > 4 && (
                    <Link to={`/search?q=${encodeURIComponent(searchTerm.trim())}`} className="vst-search-view-all" onClick={() => { setSearchOpen(false); setSearchTerm(''); setSearchResults(null); }}>
                      View all {products.length} products →
                    </Link>
                  )}
                </div>
              )}

              {!searchLoading && collections.length > 0 && (
                <div className="vst-search-section">
                  <div className="vst-search-section-title">Collections</div>
                  {collections.slice(0, 3).map(c => (
                    <Link key={c.id} to={`/collections/${c.handle}`} className="vst-search-result-item" onClick={() => { setSearchOpen(false); setSearchTerm(''); setSearchResults(null); }}>
                      {c.image?.url && (
                        <img src={c.image.url} alt={c.title} className="vst-search-result-img" width="48" height="48" loading="lazy" />
                      )}
                      <div className="vst-search-result-info">
                        <span className="vst-search-result-title">{c.title}</span>
                        <span className="vst-search-result-vendor">Collection</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="m9 18 6-6-6-6"/></svg>
                    </Link>
                  ))}
                </div>
              )}

              {!searchLoading && queries.length > 0 && products.length === 0 && collections.length === 0 && (
                <div className="vst-search-section">
                  <div className="vst-search-section-title">Suggestions</div>
                  {queries.slice(0, 4).map((q, i) => (
                    <button key={i} type="button" className="vst-search-suggestion"
                      onClick={() => { setSearchTerm(q.text); doSearch(q.text); searchInputRef.current?.focus(); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <span>{q.text}</span>
                    </button>
                  ))}
                </div>
              )}

              {!searchLoading && !searchTerm.trim() && (
                <div className="vst-search-placeholder">
                  <p>Start typing to search watches, brands, and collections</p>
                  <div className="vst-search-popular">
                    <span className="vst-search-popular-label">Popular:</span>
                    {['Bulova', 'Diver', 'Chronograph', 'Skeleton'].map(t => (
                      <button key={t} type="button" className="vst-search-popular-tag"
                        onClick={() => { setSearchTerm(t); doSearch(t); searchInputRef.current?.focus(); }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
