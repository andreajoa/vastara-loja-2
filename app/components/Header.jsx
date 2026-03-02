import {Link, useLocation} from 'react-router';
import {useState, useEffect} from 'react';

export default function Header({header, cartCount, onCartOpen}) {
  const {menu, shop} = header || {};
  const [activeMenu, setActiveMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const buildUrl = (url) => {
    if (!url) return '/';
    try { return new URL(url).pathname; } catch { return url; }
  };

  return (
    <header style={{
      position:'fixed',top:0,left:0,right:0,zIndex:1000,
      background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
      backdropFilter: scrolled ? 'blur(8px)' : 'none',
      boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
      transition:'all 0.3s ease'
    }}>
      <div style={{background:'#0a0a0a',color:'#fff',textAlign:'center',padding:'8px',fontSize:'11px',letterSpacing:'3px',fontFamily:'monospace'}}>
        FREE SHIPPING ON ORDERS OVER $75 &nbsp;|&nbsp; USE CODE: VASTARA10
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',maxWidth:'1600px',margin:'0 auto',position:'relative'}}>

        <button onClick={() => setMobileOpen(!mobileOpen)} style={{display:'none',flexDirection:'column',gap:'5px',background:'none',border:'none',cursor:'pointer',padding:'8px'}}
          className="mobile-menu-btn">
          <span style={{display:'block',width:'22px',height:'2px',background:'#0a0a0a',transition:'all 0.3s',
            transform: mobileOpen ? 'rotate(45deg) translate(5px,5px)' : 'none'}}></span>
          <span style={{display:'block',width:'22px',height:'2px',background:'#0a0a0a',transition:'all 0.3s',
            opacity: mobileOpen ? 0 : 1}}></span>
          <span style={{display:'block',width:'22px',height:'2px',background:'#0a0a0a',transition:'all 0.3s',
            transform: mobileOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none'}}></span>
        </button>

        <nav style={{display:'flex',alignItems:'center',gap:'32px'}}>
          {menu?.items?.map((item) => (
            <div key={item.id} style={{position:'relative'}}
              onMouseEnter={() => setActiveMenu(item.id)}
              onMouseLeave={() => setActiveMenu(null)}>
              <Link to={buildUrl(item.url)} style={{
                fontSize:'12px',fontWeight:'500',letterSpacing:'2px',textTransform:'uppercase',
                textDecoration:'none',color:'#0a0a0a',padding:'24px 0',display:'block',
                transition:'color 0.2s'
              }}
              onMouseEnter={e => e.target.style.color='#c9a84c'}
              onMouseLeave={e => e.target.style.color='#0a0a0a'}>
                {item.title}
              </Link>
              {item.items?.length > 0 && activeMenu === item.id && (
                <div style={{position:'absolute',top:'100%',left:0,background:'#fff',
                  boxShadow:'0 8px 32px rgba(0,0,0,0.12)',borderTop:'2px solid #c9a84c',minWidth:'180px',zIndex:50}}>
                  {item.items.map(sub => (
                    <Link key={sub.id} to={buildUrl(sub.url)} style={{
                      display:'block',padding:'12px 20px',fontSize:'13px',textDecoration:'none',
                      color:'#0a0a0a',borderBottom:'1px solid #f3f4f6',transition:'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.color='#c9a84c'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#0a0a0a'; }}>
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <Link to="/" style={{position:'absolute',left:'50%',transform:'translateX(-50%)',textDecoration:'none'}}>
          <div style={{fontFamily:'"Playfair Display",serif',fontSize:'22px',fontWeight:'700',letterSpacing:'6px',textTransform:'uppercase',color:'#0a0a0a'}}>
            {shop?.name || 'VASTARA'}
          </div>
        </Link>

        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <Link to="/search" style={{padding:'8px',color:'#0a0a0a',textDecoration:'none',fontSize:'18px'}} title="Search">🔍</Link>
          <Link to="/account" style={{padding:'8px',color:'#0a0a0a',textDecoration:'none',fontSize:'18px'}} title="Account">👤</Link>
          <button onClick={onCartOpen} style={{padding:'8px',background:'none',border:'none',cursor:'pointer',position:'relative',fontSize:'18px'}}>
            🛍
            {cartCount > 0 && (
              <span style={{
                position:'absolute',top:'2px',right:'2px',background:'#c9a84c',color:'#fff',
                fontSize:'10px',width:'18px',height:'18px',borderRadius:'50%',
                display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace',fontWeight:'700'
              }}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {mobileOpen && (
        <div style={{background:'#fff',borderTop:'1px solid #f3f4f6',padding:'16px 24px',boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}}>
          {menu?.items?.map(item => (
            <div key={item.id}>
              <Link to={buildUrl(item.url)} style={{display:'block',padding:'12px 0',fontSize:'13px',fontWeight:'500',
                letterSpacing:'2px',textTransform:'uppercase',textDecoration:'none',color:'#0a0a0a',
                borderBottom:'1px solid #f3f4f6'}}>
                {item.title}
              </Link>
              {item.items?.map(sub => (
                <Link key={sub.id} to={buildUrl(sub.url)} style={{display:'block',paddingLeft:'16px',padding:'8px 0 8px 16px',
                  fontSize:'13px',textDecoration:'none',color:'#6b7280',borderBottom:'1px solid #fafafa'}}>
                  {sub.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
