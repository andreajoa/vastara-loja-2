import {useLoaderData, Link} from 'react-router';
import {useContext} from 'react';
import {Analytics} from '@shopify/hydrogen';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import ProductCard from '~/components/ProductCard';
import {CartContext} from '~/components/Layout';

export async function loader({context}) {
  const {storefront} = context;
  const [featuredData, collectionsData] = await Promise.all([
    storefront.query(FEATURED_QUERY),
    storefront.query(COLLECTIONS_QUERY),
  ]);
  return {
    featuredProducts: featuredData?.products?.nodes || [],
    collections: collectionsData?.collections?.nodes || [],
  };
}

export const meta = () => [{title: 'Vastara | Premium Watches'}];

export default function Homepage() {
  const {featuredProducts, collections} = useLoaderData();
  const cart = useContext(CartContext);

  const col1 = collections[0];
  const col2 = collections[1];
  const col3 = collections[2];
  const featured4 = featuredProducts.slice(0, 4);

  return (
    <div style={{paddingTop: '104px', fontFamily: '"DM Sans", sans-serif', background: '#fff'}}>

      <div style={{position: 'relative', width: '100%', height: '75vh', minHeight: '480px', background: '#1a1a2e', overflow: 'hidden'}}>
        {col1?.image ? (
          <img src={col1.image.url} alt="Hero" style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top'}} />
        ) : (
          <div style={{width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'}} />
        )}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'}} />
        <div style={{position: 'absolute', top: 0, left: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 56px 64px'}}>
          <p style={{fontFamily: 'monospace', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '12px'}}>New Collection 2026</p>
          <h1 style={{fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2.5rem, 5vw, 5rem)', color: '#fff', lineHeight: '1.1', marginBottom: '28px', fontWeight: '700'}}>
            Bold Style<br />in Ice Blue
          </h1>
          <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
            <Link to="/collections/all" style={{padding: '12px 28px', background: '#c9a84c', color: '#0a0a0a', textDecoration: 'none', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '600'}}>
              Shop Now
            </Link>
            <Link to="/collections/all" style={{padding: '12px 28px', border: '1px solid rgba(255,255,255,0.6)', color: '#fff', textDecoration: 'none', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '3px', textTransform: 'uppercase'}}>
              Explore All
            </Link>
          </div>
        </div>
      </div>

      {(col2 || col3) && (
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
          {[col2, col3].filter(Boolean).map((col) => (
            <Link key={col.id} to={'/collections/' + col.handle}
              style={{position: 'relative', aspectRatio: '4/3', display: 'block', overflow: 'hidden', textDecoration: 'none', background: '#f0ede8'}}>
              {col.image && (
                <img src={col.image.url} alt={col.title} style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease'}}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              )}
              <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)'}} />
              <div style={{position: 'absolute', bottom: 0, left: 0, padding: '24px 28px', color: '#fff'}}>
                <p style={{fontSize: '10px', fontFamily: 'monospace', letterSpacing: '3px', textTransform: 'uppercase', color: '#e8d5a3', marginBottom: '6px'}}>{col.handle}</p>
                <h3 style={{fontFamily: '"Playfair Display", serif', fontSize: '1.6rem', lineHeight: '1.2', marginBottom: '10px'}}>{col.title}</h3>
                <span style={{fontSize: '11px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase', color: '#c9a84c', borderBottom: '1px solid #c9a84c', paddingBottom: '2px'}}>
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <section style={{padding: '64px 32px', maxWidth: '1400px', margin: '0 auto'}}>
        <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '12px'}}>
          <div>
            <p style={{fontSize: '10px', fontFamily: 'monospace', letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '6px'}}>Curated Selection</p>
            <h2 style={{fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', color: '#0a0a0a'}}>Cut Above the Rest</h2>
          </div>
          <Link to="/collections/all" style={{fontSize: '11px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase', color: '#0a0a0a', textDecoration: 'none', borderBottom: '1px solid #0a0a0a', paddingBottom: '3px'}}>
            View All
          </Link>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px'}}>
          {featured4.map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={cart?.addToCart} />
          ))}
        </div>
      </section>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f7f5f0', minHeight: '420px'}}>
        <div style={{position: 'relative', minHeight: '380px', background: '#e8e4dc', overflow: 'hidden'}}>
          {featuredProducts[0]?.images?.nodes?.[0] ? (
            <img src={featuredProducts[0].images.nodes[0].url} alt={featuredProducts[0].title}
              style={{width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0}} />
          ) : (
            <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', position: 'absolute', inset: 0}}>&#8987;</div>
          )}
          <div style={{position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(255,255,255,0.95)', padding: '12px 16px', maxWidth: '200px'}}>
            <p style={{fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '4px'}}>Featured</p>
            <p style={{fontSize: '13px', fontWeight: '600', color: '#0a0a0a', lineHeight: '1.3'}}>{featuredProducts[0]?.title || 'Premium Timepiece'}</p>
            <Link to={featuredProducts[0] ? '/products/' + featuredProducts[0].handle : '/collections/all'}
              style={{fontSize: '11px', color: '#c9a84c', textDecoration: 'none', fontFamily: 'monospace', letterSpacing: '1px'}}>Shop</Link>
          </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr'}}>
          {featuredProducts.slice(1, 5).map((p, i) => (
            <Link key={p.id} to={'/products/' + p.handle}
              style={{position: 'relative', background: i % 2 === 0 ? '#ede9e0' : '#f5f2eb', overflow: 'hidden', display: 'block', minHeight: '190px', textDecoration: 'none'}}>
              {p.images?.nodes?.[0] && (
                <img src={p.images.nodes[0].url} alt={p.title} style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease'}}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              )}
              <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)'}}>
                <p style={{color: '#fff', fontSize: '11px', fontWeight: '500', lineHeight: '1.2'}}>{p.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#fff'}}>
        <div style={{padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <p style={{fontSize: '10px', fontFamily: 'monospace', letterSpacing: '3px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '24px'}}>Browse By Style</p>
          {[['Best Sellers','best-sellers'],['Military Inspired','military'],['Automatic','automatic'],['Vintage Inspired','vintage'],['Digital','digital']].map(function(item) {
            return (
              <Link key={item[1]} to={'/collections/' + item[1]}
                style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f0ede8', textDecoration: 'none', color: '#0a0a0a', transition: 'color 0.2s'}}
                onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                onMouseLeave={e => e.currentTarget.style.color = '#0a0a0a'}>
                <span style={{fontFamily: '"Playfair Display", serif', fontSize: '1.4rem'}}>{item[0]}</span>
                <span style={{fontSize: '18px', color: '#c9a84c'}}>&#8594;</span>
              </Link>
            );
          })}
        </div>
        <div style={{position: 'relative', minHeight: '420px', background: '#1a1a2e', overflow: 'hidden'}}>
          {featuredProducts[5]?.images?.nodes?.[0] ? (
            <img src={featuredProducts[5].images.nodes[0].url} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : featuredProducts[2]?.images?.nodes?.[0] ? (
            <img src={featuredProducts[2].images.nodes[0].url} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : null}
          <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)'}} />
        </div>
      </div>

      <div>
        <StickyBanner product={featuredProducts[0]} bg="#f0ede6" dark={false} tag="Dive Collection" title="Harborside Coast" subtitle="Water-resistant to 300M. Built for the deep." link="/collections/dive" align="left" index={0} />
        <StickyBanner product={featuredProducts[2]} bg="#1c2331" dark={true} tag="Automatic" title="Automatic 1983 Line" subtitle="The original automatic. Reborn for a new generation." link="/collections/automatic" align="right" index={1} />
        <StickyBanner product={featuredProducts[4]} bg="#fdf8f0" dark={false} tag="Dress Watches" title="Courthouse Men" subtitle="Refined dress watches for the modern gentleman." link="/collections/dress" align="left" index={2} />
      </div>

      <section style={{padding: '96px 24px', textAlign: 'center', background: '#fff'}}>
        <h2 style={{fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', lineHeight: '1.15', color: '#0a0a0a', maxWidth: '680px', margin: '0 auto', fontWeight: '400', fontStyle: 'italic'}}>
          Every watch has<br />a soul and a story<br />to be told.
        </h2>
      </section>

      {collections.length > 0 && (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)'}}>
          {collections.slice(0, 3).map(col => (
            <Link key={col.id} to={'/collections/' + col.handle}
              style={{position: 'relative', aspectRatio: '3/4', display: 'block', overflow: 'hidden', textDecoration: 'none', background: '#e5e7eb'}}>
              {col.image ? (
                <img src={col.image.url} alt={col.title} style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease'}}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              ) : (
                <div style={{width: '100%', height: '100%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px'}}>&#8987;</div>
              )}
              <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)'}} />
              <div style={{position: 'absolute', bottom: 0, left: 0, padding: '28px', color: '#fff'}}>
                <p style={{fontSize: '10px', fontFamily: 'monospace', letterSpacing: '3px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '8px'}}>{col.handle}</p>
                <h3 style={{fontFamily: '"Playfair Display", serif', fontSize: '1.8rem', lineHeight: '1.2'}}>{col.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}

      <section style={{padding: '64px 32px', maxWidth: '1400px', margin: '0 auto'}}>
        <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px'}}>
          <div>
            <p style={{fontSize: '10px', fontFamily: 'monospace', letterSpacing: '3px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '6px'}}>Explore More</p>
            <h2 style={{fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)', color: '#0a0a0a'}}>More to Love</h2>
          </div>
          <Link to="/collections/all" style={{fontSize: '11px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase', color: '#0a0a0a', textDecoration: 'none', borderBottom: '1px solid #0a0a0a', paddingBottom: '3px'}}>
            See All
          </Link>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px'}}>
          {[['Best Sellers','best-sellers','#f0ede8'],['Military','military','#e8ede0'],['Automatic','automatic','#1c2331'],['Vintage','vintage','#ede8e0'],['Digital','digital','#e0e8ed']].map(function(item, i) {
            return (
              <Link key={item[0]} to={'/collections/' + item[1]}
                style={{position: 'relative', aspectRatio: '3/4', background: item[2], display: 'block', overflow: 'hidden', textDecoration: 'none'}}>
                {featuredProducts[i]?.images?.nodes?.[0] && (
                  <img src={featuredProducts[i].images.nodes[0].url} alt={item[0]} style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease'}}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                )}
                <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent 60%)'}} />
                <div style={{position: 'absolute', bottom: '14px', left: '14px', color: '#fff'}}>
                  <p style={{fontSize: '9px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase', color: '#e8d5a3', marginBottom: '3px'}}>Shop</p>
                  <p style={{fontFamily: '"Playfair Display", serif', fontSize: '1rem', lineHeight: '1.2'}}>{item[0]}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Analytics.PageView />
    </div>
  );
}

function StickyBanner({product, bg, dark, tag, title, subtitle, link, align, index}) {
  var img = product?.images?.nodes?.[0];
  return (
    <div className="sticky-banner" style={{height: '100vh', background: bg, display: 'flex', alignItems: 'center', overflow: 'hidden', zIndex: 10 + index}}>
      <div style={{maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '0 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center', direction: align === 'right' ? 'rtl' : 'ltr'}}>
        <div style={{direction: 'ltr'}}>
          <p style={{fontSize: '10px', fontFamily: 'monospace', letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '16px'}}>{tag}</p>
          <h2 style={{fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem, 4vw, 3.8rem)', color: dark ? '#fff' : '#0a0a0a', lineHeight: '1.15', marginBottom: '20px'}}>{title}</h2>
          <p style={{fontSize: '16px', color: dark ? '#9ca3af' : '#4b5563', maxWidth: '380px', lineHeight: '1.7', marginBottom: '32px'}}>{subtitle}</p>
          <Link to={link} style={{display: 'inline-block', padding: '13px 32px', background: '#c9a84c', color: '#0a0a0a', textDecoration: 'none', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '600'}}>
            Shop Now
          </Link>
        </div>
        <div style={{direction: 'ltr', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: '100%', maxWidth: '440px', aspectRatio: '4/5', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', overflow: 'hidden', position: 'relative'}}>
            {img ? (
              <img src={img.url} alt={title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{width: '180px', height: '180px', borderRadius: '50%', border: '3px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px'}}>&#8987;</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURED_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query FeaturedProducts {
    products(first: 8, sortKey: BEST_SELLING) {
      nodes { ...ProductCard }
    }
  }
`;

const COLLECTIONS_QUERY = `#graphql
  query HomepageCollections {
    collections(first: 6, sortKey: UPDATED_AT, reverse: true) {
      nodes { id title handle image { url altText width height } }
    }
  }
`;
