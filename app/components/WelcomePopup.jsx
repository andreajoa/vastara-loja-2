import {useState, useEffect} from 'react';
import {Link} from 'react-router';

export default function WelcomePopup() {
  const [step, setStep] = useState('hidden');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('vastara_popup_shown')) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setCity(data.city || '');
      } catch {}
      setStep('greeting');
      sessionStorage.setItem('vastara_popup_shown', '1');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) { setError('Please enter a valid email address.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/newsletter', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, phone})});
      const data = await res.json();
      if (data.ok) setStep('success');
      else setError(data.error || 'Something went wrong. Please try again.');
    } catch { setError('Something went wrong. Please try again.'); }
    setLoading(false);
  }

  if (step === 'hidden') return null;

  return (
    <div style={{position:'fixed',inset:0,zIndex:99999,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(4px)'}}>

      {step === 'greeting' && (
        <div style={{background:'#fff',borderRadius:'20px',maxWidth:'440px',width:'100%',overflow:'hidden',boxShadow:'0 32px 100px rgba(0,0,0,0.3)',position:'relative'}}>
          <div style={{height:'180px',background:'#0a0a0a',position:'relative',overflow:'hidden'}}>
            <img src="https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_1.jpg" alt="Vastara" style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.6}} />
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.7))'}} />
            <div style={{position:'absolute',bottom:'16px',left:'24px'}}>
              <p style={{fontSize:'10px',letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,0.7)',marginBottom:'4px'}}>Premium Timepieces</p>
              <p style={{fontFamily:'Georgia,serif',fontSize:'22px',color:'#fff',fontWeight:'400',margin:0}}>VASTARA</p>
            </div>
          </div>
          <button onClick={()=>setStep('hidden')} style={{position:'absolute',top:'12px',right:'12px',background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',color:'#fff',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          <div style={{padding:'28px 28px 32px'}}>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:'400',color:'#0a0a0a',marginBottom:'10px',lineHeight:'1.3'}}>Welcome to Vastara</h2>
            <p style={{fontSize:'13px',color:'#6b7280',lineHeight:'1.7',marginBottom:'20px'}}>
              We noticed you're visiting our store{city ? ` from ${city}` : ''}.<br />
              Happy shopping — we deliver safely and securely to you. 🛡️
            </p>
            <div style={{background:'#f9f9f7',borderRadius:'12px',padding:'14px 18px',marginBottom:'20px',display:'flex',alignItems:'center',gap:'12px'}}>
              <span style={{fontSize:'24px'}}>🎁</span>
              <div>
                <p style={{fontSize:'12px',fontWeight:'600',color:'#0a0a0a',margin:'0 0 2px'}}>Get 15% off your first order</p>
                <p style={{fontSize:'11px',color:'#9ca3af',margin:0}}>Subscribe and receive your exclusive discount code</p>
              </div>
            </div>
            <button onClick={()=>setStep('signup')} style={{width:'100%',padding:'15px',background:'#0a0a0a',color:'#fff',border:'none',borderRadius:'12px',fontSize:'12px',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer',fontWeight:'600',marginBottom:'10px'}}>
              Claim My 15% Off
            </button>
            <button onClick={()=>setStep('hidden')} style={{width:'100%',padding:'10px',background:'none',border:'none',fontSize:'12px',color:'#9ca3af',cursor:'pointer'}}>
              No thanks, I'll pay full price
            </button>
          </div>
        </div>
      )}

      {step === 'signup' && (
        <div style={{background:'#fff',borderRadius:'20px',padding:'36px 32px',maxWidth:'420px',width:'100%',boxShadow:'0 32px 100px rgba(0,0,0,0.3)',position:'relative'}}>
          <button onClick={()=>setStep('hidden')} style={{position:'absolute',top:'16px',right:'16px',background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#ccc'}}>✕</button>
          <div style={{textAlign:'center',marginBottom:'24px'}}>
            <div style={{fontSize:'36px',marginBottom:'8px'}}>📧</div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:'400',color:'#0a0a0a',marginBottom:'6px'}}>Get Your 15% Off</h2>
            <p style={{fontSize:'13px',color:'#9ca3af'}}>Enter your details to receive your exclusive code</p>
          </div>
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email Address *" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%',padding:'13px 16px',border:'1px solid #e5e7eb',borderRadius:'10px',fontSize:'13px',marginBottom:'12px',boxSizing:'border-box',outline:'none'}} />
            <input type="tel" placeholder="Phone Number (optional)" value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%',padding:'13px 16px',border:'1px solid #e5e7eb',borderRadius:'10px',fontSize:'13px',marginBottom:'16px',boxSizing:'border-box',outline:'none'}} />
            {error && <p style={{fontSize:'11px',color:'#ef4444',marginBottom:'10px'}}>{error}</p>}
            <button type="submit" disabled={loading} style={{width:'100%',padding:'15px',background:'#0a0a0a',color:'#fff',border:'none',borderRadius:'12px',fontSize:'12px',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer',fontWeight:'600',marginBottom:'12px'}}>
              {loading ? 'Subscribing...' : 'Subscribe & Get 15% Off'}
            </button>
            <p style={{fontSize:'10px',color:'#9ca3af',textAlign:'center',lineHeight:'1.6'}}>
              By subscribing you agree to our <Link to="/policies/privacy-policy" style={{color:'#9ca3af'}}>Privacy Policy</Link>. Unsubscribe anytime.
            </p>
          </form>
        </div>
      )}

      {step === 'success' && (
        <div style={{background:'#fff',borderRadius:'20px',padding:'40px 32px',maxWidth:'400px',width:'100%',textAlign:'center',boxShadow:'0 32px 100px rgba(0,0,0,0.3)',position:'relative'}}>
          <button onClick={()=>setStep('hidden')} style={{position:'absolute',top:'16px',right:'16px',background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#ccc'}}>✕</button>
          <div style={{fontSize:'48px',marginBottom:'12px'}}>🎉</div>
          <h3 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:'400',marginBottom:'8px',color:'#0a0a0a'}}>You're In!</h3>
          <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'24px',lineHeight:'1.6'}}>Welcome to the Vastara family. Here's your exclusive discount code:</p>
          <div style={{background:'#f9f9f7',border:'2px dashed #c9a84c',borderRadius:'12px',padding:'20px 24px',marginBottom:'20px'}}>
            <p style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#9ca3af',marginBottom:'8px'}}>Your discount code</p>
            <p style={{fontSize:'32px',fontWeight:'700',letterSpacing:'5px',color:'#0a0a0a',fontFamily:'monospace',margin:'0 0 6px'}}>VFIRST15</p>
            <p style={{fontSize:'11px',color:'#c9a84c',margin:0}}>15% off your first order</p>
          </div>
          <button onClick={()=>navigator.clipboard?.writeText('VFIRST15')} style={{width:'100%',padding:'14px',background:'#0a0a0a',color:'#fff',border:'none',borderRadius:'12px',fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer',marginBottom:'12px',fontWeight:'600'}}>
            Copy Code
          </button>
          <Link to="/collections" onClick={()=>setStep('hidden')} style={{fontSize:'12px',color:'#9ca3af',textDecoration:'underline',display:'block'}}>
            Start Shopping →
          </Link>
        </div>
      )}
    </div>
  );
}
