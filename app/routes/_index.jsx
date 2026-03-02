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
  const p = featuredProducts;

  return (
    <div style={{paddingTop:'104px',fontFamily:'"DM Sans",sans-serif',background:'#fff'}}>
      <style>{`
        .hp-hero{position:relative;width:100%;height:80vh;min-height:480px;background:#1a1a2e;overflow:hidden}
        .hp-hero img{width:100%;height:100%;object-fit:cover;object-position:center top}
        .hp-hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.72),rgba(0,0,0,0.18) 60%,transparent)}
        .hp-hero-text{position:absolute;bottom:0;left:0;padding:0 56px 64px}
        .btn-gold{padding:12px 28px;background:#c9a84c;color:#0a0a0a;text-decoration:none;font-size:11px;font-family:monospace;letter-spacing:3px;text-transform:uppercase;font-weight:600;display:inline-block}
        .btn-ghost{padding:12px 28px;border:1px solid rgba(255,255,255,0.6);color:#fff;text-decoration:none;font-size:11px;font-family:monospace;letter-spacing:3px;text-transform:uppercase;display:inline-block}
        .hp-2col{display:grid;grid-template-columns:1fr 1fr}
        .hp-ccard{position:relative;aspect-ratio:4/3;display:block;overflow:hidden;text-decoration:none;background:#f0ede8}
        .hp-ccard img{width:100%;height:100%;object-fit:cover;transition:transform 0.7s}
        .hp-ccard:hover img{transform:scale(1.04)}
        .hp-sec{padding:64px 32px;max-width:1400px;margin:0 auto}
        .hp-pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px}
        .hp-edit{display:grid;grid-template-columns:1fr 1fr;background:#f7f5f0}
        .hp-edit-l{position:relative;min-height:400px;overflow:hidden;background:#e8e4dc}
        .hp-edit-l img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
        .hp-edit-r{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}
        .hp-ecell{position:relative;min-height:200px;overflow:hidden;display:block;text-decoration:none}
        .hp-ecell img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s}
        .hp-ecell:hover img{transform:scale(1.05)}
        .hp-catlist{display:grid;grid-template-columns:1fr 1fr;background:#fff}
        .hp-catlist-l{padding:56px 48px;display:flex;flex-direction:column;justify-content:center}
        .hp-catlist-r{position:relative;min-height:420px;overflow:hidden;background:#1a1a2e}
        .hp-catlist-r img{width:100%;height:100%;object-fit:cover}
        .hp-cat-row{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid #f0ede8;text-decoration:none;color:#0a0a0a;transition:color 0.2s}
        .hp-cat-row:hover{color:#c9a84c}
        .hp-stky-wrap{position:relative}
        .hp-stky{height:100vh;display:flex;align-items:center;overflow:hidden;position:sticky;top:0}
        .hp-stky-in{max-width:1400px;margin:0 auto;width:100%;padding:0 56px;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
        .hp-stky-img{width:100%;max-width:440px;aspect-ratio:4/5;overflow:hidden}
        .hp-stky-img img{width:100%;height:100%;object-fit:cover}
        .hp-quote{padding:96px 24px;text-align:center;background:#fff}
        .hp-quote h2{font-family:"Playfair Display",serif;font-size:clamp(2.5rem,6vw,5.5rem);line-height:1.15;color:#0a0a0a;max-width:680px;margin:0 auto;font-weight:400;font-style:italic}
        .hp-cgrid{display:grid;grid-template-columns:repeat(3,1fr)}
        .hp-citem{position:relative;aspect-ratio:3/4;display:block;overflow:hidden;text-decoration:none;background:#e5e7eb}
        .hp-citem img{width:100%;height:100%;object-fit:cover;transition:transform 0.8s}
        .hp-citem:hover img{transform:scale(1.04)}
        .hp-mlgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
        .hp-mlitem{position:relative;aspect-ratio:3/4;display:block;overflow:hidden;text-decoration:none}
        .hp-mlitem img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s}
        .hp-mlitem:hover img{transform:scale(1.05)}
        @media(max-width:900px){
          .hp-2col,.hp-edit,.hp-catlist{grid-template-columns:1fr}
          .hp-edit-r{grid-template-columns:1fr 1fr}
          .hp-ecell{min-height:140px}
          .hp-catlist-r{min-height:260px}
          .hp-catlist-l{padding:32px 24px}
          .hp-stky-in{grid-template-columns:1fr;padding:0 24px;gap:24px}
          .hp-stky{height:auto;min-height:60vh;padding:40px 0;position:relative}
          .hp-stky-img{max-width:100%;aspect-ratio:16/9}
          .hp-cgrid{grid-template-columns:repeat(2,1fr)}
          .hp-mlgrid{grid-template-columns:repeat(3,1fr)}
          .hp-sec{padding:40px 20px}
        }
        @media(max-width:600px){
          .hp-hero{height:60vh;min-height:360px}
          .hp-hero-text{padding:0 20px 32px}
          .hp-pgrid{grid-template-columns:repeat(2,1fr);gap:12px}
          .hp-edit-r{grid-template-columns:1fr}
          .hp-cgrid,.hp-mlgrid{grid-template-columns:repeat(2,1fr)}
          .hp-quote{padding:56px 20px}
        }
      `}</style>

      {/* HERO */}
      <div className="hp-hero">
        {col1?.image
          ? <img src={col1.image.url} alt="Hero" />
          : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#1a1a2e,#0f3460)'}} />}
        <div className="hp-hero-overlay" />
        <div className="hp-hero-text">
          <p style={{fontFamily:'monospace',fontSize:'11px',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'12px'}}>New Collection 2026</p>
          <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(2.5rem,5vw,5rem)',color:'#fff',lineHeight:'1.1',marginBottom:'28px',fontWeight:'700'}}>Bold Style<br/>in Ice Blue</h1>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
            <Link to="/collections/all" className="btn-gold">Shop Now</Link>
            <Link to="/collections/all" className="btn-ghost">Explore All</Link>
          </div>
        </div>
      </div>

      {/* TWO COLUMN COLLECTIONS */}
      {(col2||col3) && (
        <div className="hp-2col">
          {[col2,col3].filter(Boolean).map(col => (
            <Link key={col.id} to={'/collections/'+col.handle} className="hp-ccard">
              {col.image && <img src={col.image.url} alt={col.title} />}
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.55),transparent 50%)'}} />
              <div style={{position:'absolute',bottom:0,left:0,padding:'24px 28px',color:'#fff'}}>
                <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',color:'#e8d5a3',marginBottom:'6px'}}>{col.handle}</p>
                <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:'1.6rem',lineHeight:'1.2',marginBottom:'10px'}}>{col.title}</h3>
                <span style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a84c',borderBottom:'1px solid #c9a84c',paddingBottom:'2px'}}>Shop Now</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="hp-sec">
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'40px',flexWrap:'wrap',gap:'12px'}}>
          <div>
            <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'6px'}}>Curated Selection</p>
            <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(1.8rem,3.5vw,3rem)',color:'#0a0a0a'}}>Cut Above the Rest</h2>
          </div>
          <Link to="/collections/all" style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',color:'#0a0a0a',textDecoration:'none',borderBottom:'1px solid #0a0a0a',paddingBottom:'3px'}}>View All</Link>
        </div>
        <div className="hp-pgrid">
          {p.slice(0,4).map(prod => <ProductCard key={prod.id} product={prod} onAddToCart={cart?.addToCart} />)}
        </div>
      </section>

      {/* EDITORIAL MIXED */}
      <div className="hp-edit">
        <div className="hp-edit-l">
          {p[0]?.images?.nodes?.[0] && <img src={p[0].images.nodes[0].url} alt={p[0].title} />}
          <div style={{position:'absolute',bottom:'20px',left:'20px',background:'rgba(255,255,255,0.96)',padding:'12px 16px',maxWidth:'210px'}}>
            <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'4px'}}>Featured</p>
            <p style={{fontSize:'13px',fontWeight:'600',color:'#0a0a0a',lineHeight:'1.3',marginBottom:'4px'}}>{p[0]?.title||'Premium Timepiece'}</p>
            <Link to={p[0]?'/products/'+p[0].handle:'/collections/all'} style={{fontSize:'11px',color:'#c9a84c',textDecoration:'none',fontFamily:'monospace'}}>Shop</Link>
          </div>
        </div>
        <div className="hp-edit-r">
          {p.slice(1,5).map((prod,i) => (
            <Link key={prod.id} to={'/products/'+prod.handle} className="hp-ecell" style={{background:i%2===0?'#ede9e0':'#f5f2eb'}}>
              {prod.images?.nodes?.[0] && <img src={prod.images.nodes[0].url} alt={prod.title} />}
              <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px',background:'linear-gradient(to top,rgba(0,0,0,0.5),transparent)'}}>
                <p style={{color:'#fff',fontSize:'11px',fontWeight:'500'}}>{prod.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CATEGORY LIST + IMAGE */}
      <div className="hp-catlist">
        <div className="hp-catlist-l">
          <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'24px'}}>Browse By Style</p>
          {[['Best Sellers','best-sellers'],['Military Inspired','military'],['Automatic','automatic'],['Vintage Inspired','vintage'],['Digital','digital']].map(([label,handle]) => (
            <Link key={handle} to={'/collections/'+handle} className="hp-cat-row">
              <span style={{fontFamily:'"Playfair Display",serif',fontSize:'1.4rem'}}>{label}</span>
              <span style={{fontSize:'18px',color:'#c9a84c'}}>&rarr;</span>
            </Link>
          ))}
        </div>
        <div className="hp-catlist-r">
          {(p[5]||p[2])?.images?.nodes?.[0] && <img src={(p[5]||p[2]).images.nodes[0].url} alt="" />}
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.2)'}} />
        </div>
      </div>

      {/* STICKY STACKING BANNERS */}
      <div className="hp-stky-wrap">
        {[
          {prod:p[0],bg:'#f0ede6',dark:false,tag:'Dive Collection',title:'Harborside Coast',sub:'Water-resistant to 300M. Built for the deep.',link:'/collections/dive',rev:false},
          {prod:p[2],bg:'#1c2331',dark:true,tag:'Automatic',title:'Automatic 1983 Line',sub:'The original automatic. Reborn for a new generation.',link:'/collections/automatic',rev:true},
          {prod:p[4],bg:'#fdf8f0',dark:false,tag:'Dress Watches',title:'Courthouse Men',sub:'Refined dress watches for the modern gentleman.',link:'/collections/dress',rev:false},
        ].map(({prod,bg,dark,tag,title,sub,link,rev},i) => {
          const img = prod?.images?.nodes?.[0];
          return (
            <div key={i} className="hp-stky" style={{background:bg,zIndex:10+i}}>
              <div className="hp-stky-in" style={{direction:rev?'rtl':'ltr'}}>
                <div style={{direction:'ltr'}}>
                  <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'16px'}}>{tag}</p>
                  <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(2rem,4vw,3.8rem)',color:dark?'#fff':'#0a0a0a',lineHeight:'1.15',marginBottom:'20px'}}>{title}</h2>
                  <p style={{fontSize:'16px',color:dark?'#9ca3af':'#4b5563',maxWidth:'380px',lineHeight:'1.7',marginBottom:'32px'}}>{sub}</p>
                  <Link to={link} className="btn-gold">Shop Now</Link>
                </div>
                <div style={{direction:'ltr',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div className="hp-stky-img" style={{background:dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'}}>
                    {img
                      ? <img src={img.url} alt={title} />
                      : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'64px'}}>&#8987;</div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUOTE */}
      <div className="hp-quote">
        <h2>Every watch has<br/>a soul and a story<br/>to be told.</h2>
      </div>

      {/* COLLECTIONS GRID */}
      {collections.length > 0 && (
        <div className="hp-cgrid">
          {collections.slice(0,3).map(col => (
            <Link key={col.id} to={'/collections/'+col.handle} className="hp-citem">
              {col.image
                ? <img src={col.image.url} alt={col.title} />
                : <div style={{width:'100%',height:'100%',background:'#1a1a2e'}} />}
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent 50%)'}} />
              <div style={{position:'absolute',bottom:0,left:0,padding:'28px',color:'#fff'}}>
                <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'8px'}}>{col.handle}</p>
                <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:'1.8rem',lineHeight:'1.2'}}>{col.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* MORE TO LOVE */}
      <section className="hp-sec">
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'32px',flexWrap:'wrap',gap:'12px'}}>
          <div>
            <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'6px'}}>Explore More</p>
            <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(1.5rem,2.5vw,2.2rem)',color:'#0a0a0a'}}>More to Love</h2>
          </div>
          <Link to="/collections/all" style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',color:'#0a0a0a',textDecoration:'none',borderBottom:'1px solid #0a0a0a',paddingBottom:'3px'}}>See All</Link>
        </div>
        <div className="hp-mlgrid">
          {[['Best Sellers','best-sellers','#f0ede8'],['Military','military','#e8ede0'],['Automatic','automatic','#1c2331'],['Vintage','vintage','#ede8e0'],['Digital','digital','#e0e8ed']].map(([cat,handle,bg],i) => (
            <Link key={cat} to={'/collections/'+handle} className="hp-mlitem" style={{background:bg}}>
              {p[i]?.images?.nodes?.[0] && <img src={p[i].images.nodes[0].url} alt={cat} />}
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.65),transparent 60%)'}} />
              <div style={{position:'absolute',bottom:'14px',left:'14px',color:'#fff'}}>
                <p style={{fontSize:'9px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',color:'#e8d5a3',marginBottom:'3px'}}>Shop</p>
                <p style={{fontFamily:'"Playfair Display",serif',fontSize:'1rem'}}>{cat}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Analytics.PageView />
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