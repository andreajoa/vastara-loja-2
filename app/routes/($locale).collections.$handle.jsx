import {redirect, useLoaderData} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {useState, useMemo} from 'react';
import {Link} from 'react-router';

export const meta = ({data}) => [{title:`Vastara | ${data?.collection.title??''}`}];

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy:250});
  if (!handle) throw redirect('/collections');
  const [{collection}] = await Promise.all([storefront.query(COLLECTION_QUERY, {variables:{handle,...paginationVariables}})]);
  if (!collection) throw new Response(`Collection ${handle} not found`, {status:404});
  redirectIfHandleIsLocalized(request, {handle, data:collection});
  return {collection};
}

function loadDeferredData({context}) { return {}; }

const PRICE_RANGES = [
  {label:'Under $100',min:0,max:100},
  {label:'$100 – $300',min:100,max:300},
  {label:'$300 – $500',min:300,max:500},
  {label:'Over $500',min:500,max:Infinity},
];

const FILTER_GROUPS = [
  {label:'Style', tags:['dress watches','sport watches','sports watches','dive watches','minimalist watches','fashion watches','casual watches','luxury watches'], display:['Dress','Sport','Dive','Minimalist','Fashion','Casual','Luxury']},
  {label:'Movement', tags:['automatic','quartz watches','automatic calendar','mechanical'], display:['Automatic','Quartz','Auto Calendar','Mechanical']},
  {label:'Material', tags:['leather watches','steel watches','rubber watches','titanium'], display:['Leather','Steel','Rubber','Titanium']},
  {label:'Gender', tags:['mens watches','womens watches','unisex'], display:["Men's","Women's",'Unisex']},
];

function Sidebar({allTags, activeTags, onTagToggle, priceRange, onPriceRange, onClear}) {
  const [open, setOpen] = useState({Style:true, Movement:false, Material:false, Gender:false, Price:false});
  const toggle = (l) => setOpen(o => ({...o, [l]:!o[l]}));
  const activeCount = activeTags.length + (priceRange ? 1 : 0);

  return (
    <aside style={{
      width:'220px', minWidth:'220px',
      borderRight:'0.5px solid rgba(255,255,255,0.06)',
      alignSelf:'flex-start', position:'sticky', top:'64px',
      background:'#0a0a0a',
    }}>
      <div style={{padding:'20px 24px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'0.5px solid rgba(255,255,255,0.06)'}}>
        <span style={{fontSize:'9px', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(255,255,255,0.25)'}}>Filters</span>
        {activeCount > 0 && (
          <button onClick={onClear} style={{background:'none', border:'none', fontSize:'10px', color:'#c9a84c', cursor:'pointer', letterSpacing:'1px'}}>
            Clear ({activeCount})
          </button>
        )}
      </div>

      <div style={{borderBottom:'0.5px solid rgba(255,255,255,0.06)'}}>
        <button onClick={()=>toggle('Price')} style={{width:'100%', background:'none', border:'none', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'10px', fontWeight:500, cursor:'pointer', color:'rgba(255,255,255,0.5)', letterSpacing:'1.5px', textTransform:'uppercase'}}>
          Price <span style={{fontSize:'9px', color:'rgba(255,255,255,0.2)', transform:open.Price?'rotate(180deg)':'none', display:'inline-block', transition:'transform 0.2s'}}>▼</span>
        </button>
        {open.Price && (
          <div style={{padding:'4px 24px 14px'}}>
            {PRICE_RANGES.map(r => (
              <label key={r.label} style={{display:'flex', alignItems:'center', gap:'10px', padding:'5px 0', cursor:'pointer'}}>
                <input type="radio" name="price" checked={priceRange?.label===r.label} onChange={()=>onPriceRange(priceRange?.label===r.label?null:r)} style={{accentColor:'#c9a84c', width:'12px', height:'12px', cursor:'pointer'}} />
                <span style={{fontSize:'11px', color: priceRange?.label===r.label ? '#c9a84c' : 'rgba(255,255,255,0.35)'}}>{r.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {FILTER_GROUPS.map(group => {
        const available = group.tags.filter(t => allTags.has(t));
        if (available.length === 0) return null;
        return (
          <div key={group.label} style={{borderBottom:'0.5px solid rgba(255,255,255,0.06)'}}>
            <button onClick={()=>toggle(group.label)} style={{width:'100%', background:'none', border:'none', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'10px', fontWeight:500, cursor:'pointer', color:'rgba(255,255,255,0.5)', letterSpacing:'1.5px', textTransform:'uppercase'}}>
              {group.label} <span style={{fontSize:'9px', color:'rgba(255,255,255,0.2)', transform:open[group.label]?'rotate(180deg)':'none', display:'inline-block', transition:'transform 0.2s'}}>▼</span>
            </button>
            {open[group.label] && (
              <div style={{padding:'4px 24px 14px'}}>
                {available.map(tag => (
                  <label key={tag} style={{display:'flex', alignItems:'center', gap:'10px', padding:'5px 0', cursor:'pointer'}}>
                    <input type="checkbox" checked={activeTags.includes(tag)} onChange={()=>onTagToggle(tag)} style={{accentColor:'#c9a84c', width:'12px', height:'12px', cursor:'pointer'}} />
                    <span style={{fontSize:'11px', color: activeTags.includes(tag) ? '#c9a84c' : 'rgba(255,255,255,0.35)'}}>{group.display[group.tags.indexOf(tag)]||tag}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

function ProductCard({product}) {
  const price = parseFloat(product.priceRange?.minVariantPrice?.amount || 0);
  const currency = product.priceRange?.minVariantPrice?.currencyCode || 'USD';
  const image = product.featuredImage;
  const fmt = new Intl.NumberFormat('en-US', {style:'currency', currency}).format(price);

  return (
    <Link to={`/products/${product.handle}`} style={{textDecoration:'none', color:'inherit', display:'block', background:'#111'}}>
      <div style={{aspectRatio:'1', overflow:'hidden', background:'#111', position:'relative'}}>
        {image
          ? <img src={image.url} alt={image.altText||product.title} style={{width:'100%', height:'100%', objectFit:'contain', display:'block', opacity:0.88, transition:'transform 0.6s ease, opacity 0.3s ease'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.05)';e.currentTarget.style.opacity='0.98'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.opacity='0.88'}}
            />
          : <div style={{width:'100%', height:'100%', background:'#1a1a1a'}} />
        }
      </div>
      <div style={{padding:'14px 16px 18px', borderTop:'0.5px solid rgba(255,255,255,0.05)'}}>
        <h4 style={{fontSize:'12px', fontWeight:400, margin:'0 0 5px', color:'rgba(255,255,255,0.65)', lineHeight:1.4}}>{product.title}</h4>
        <p style={{fontSize:'13px', fontWeight:500, margin:0, color:'#c9a84c'}}>{fmt}</p>
      </div>
    </Link>
  );
}

export default function Collection() {
  const {collection} = useLoaderData();
  const [activeTags, setActiveTags] = useState([]);
  const [priceRange, setPriceRange] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const allProducts = collection.products.nodes;

  const allTags = useMemo(() => {
    const set = new Set();
    allProducts.forEach(p => (p.tags||[]).forEach(t => set.add(t.toLowerCase())));
    return set;
  }, [allProducts]);

  const toggleTag = (tag) => setActiveTags(prev => prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev, tag]);
  const clearAll = () => { setActiveTags([]); setPriceRange(null); };

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (activeTags.length > 0) result = result.filter(p => {
      const pt = (p.tags||[]).map(t=>t.toLowerCase());
      return activeTags.every(at => pt.includes(at));
    });
    if (priceRange) result = result.filter(p => {
      const price = parseFloat(p.priceRange?.minVariantPrice?.amount||0);
      return price >= priceRange.min && price < priceRange.max;
    });
    if (sortBy==='price-asc') result.sort((a,b)=>parseFloat(a.priceRange?.minVariantPrice?.amount||0)-parseFloat(b.priceRange?.minVariantPrice?.amount||0));
    if (sortBy==='price-desc') result.sort((a,b)=>parseFloat(b.priceRange?.minVariantPrice?.amount||0)-parseFloat(a.priceRange?.minVariantPrice?.amount||0));
    if (sortBy==='title') result.sort((a,b)=>a.title.localeCompare(b.title));
    return result;
  }, [allProducts, activeTags, priceRange, sortBy]);

  const activeCount = activeTags.length + (priceRange ? 1 : 0);

  return (
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif", minHeight:'100vh', background:'#0a0a0a'}}>
      <style suppressHydrationWarning>{`
        .col-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:3px}
        .col-sidebar-desktop{display:block}
        .col-mobile-filter-btn{display:none}
        .col-mobile-overlay{display:none}
        @media(max-width:900px){
          .col-sidebar-desktop{display:none}
          .col-mobile-filter-btn{display:flex}
          .col-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:480px){
          .col-grid{grid-template-columns:1fr}
        }
      `}</style>

      {/* HERO */}
      <div style={{background:'#0a0a0a', padding:'96px 48px 52px', borderBottom:'0.5px solid rgba(255,255,255,0.06)'}}>
        <span style={{fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase', color:'#c9a84c', display:'block', marginBottom:'14px'}}>
          Curated Collection
        </span>
        <h1 style={{fontSize:'44px', fontWeight:300, color:'#fff', fontFamily:'Georgia,serif', letterSpacing:'-1px', lineHeight:1.1, marginBottom:'14px'}}>
          {collection.title}
        </h1>
        {collection.description ? (
          <p style={{fontSize:'13px', color:'rgba(255,255,255,0.38)', maxWidth:'520px', lineHeight:1.85, marginBottom:'28px'}}>
            {collection.description}
          </p>
        ) : (
          <p style={{fontSize:'13px', color:'rgba(255,255,255,0.38)', maxWidth:'520px', lineHeight:1.85, marginBottom:'28px', fontStyle:'italic'}}>
            A curated selection of timepieces — chosen for design, quality, and presence. Only what deserves your wrist.
          </p>
        )}
        <div style={{display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap'}}>
          <span style={{fontSize:'10px', color:'rgba(255,255,255,0.2)', letterSpacing:'1px'}}>{filtered.length} Timepieces</span>
          <div style={{width:'1px', height:'14px', background:'rgba(255,255,255,0.1)'}}></div>
          <span style={{fontSize:'10px', color:'rgba(255,255,255,0.2)', letterSpacing:'1px'}}>Free Worldwide Shipping</span>
          <div style={{width:'1px', height:'14px', background:'rgba(255,255,255,0.1)'}}></div>
          <span style={{fontSize:'10px', color:'rgba(255,255,255,0.2)', letterSpacing:'1px'}}>1-Year Warranty</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div style={{background:'#111', borderBottom:'0.5px solid rgba(255,255,255,0.06)', padding:'12px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap', position:'sticky', top:'64px', zIndex:10}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <button className="col-mobile-filter-btn" onClick={()=>setSidebarOpen(true)} style={{padding:'7px 16px', border:'0.5px solid rgba(255,255,255,0.15)', background:'transparent', fontSize:'10px', fontWeight:500, letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', color:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', gap:'6px'}}>
            Filters {activeCount > 0 && <span style={{background:'#c9a84c', color:'#0a0a0a', borderRadius:'50%', width:'16px', height:'16px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:700}}>{activeCount}</span>}
          </button>
          {activeCount > 0 && (
            <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
              {activeTags.map(tag => (
                <button key={tag} onClick={()=>toggleTag(tag)} style={{padding:'4px 10px', background:'rgba(201,168,76,0.15)', border:'0.5px solid rgba(201,168,76,0.4)', fontSize:'10px', cursor:'pointer', color:'#c9a84c', letterSpacing:'1px'}}>
                  {tag} ✕
                </button>
              ))}
              {priceRange && (
                <button onClick={()=>setPriceRange(null)} style={{padding:'4px 10px', background:'rgba(201,168,76,0.15)', border:'0.5px solid rgba(201,168,76,0.4)', fontSize:'10px', cursor:'pointer', color:'#c9a84c', letterSpacing:'1px'}}>
                  {priceRange.label} ✕
                </button>
              )}
            </div>
          )}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:'7px 12px', border:'0.5px solid rgba(255,255,255,0.12)', background:'transparent', fontSize:'11px', cursor:'pointer', outline:'none', color:'rgba(255,255,255,0.45)'}}>
            <option value="default">Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="title">Name: A–Z</option>
          </select>
          <span style={{fontSize:'11px', color:'rgba(255,255,255,0.2)', whiteSpace:'nowrap'}}>{filtered.length} products</span>
        </div>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div style={{position:'fixed', inset:0, zIndex:500, background:'#0a0a0a', overflowY:'auto', padding:'0 0 80px'}}>
          <div style={{padding:'16px 24px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{fontSize:'12px', fontWeight:500, color:'#fff', letterSpacing:'2px', textTransform:'uppercase'}}>Filters</span>
            <button onClick={()=>setSidebarOpen(false)} style={{background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'rgba(255,255,255,0.4)'}}>✕</button>
          </div>
          <Sidebar allTags={allTags} activeTags={activeTags} onTagToggle={toggleTag} priceRange={priceRange} onPriceRange={setPriceRange} onClear={clearAll} />
          <div style={{position:'fixed', bottom:0, left:0, right:0, padding:'16px 24px', background:'#111', borderTop:'0.5px solid rgba(255,255,255,0.06)'}}>
            <button onClick={()=>setSidebarOpen(false)} style={{width:'100%', padding:'14px', background:'#c9a84c', color:'#0a0a0a', border:'none', fontSize:'11px', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer'}}>
              View {filtered.length} Products
            </button>
          </div>
        </div>
      )}

      {/* BODY */}
      <div style={{display:'flex', gap:0}}>
        <div className="col-sidebar-desktop">
          <Sidebar allTags={allTags} activeTags={activeTags} onTagToggle={toggleTag} priceRange={priceRange} onPriceRange={setPriceRange} onClear={clearAll} />
        </div>

        <div style={{flex:1, minWidth:0}}>
          {filtered.length === 0 ? (
            <div style={{textAlign:'center', padding:'80px 20px'}}>
              <p style={{fontSize:'14px', color:'rgba(255,255,255,0.3)', marginBottom:'16px'}}>No products match your filters.</p>
              <button onClick={clearAll} style={{padding:'10px 24px', background:'#c9a84c', color:'#0a0a0a', border:'none', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontWeight:700}}>Clear Filters</button>
            </div>
          ) : (
            <div className="col-grid">
              {filtered.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </div>

      <Analytics.CollectionView data={{collection:{id:collection.id, handle:collection.handle}}} />
    </div>
  );
}

const COLLECTION_QUERY = `#graphql
  query Collection($handle:String!,$country:CountryCode,$language:LanguageCode,$first:Int,$last:Int,$startCursor:String,$endCursor:String) @inContext(country:$country,language:$language) {
    collection(handle:$handle) {
      id handle title description descriptionHtml
      image { url altText }
      products(first:$first,last:$last,before:$startCursor,after:$endCursor) {
        nodes {
          id handle title tags
          featuredImage { id altText url width height }
          priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
        }
        pageInfo { hasPreviousPage hasNextPage endCursor startCursor }
      }
    }
  }
`;
