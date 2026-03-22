import {Link} from 'react-router';
import {useState, useEffect, useRef} from 'react';

// Animated analog clock component
function AnalogClock({timezone, city}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 28;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 1;

    function draw() {
      const now = new Date(new Date().toLocaleString('en-US', {timeZone: timezone}));
      const hrs = now.getHours() % 12;
      const mins = now.getMinutes();
      const secs = now.getSeconds();

      ctx.clearRect(0, 0, size, size);

      // Circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Hour markers
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(angle) * (r - 1);
        const y1 = cy + Math.sin(angle) * (r - 1);
        const x2 = cx + Math.cos(angle) * (r - 3.5);
        const y2 = cy + Math.sin(angle) * (r - 3.5);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Hour hand
      const hAngle = ((hrs + mins / 60) / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(hAngle) * (r * 0.5), cy + Math.sin(hAngle) * (r * 0.5));
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Minute hand
      const mAngle = ((mins + secs / 60) / 60) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(mAngle) * (r * 0.72), cy + Math.sin(mAngle) * (r * 0.72));
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Second hand
      const sAngle = (secs / 60) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sAngle) * (r * 0.8), cy + Math.sin(sAngle) * (r * 0.8));
      ctx.strokeStyle = '#c9a84c';
      ctx.lineWidth = 0.7;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#c9a84c';
      ctx.fill();
    }

    draw();
    const interval = setInterval(draw, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return <canvas ref={canvasRef} style={{display:'block',flexShrink:0}} />;
}

const CITIES = [
  {city:'New York',   timezone:'America/New_York',    flag:'🇺🇸'},
  {city:'Los Angeles',timezone:'America/Los_Angeles', flag:'🇺🇸'},
  {city:'London',     timezone:'Europe/London',       flag:'🇬🇧'},
  {city:'Tokyo',      timezone:'Asia/Tokyo',          flag:'🇯🇵'},
  {city:'Paris',      timezone:'Europe/Paris',        flag:'🇫🇷'},
  {city:'Dubai',      timezone:'Asia/Dubai',          flag:'🇦🇪'},
];

const FALLBACK_GROUPS = [
  {id:'f1', title:'Explore Watches', type:'links', items:[
    {id:'f1a', title:'New Arrivals',         url:'/collections/new-arrivals'},
    {id:'f1b', title:"Men's Watches",        url:'/collections/mens'},
    {id:'f1c', title:"Women's Watches",      url:'/collections/womens'},
    {id:'f1d', title:'Sport Watches',        url:'/collections/sport'},
    {id:'f1e', title:'Automatic',            url:'/collections/automatic-watches'},
    {id:'f1f', title:'Quartz',               url:'/collections/quartz'},
    {id:'f1g', title:'Watch Blog',           url:'/blogs/news'},
  ]},
  {id:'f2', title:'Support', type:'links', items:[
    {id:'f2a', title:'FAQ',                  url:'/pages/faq'},
    {id:'f2b', title:'Returns & Refunds',    url:'/policies/refund-policy'},
    {id:'f2c', title:'Shipping Policy',      url:'/policies/shipping-policy'},
    {id:'f2d', title:'Contact Us',           url:'/pages/contact'},
    {id:'f2e', title:'Warranty',             url:'/pages/warranty'},
  ]},
  {id:'f3', title:'Company', type:'links', items:[
    {id:'f3a', title:'Our Story',            url:'/pages/about'},
    {id:'f3b', title:'Careers',              url:'/pages/careers'},
    {id:'f3c', title:'Press',                url:'/pages/press'},
    {id:'f3d', title:'Privacy Policy',       url:'/policies/privacy-policy'},
    {id:'f3e', title:'Terms of Service',     url:'/policies/terms-of-service'},
    {id:'f3f', title:'Cookie Policy',        url:'/policies/cookie-policy'},
    {id:'f3g', title:'Your Privacy Choices', url:'/pages/privacy-choices'},
  ]},
  {id:'f4', title:'Vastara', type:'brand', items:[]},
];



const PAYMENT_METHODS = [
  {name:'Amex',      icon:<svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#2563EB"/><text x="19" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="monospace">AMEX</text></svg>},
  {name:'Visa',      icon:<svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#1a1f71"/><text x="19" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="serif" fontStyle="italic">VISA</text></svg>},
  {name:'Mastercard',icon:<svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#252525"/><circle cx="14" cy="12" r="7" fill="#EB001B"/><circle cx="24" cy="12" r="7" fill="#F79E1B"/><path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00"/></svg>},
  {name:'PayPal',    icon:<svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#003087"/><text x="19" y="16" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">PayPal</text></svg>},
  {name:'Apple Pay', icon:<svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#000"/><text x="19" y="16" textAnchor="middle" fill="white" fontSize="7" fontFamily="sans-serif"> Pay</text><text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif"></text></svg>},
  {name:'Google Pay',icon:<svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#fff" stroke="#e0e0e0" strokeWidth="0.5"/><text x="19" y="16" textAnchor="middle" fill="#333" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">G Pay</text></svg>},
];


function FooterAccordion({groups, buildUrl}) {
  const [openSection, setOpenSection] = useState(null);

  return (
    <div className="vf-links-col">
      {groups.slice(0, 4).map((section) => {
        const isOpen = openSection === section.id;
        const isBrand = section.type === 'brand';
        return (
          <div key={section.id} className="vf-acc-item">
            <button
              className="vf-acc-btn"
              type="button"
              onClick={() => setOpenSection(isOpen ? null : section.id)}
            >
              {section.title}
              <span style={{fontSize:'10px',color:'#4b5563',display:'inline-block',transition:'transform 0.25s ease',transform:isOpen?'rotate(180deg)':'rotate(0deg)'}}>▼</span>
            </button>
            <div style={{overflow:'hidden',maxHeight:isOpen?'500px':'0',transition:'max-height 0.35s ease'}}>
              {isBrand ? (
                <div style={{padding:'20px 40px'}}>
                  <p style={{fontSize:'13px',color:'#9ca3af',lineHeight:'1.7',marginBottom:'20px'}}>
                    Each timepiece embodies precision engineering and sophisticated design for the discerning collector in USA, UK, Canada, and Australia.
                  </p>
                  {[
                    '1-Year International Warranty',
                    'Free Shipping to USA, UK, CA & AU',
                    'Secure Checkout',
                  ].map((item) => (
                    <div key={item} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                      <span style={{color:'#c9a84c',fontSize:'16px',fontWeight:'bold',flexShrink:0}}>✓</span>
                      <span style={{fontSize:'13px',color:'#e5e7eb'}}>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                section.items.map(item => (
                  <Link key={item.id} to={buildUrl(item.url)} className="vf-acc-link">
                    {item.title}
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Footer({footer}) {
  const {menu} = footer || {};
  const groups = FALLBACK_GROUPS;

  const buildUrl = (url) => {
    if (!url) return '/';
    try { return new URL(url).pathname; } catch { return url; }
  };

  return (
    <footer style={{background:'#0a0a0a',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
      <style suppressHydrationWarning>{`
        .vf-cities-row{display:flex;align-items:center;justify-content:space-between;padding:20px 40px;border-bottom:1px solid #1a1a1a;flex-wrap:wrap;gap:12px;}
        .vf-city-item{display:flex;align-items:center;gap:10px;cursor:default;}
        .vf-city-name{font-size:12px;color:#9ca3af;letter-spacing:0.5px;white-space:nowrap;}
        .vf-logo{font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;letter-spacing:8px;color:#c9a84c;text-decoration:none;flex-shrink:0;}

        .vf-main{display:grid;grid-template-columns:1fr 1fr 2fr 1fr;gap:0;border-bottom:1px solid #1a1a1a;}
        .vf-newsletter-col{padding:48px 40px;border-right:1px solid #1a1a1a;}
        .vf-newsletter-label{font-size:13px;color:#9ca3af;line-height:1.7;margin-bottom:24px;}
        .vf-newsletter-label strong{color:#fff;font-weight:600;}
        .vf-newsletter-form{display:flex;margin-bottom:14px;}
        .vf-newsletter-input{flex:1;background:#141414;border:1px solid #2a2a2a;border-right:none;padding:11px 14px;font-size:13px;color:#fff;outline:none;min-width:0;}
        .vf-newsletter-input::placeholder{color:#4b5563;}
        .vf-newsletter-btn{padding:11px 18px;background:transparent;border:1px solid #2a2a2a;color:#9ca3af;font-size:11px;letter-spacing:1.5px;cursor:pointer;white-space:nowrap;transition:all 0.2s;}
        .vf-newsletter-btn:hover{background:#c9a84c;border-color:#c9a84c;color:#0a0a0a;}
        .vf-newsletter-legal{font-size:11px;color:#4b5563;line-height:1.6;}
        .vf-newsletter-legal a{color:#6b7280;text-decoration:underline;}

        .vf-payments-col{padding:48px 40px;border-right:1px solid #1a1a1a;display:flex;flex-direction:column;justify-content:flex-end;}
        .vf-payment-row{display:flex;flex-wrap:wrap;gap:8px;}

        .vf-links-col{padding:48px 0;border-right:1px solid #1a1a1a;}
        .vf-acc-item{border-bottom:1px solid #1a1a1a;}
        .vf-acc-btn{width:100%;background:none;border:none;padding:18px 40px;font-size:13px;color:#e5e7eb;cursor:pointer;text-align:left;display:flex;justify-content:space-between;align-items:center;letter-spacing:0.3px;transition:color 0.2s;}
        .vf-acc-btn:hover{color:#fff;}
        .vf-acc-chevron{font-size:10px;color:#4b5563;transition:transform 0.25s ease;display:inline-block;}
        .vf-acc-chevron.open{transform:rotate(180deg);}
        .vf-acc-links{overflow:hidden;transition:max-height 0.3s ease;}
        .vf-acc-link{display:block;padding:10px 40px 10px 52px;font-size:12px;color:#6b7280;text-decoration:none;transition:color 0.2s;letter-spacing:0.2px;}
        .vf-acc-link:hover{color:#c9a84c;}

        .vf-social-col{padding:48px 40px;display:flex;flex-direction:column;gap:14px;}
        .vf-social-link{display:flex;align-items:center;gap:14px;text-decoration:none;color:#9ca3af;font-size:13px;transition:color 0.2s;letter-spacing:0.3px;}
        .vf-social-link:hover{color:#fff;}
        .vf-social-icon{width:32px;height:32px;border:1px solid #2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:border-color 0.2s;}
        .vf-social-link:hover .vf-social-icon{border-color:#c9a84c;}

        .vf-bottom{padding:18px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;}
        .vf-bottom-copy{font-size:11px;color:#374151;}
        .vf-bottom-links{display:flex;gap:20px;}
        .vf-bottom-link{font-size:11px;color:#374151;text-decoration:none;transition:color 0.2s;}
        .vf-bottom-link:hover{color:#9ca3af;}

        @media(max-width:1024px){
          .vf-main{grid-template-columns:1fr 1fr!important;}
          .vf-payments-col{border-right:none;}
          .vf-social-col{border-top:1px solid #1a1a1a;}
        }
        @media(max-width:640px){
          .vf-cities-row{padding:16px 20px;gap:10px;display:grid;grid-template-columns:1fr 1fr 1fr;}
          .vf-logo{grid-column:1/-1;margin-bottom:4px;}
          .vf-city-item{gap:6px;}
          .vf-city-name{font-size:10px;}
          .vf-main{grid-template-columns:1fr!important;}
          .vf-newsletter-col,.vf-payments-col,.vf-social-col{padding:28px 20px;border-right:none;border-bottom:1px solid #1a1a1a;}
          .vf-links-col{padding:0;border-right:none;}
          .vf-acc-btn{padding:16px 20px;}
          .vf-acc-link{padding:10px 20px 10px 36px;}
          .vf-bottom{padding:16px 20px;flex-direction:column;text-align:center;gap:10px;}
          .vf-bottom-links{flex-wrap:wrap;justify-content:center;}
        }
      `}</style>

      {/* Cities row with animated clocks */}
      <div className="vf-cities-row">
        <Link to="/" className="vf-logo">VASTARA</Link>
        {CITIES.map(({city, timezone, flag}) => (
          <div key={city} className="vf-city-item">
            <AnalogClock timezone={timezone} city={city} />
            <span className="vf-city-name">{flag} {city}</span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="vf-main">

        {/* Newsletter */}
        <div className="vf-newsletter-col">
          <p className="vf-newsletter-label">
            Be the first to know and receive <strong>15% off</strong> an order
          </p>
          <div className="vf-newsletter-form">
            <input type="email" placeholder="Email Address" className="vf-newsletter-input" />
            <button className="vf-newsletter-btn">Subscribe</button>
          </div>
          <p className="vf-newsletter-legal">
            By submitting your email address you are agreeing to the{' '}
            <Link to="/policies/privacy-policy">Privacy Policy</Link> and{' '}
            <Link to="/policies/terms-of-service">Terms &amp; Conditions</Link>.
          </p>
        </div>

        {/* Payment methods */}
        <div className="vf-payments-col">
          <div className="vf-payment-row">
            {PAYMENT_METHODS.map(({name, icon}) => (
              <div key={name} title={name} style={{
                background:'#141414',border:'1px solid #2a2a2a',borderRadius:'4px',
                padding:'4px 6px',display:'flex',alignItems:'center',justifyContent:'center',
                cursor:'default',transition:'border-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#3a3a3a'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#2a2a2a'}>
                {icon}
              </div>
            ))}
          </div>
        </div>

        {/* Accordion links */}
        <FooterAccordion groups={groups} buildUrl={buildUrl} />

        {/* Social links */}
        <div className="vf-social-col">
          {[
            {name:'Instagram', href:'https://www.instagram.com/vastarastore/', icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>},
            {name:'Facebook',  href:'https://www.facebook.com/profile.php?id=100094888641840', icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>},
            {name:'Tiktok',    href:'https://www.tiktok.com/@vastara_store', icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>},
            {name:'Youtube',   href:'https://www.youtube.com/@VASTARA-STORE', icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>},
          ].map(({name, href, icon}) => (
            <a key={name} href={href} className="vf-social-link" target="_blank" rel="noopener noreferrer">
              <span className="vf-social-icon">{icon}</span>
              {name}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="vf-bottom">
        <p className="vf-bottom-copy"><span suppressHydrationWarning>{new Date().getFullYear()}</span> Vastara. All rights reserved.</p>
        <div className="vf-bottom-links">
          {[['Accessibility','/pages/accessibility'],['Privacy Policy','/policies/privacy-policy'],['Terms','/policies/terms-of-service'],['Refund Policy','/policies/refund-policy']].map(([label,href]) => (
            <Link key={label} to={href} className="vf-bottom-link">{label}</Link>
          ))}
        </div>
      </div>

    </footer>
  );
}
