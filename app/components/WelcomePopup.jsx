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
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, phone}),
      });
      const data = await res.json();
      if (data.ok) setStep('success');
      else setError(data.error || 'Something went wrong. Please try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  if (step === 'hidden') return null;

  const overlay = {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    background: 'rgba(0,0,0,0.80)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backdropFilter: 'blur(6px)',
  };

  const card = {
    background: '#0c0c0c',
    borderRadius: '16px',
    maxWidth: '420px',
    width: '100%',
    overflow: 'hidden',
    border: '0.5px solid rgba(255,255,255,0.10)',
    position: 'relative',
  };

  const closeBtn = {
    position: 'absolute',
    top: '14px',
    right: '14px',
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  };

  const goldBar = {
    width: '2px',
    height: '32px',
    background: 'rgba(201,168,76,0.7)',
    borderRadius: '2px',
    flexShrink: 0,
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#fff',
    marginBottom: '10px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const ctaBtn = {
    width: '100%',
    padding: '14px',
    background: '#c9a84c',
    color: '#0c0c0c',
    border: 'none',
    borderRadius: '8px',
    fontSize: '10px',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontWeight: '700',
    marginBottom: '12px',
    fontFamily: 'inherit',
  };

  return (
    <div style={overlay}>

      {step === 'greeting' && (
        <div style={card}>
          <div style={{height: '200px', position: 'relative', overflow: 'hidden'}}>
            <img
              src="https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_1.jpg"
              alt="Vastara"
              style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45}}
            />
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(12,12,12,0) 0%, rgba(12,12,12,0.97) 100%)'}} />
            <div style={{position: 'absolute', bottom: '20px', left: '24px'}}>
              <p style={{fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 6px'}}>
                Precision Timepieces
              </p>
              <p style={{fontSize: '24px', letterSpacing: '8px', color: '#fff', fontWeight: '400', margin: 0}}>
                VASTARA
              </p>
            </div>
          </div>

          <button onClick={() => setStep('hidden')} style={closeBtn}>✕</button>

          <div style={{padding: '28px 28px 32px'}}>
            <p style={{fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 10px'}}>
              {city ? `Welcome from ${city}` : 'Member Privilege'}
            </p>
            <h2 style={{fontSize: '20px', fontWeight: '400', color: '#fff', margin: '0 0 10px', lineHeight: '1.35'}}>
              An exclusive offer,<br />for new members only.
            </h2>
            <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: '1.85', margin: '0 0 24px'}}>
              Join Vastara and receive a private discount on your first timepiece — along with early access to new arrivals and members-only releases.
            </p>

            <div style={{borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '24px'}}>
              {[
                ['Private member discount', 'Applied automatically at checkout'],
                ['Early access to new arrivals', 'Before they reach the public'],
                ['Free worldwide shipping', 'USA · UK · Canada · Australia'],
              ].map(([title, sub]) => (
                <div key={title} style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px'}}>
                  <div style={goldBar} />
                  <div>
                    <p style={{fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: '0 0 2px'}}>{title}</p>
                    <p style={{fontSize: '10px', color: 'rgba(255,255,255,0.25)', margin: 0}}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setStep('signup')} style={ctaBtn}>
              Claim My Offer
            </button>
            <button onClick={() => setStep('hidden')} style={{width: '100%', padding: '10px', background: 'none', border: 'none', fontSize: '11px', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontFamily: 'inherit'}}>
              No thanks, I'll pay full price
            </button>
          </div>
        </div>
      )}

      {step === 'signup' && (
        <div style={{...card, padding: '36px 32px'}}>
          <button onClick={() => setStep('hidden')} style={closeBtn}>✕</button>

          <p style={{fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 10px'}}>
            Member Privilege
          </p>
          <h2 style={{fontSize: '20px', fontWeight: '400', color: '#fff', margin: '0 0 8px', lineHeight: '1.35'}}>
            Your offer awaits.
          </h2>
          <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: '1.8', margin: '0 0 28px'}}>
            Enter your details and we'll send your exclusive discount directly to your inbox.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{...inputStyle, marginBottom: '16px'}}
            />
            {error && (
              <p style={{fontSize: '11px', color: '#ef4444', marginBottom: '10px'}}>{error}</p>
            )}
            <button type="submit" disabled={loading} style={ctaBtn}>
              {loading ? 'Please wait...' : 'Get My Offer'}
            </button>
            <p style={{fontSize: '10px', color: 'rgba(255,255,255,0.18)', textAlign: 'center', lineHeight: '1.7', margin: 0}}>
              No spam. Unsubscribe at any time.{' '}
              <Link to="/policies/privacy-policy" style={{color: 'rgba(255,255,255,0.3)'}}>
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      )}

      {step === 'success' && (
        <div style={{...card, padding: '40px 32px', textAlign: 'center'}}>
          <button onClick={() => setStep('hidden')} style={closeBtn}>✕</button>

          <div style={{width: '48px', height: '2px', background: '#c9a84c', margin: '0 auto 24px', borderRadius: '2px'}} />

          <p style={{fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 10px'}}>
            Welcome to Vastara
          </p>
          <h3 style={{fontSize: '22px', fontWeight: '400', color: '#fff', margin: '0 0 10px', lineHeight: '1.3'}}>
            You're in.
          </h3>
          <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: '0 0 28px', lineHeight: '1.8'}}>
            Your exclusive discount code is ready. Use it on any timepiece from our collection.
          </p>

          <div style={{background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(201,168,76,0.35)', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px'}}>
            <p style={{fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '10px'}}>
              Your discount code
            </p>
            <p style={{fontSize: '28px', fontWeight: '600', letterSpacing: '6px', color: '#c9a84c', fontFamily: 'monospace', margin: '0 0 8px'}}>
              VFIRST15
            </p>
            <p style={{fontSize: '10px', color: 'rgba(255,255,255,0.25)', margin: 0}}>
              15% off — valid on your first order
            </p>
          </div>

          <button onClick={() => navigator.clipboard?.writeText('VFIRST15')} style={ctaBtn}>
            Copy Code
          </button>

          <Link
            to="/collections"
            onClick={() => setStep('hidden')}
            style={{fontSize: '11px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'block', letterSpacing: '1px'}}
          >
            Start shopping →
          </Link>
        </div>
      )}
    </div>
  );
}
