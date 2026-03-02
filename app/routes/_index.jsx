import {defer} from '@shopify/hydrogen';
import {Await, useLoaderData, Link} from 'react-router';
import {Suspense, useContext} from 'react';
import {Analytics} from '@shopify/hydrogen';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import ProductCard from '~/components/ProductCard';
import {CartContext} from '~/components/Layout';

export async function loader({context}) {
  const {storefront} = context;
  return defer({
    featuredProducts: storefront.query(FEATURED_QUERY),
    collections: storefront.query(COLLECTIONS_QUERY),
  });
}

export const meta = () => [{title:'Vastara | Premium Watches'}];

export default function Homepage() {
  const {featuredProducts, collections} = useLoaderData();
  const cart = useContext(CartContext);

  return (
    <div style={{paddingTop:'104px'}}>

      {/* HERO */}
      <div style={{position:'relative',width:'100%',height:'80vh',minHeight:'520px',background:'#1a1a2e',display:'flex',alignItems:'flex-end'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.2) 100%)'}} />
        <div style={{position:'relative',zIndex:2,padding:'0 64px 80px'}}>
          <p style={{fontFamily:'monospace',fontSize:'11px',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'16px'}}>New Collection 2026</p>
          <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(3rem,7vw,6rem)',color:'#fff',lineHeight:'1.1',marginBottom:'32px'}}>
            Bold Style<br/>in Ice Blue
          </h1>
          <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
            <Link to="/collections/all" style={{padding:'14px 36px',background:'#c9a84c',color:'#0a0a0a',textDecoration:'none',fontSize:'12px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase'}}>
              Shop Now
            </Link>
            <Link to="/collections/all" style={{padding:'14px 36px',border:'1px solid #fff',color:'#fff',textDecoration:'none',fontSize:'12px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase'}}>
              Explore All
            </Link>
          </div>
        </div>
      </div>

      {/* FEATURED */}
      <section style={{padding:'80px 24px',maxWidth:'1600px',margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'48px'}}>
          <div>
            <p style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'8px'}}>Curated Selection</p>
            <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(2rem,4vw,3.5rem)'}}>Cut Above the Rest</h2>
          </div>
          <Link to="/collections/all" style={{fontSize:'12px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',color:'#0a0a0a',textDecoration:'none',borderBottom:'1px solid #0a0a0a',paddingBottom:'4px'}}>
            View All
          </Link>
        </div>
        <Suspense fallback={<GridSkeleton />}>
          <Await resolve={featuredProducts}>
            {(data) => (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'24px'}}>
                {data?.products?.nodes?.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={cart?.addToCart} />
                ))}
              </div>
            )}
          </Await>
        </Suspense>
      </section>

      {/* STICKY STACKING BANNERS */}
      <div>
        <StickyBanner
          bg="#f3f0eb" dark={false} tag="Dive Collection"
          title="Harborside Coast" subtitle="Water-resistant to 300M. Built for the deep."
          link="/collections/dive" align="left"
        />
        <StickyBanner
          bg="#1c2331" dark={true} tag="Automatic"
          title="Automatic 1983 Line" subtitle="The original automatic. Reborn for a new generation."
          link="/collections/automatic" align="right"
        />
        <StickyBanner
          bg="#fdf8f0" dark={false} tag="Dress Watches"
          title="Courthouse Men" subtitle="Refined dress watches for the modern gentleman."
          link="/collections/dress" align="left"
        />
      </div>

      {/* QUOTE */}
      <section style={{padding:'96px 24px',textAlign:'center',background:'#0a0a0a',color:'#fff'}}>
        <p style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'24px'}}>Our Philosophy</p>
        <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(2.5rem,6vw,5rem)',lineHeight:'1.2',maxWidth:'700px',margin:'0 auto'}}>
          Every watch has<br/>a soul and a story<br/>to be told.
        </h2>
      </section>

      {/* COLLECTIONS GRID */}
      <Suspense fallback={null}>
        <Await resolve={collections}>
          {(data) => <CollectionsGrid collections={data?.collections?.nodes} />}
        </Await>
      </Suspense>

      {/* CATEGORIES */}
      <section style={{padding:'80px 24px',maxWidth:'1600px',margin:'0 auto'}}>
        <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'2rem',marginBottom:'40px'}}>More to Love</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'16px'}}>
          {['Best Sellers','Military','Automatic','Vintage','Digital'].map(cat => (
            <Link key={cat} to={`/collections/${cat.toLowerCase().replace(/\s+/g,'-')}`}
              style={{position:'relative',aspectRatio:'3/4',background:'#e5e7eb',display:'block',overflow:'hidden',textDecoration:'none'}}>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.75),transparent)'}} />
              <div style={{position:'absolute',bottom:'16px',left:'16px',color:'#fff'}}>
                <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',color:'#e8d5a3',marginBottom:'4px'}}>Shop</p>
                <p style={{fontFamily:'"Playfair Display",serif',fontSize:'16px'}}>{cat}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Analytics.PageView />
    </div>
  );
}

function StickyBanner({bg, dark, tag, title, subtitle, link, align}) {
  return (
    <div className="sticky-banner" style={{height:'100vh',background:bg,display:'flex',alignItems:'center',overflow:'hidden'}}>
      <div style={{maxWidth:'1600px',margin:'0 auto',width:'100%',padding:'0 64px',display:'flex',alignItems:'center',gap:'64px',flexDirection: align==='right' ? 'row-reverse' : 'row'}}>
        <div style={{flex:1}}>
          <p style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'16px'}}>{tag}</p>
          <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(2rem,4vw,4rem)',color: dark?'#fff':'#0a0a0a',lineHeight:'1.2',marginBottom:'24px'}}>{title}</h2>
          <p style={{fontSize:'16px',color: dark?'#9ca3af':'#4b5563',maxWidth:'400px',marginBottom:'32px'}}>{subtitle}</p>
          <Link to={link} style={{display:'inline-block',padding:'14px 36px',background:'#c9a84c',color:'#0a0a0a',textDecoration:'none',fontSize:'12px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase'}}>
            Shop Now
          </Link>
        </div>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:'320px',height:'400px',borderRadius:'8px',background: dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:'160px',height:'160px',borderRadius:'50%',border:'3px solid #c9a84c',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px'}}>⌚</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionsGrid({collections}) {
  if (!collections?.length) return null;
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
      {collections.slice(0,3).map(col => (
        <Link key={col.id} to={`/collections/${col.handle}`}
          style={{position:'relative',aspectRatio:'1/1',background:'#e5e7eb',display:'block',overflow:'hidden',textDecoration:'none'}}>
          {col.image && <img src={col.image.url} alt={col.title} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.7s ease'}} />}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)'}} />
          <div style={{position:'absolute',bottom:0,left:0,padding:'32px',color:'#fff'}}>
            <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'8px'}}>{col.handle}</p>
            <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:'2rem'}}>{col.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'24px'}}>
      {[...Array(8)].map((_,i) => (
        <div key={i}>
          <div style={{aspectRatio:'1/1',background:'#e5e7eb',marginBottom:'12px',animation:'pulse 1.5s infinite'}} />
          <div style={{height:'12px',background:'#e5e7eb',marginBottom:'8px',borderRadius:'4px'}} />
          <div style={{height:'12px',background:'#e5e7eb',width:'60%',borderRadius:'4px'}} />
        </div>
      ))}
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
    collections(first: 3, sortKey: UPDATED_AT, reverse: true) {
      nodes { id title handle image { url altText width height } }
    }
  }
`;
