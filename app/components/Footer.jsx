import {Link} from 'react-router';

export default function Footer({footer}) {
  const {menu} = footer || {};
  const groups = menu?.items || [];

  const buildUrl = (url) => {
    if (!url) return '/';
    try { return new URL(url).pathname; } catch { return url; }
  };

  return (
    <footer style={{background:'#0a0a0a',color:'#fff'}}>
      <div style={{maxWidth:'1600px',margin:'0 auto',padding:'64px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'48px',marginBottom:'48px'}}>
          <div>
            <div style={{fontFamily:'"Playfair Display",serif',fontSize:'22px',fontWeight:'700',letterSpacing:'6px',color:'#c9a84c',marginBottom:'16px'}}>
              VASTARA
            </div>
            <p style={{fontSize:'13px',color:'#9ca3af',lineHeight:'1.8',marginBottom:'24px'}}>
              Every watch has a soul and a story to be told. Timepieces crafted for those who live with purpose.
            </p>
            <div style={{display:'flex',gap:'8px'}}>
              {['IG','FB','TW','YT'].map(s => (
                <a key={s} href="#" style={{width:'32px',height:'32px',border:'1px solid #374151',display:'flex',
                  alignItems:'center',justifyContent:'center',fontSize:'11px',fontFamily:'monospace',
                  color:'#9ca3af',textDecoration:'none',transition:'all 0.2s'}}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#c9a84c'; e.currentTarget.style.color='#c9a84c'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='#374151'; e.currentTarget.style.color='#9ca3af'; }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {groups.slice(0, 2).map(section => (
            <div key={section.id}>
              <h3 style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'16px'}}>
                {section.title}
              </h3>
              <ul style={{listStyle:'none'}}>
                {(section.items?.length > 0 ? section.items : [section]).map(item => (
                  <li key={item.id} style={{marginBottom:'8px'}}>
                    <Link to={buildUrl(item.url)} style={{fontSize:'13px',color:'#9ca3af',textDecoration:'none',transition:'color 0.2s'}}
                      onMouseEnter={e => e.target.style.color='#fff'}
                      onMouseLeave={e => e.target.style.color='#9ca3af'}>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'16px'}}>
              Newsletter
            </h3>
            <p style={{fontSize:'13px',color:'#9ca3af',marginBottom:'16px'}}>Subscribe for exclusive offers and new arrivals.</p>
            <div style={{display:'flex'}}>
              <input type="email" placeholder="your@email.com"
                style={{flex:1,background:'transparent',border:'1px solid #374151',padding:'8px 12px',
                  fontSize:'13px',color:'#fff',outline:'none'}} />
              <button style={{padding:'8px 16px',background:'#c9a84c',color:'#0a0a0a',border:'none',
                fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',cursor:'pointer'}}>
                JOIN
              </button>
            </div>
          </div>
        </div>

        <div style={{borderTop:'1px solid #1f2937',paddingTop:'24px',display:'flex',flexWrap:'wrap',
          justifyContent:'space-between',alignItems:'center',gap:'16px'}}>
          <p style={{fontSize:'12px',color:'#6b7280'}}>© {new Date().getFullYear()} Vastara. All rights reserved.</p>
          <div style={{display:'flex',gap:'24px'}}>
            {[['Privacy','/policies/privacy-policy'],['Terms','/policies/terms-of-service'],['Refunds','/policies/refund-policy']].map(([label,href]) => (
              <Link key={label} to={href} style={{fontSize:'12px',color:'#6b7280',textDecoration:'none'}}
                onMouseEnter={e => e.target.style.color='#9ca3af'}
                onMouseLeave={e => e.target.style.color='#6b7280'}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
