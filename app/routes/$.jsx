import {Link} from 'react-router';

export const meta = () => {
  const title = 'Page Not Found | Vastara';
  return [
    {title},
    {name: 'description', content: 'The page you are looking for could not be found. Browse our collection of premium luxury watches.'},
    {tagName: 'link', rel: 'canonical', href: 'https://vastara.online/404'},
    {name: 'robots', content: 'noindex, follow'},
  ];
};

export default function NotFound() {
  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '40px 20px'}}>
      <style>{`
        .nf-container { text-align: center; max-width: 500px; }
        .nf-code { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(80px, 15vw, 150px); font-weight: 300; color: #c9a84c; line-height: 1; margin-bottom: 20px; }
        .nf-title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(24px, 4vw, 36px); color: #fff; margin-bottom: 16px; font-weight: 300; }
        .nf-text { font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.7; margin-bottom: 32px; }
        .nf-btn { display: inline-block; padding: 14px 32px; background: #c9a84c; color: #0a0a0a; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; border-radius: 4px; transition: all 0.2s; }
        .nf-btn:hover { background: #b8943d; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.25); }
        .nf-links { margin-top: 40px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); }
        .nf-links-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 20px; }
        .nf-link { display: block; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 13px; padding: 8px 0; transition: color 0.2s; }
        .nf-link:hover { color: #c9a84c; }
      `}</style>

      <div className="nf-container">
        <div className="nf-code">404</div>
        <h1 className="nf-title">Page Not Found</h1>
        <p className="nf-text">
          The page you're looking for has been moved, removed, or never existed.
          Browse our collection of premium timepieces.
        </p>
        <Link to="/" className="nf-btn">Back to Home</Link>

        <div className="nf-links">
          <div className="nf-links-title">Quick Links</div>
          <Link to="/collections" className="nf-link">All Collections</Link>
          <Link to="/collections/new-arrivals" className="nf-link">New Arrivals</Link>
          <Link to="/collections/mens-watches" className="nf-link">Men's Watches</Link>
          <Link to="/collections/womens-watches" className="nf-link">Women's Watches</Link>
          <Link to="/blogs/news" className="nf-link">Watch Blog</Link>
          <Link to="/policies/shipping-policy" className="nf-link">Shipping Policy</Link>
          <Link to="/contact" className="nf-link">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
