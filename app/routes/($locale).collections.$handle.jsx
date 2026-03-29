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
  {label:'Style',tags:['dress watches','sport watches','sports watches','dive watches','minimalist watches','fashion watches','casual watches','luxury watches'],display:['Dress','Sport','Dive','Minimalist','Fashion','Casual','Luxury']},
  {label:'Movement',tags:['automatic','quartz watches','automatic calendar','mechanical'],display:['Automatic','Quartz','Auto Calendar','Mechanical']},
  {label:'Material',tags:['leather watches','steel watches','rubber watches','titanium'],display:['Leather','Steel','Rubber','Titanium']},
  {label:'Gender',tags:['mens watches','womens watches','unisex'],display:["Men's","Women's",'Unisex']},
];

const BANNER_IMG = 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/BANNER_2_f12e13b1-14a7-4c27-809f-d15d80b8bf1a.jpg?v=1772467291';

function Sidebar({allTags, activeTags, onTagToggle, priceRange, onPriceRange, onClear}) {
  const [open, setOpen] = useState({Style:true,Movement:false,Material:false,Gender:false,Price:false});
  const toggle = (l) => setOpen(o=>({...o,[l]:!o[l]}));
  const activeCount = activeTags.length + (priceRange ? 1 : 0);

  const sbHead = {width:'100%',background:'none',border:'none',padding:'11px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'10px',fontWeight:500,cursor:'pointer',color:'rgba(255,255,255,0.4)',letterSpacing:'1.5px',textTransform:'uppercase'};
  const sbOpt = (active) => ({display:'flex',alignItems:'center',gap:'9px',padding:'5px 0',cursor:'pointer',fontSize:'11px',color:active?'#c9a84c':'rgba(255,255,255,0.3)'});

  return (
    <aside style={{width:'200px',minWidth:'200px',borderRight:'0.5px solid rgba(255,255,255,0.06)',alignSelf:'flex-start',position:'sticky',top:'64px',background:'#0a0a0a'}}>
      <div style={{padding:'18px 22px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'0.5px solid rgba(255,255,255,0.06)'}}>
        <span style={{fontSize:'9px',fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,0.2)'}}>Filters</span>
        {activeCount>0&&<button onClick={onClear} style={{background:'none',border:'none',fontSize:'10px',color:'#c9a84c',cursor:'pointer',letterSpacing:'1px'}}>Clear ({activeCount})</button>}
      </div>

      <div style={{borderBottom:'0.5px solid rgba(255,255,255,0.05)'}}>
        <button onClick={()=>toggle('Price')} style={sbHead}>
          Price <span style={{fontSize:'9px',color:'rgba(255,255,255,0.2)',transform:open.Price?'rotate(180deg)':'none',display:'inline-block',transition:'transform 0.2s'}}>▼</span>
        </button>
        {open.Price&&<div style={{padding:'2px 22px 12px'}}>
          {PRICE_RANGES.map(r=>(
            <label key={r.label} style={sbOpt(priceRange?.label===r.label)}>
              <input type="radio" name="price" checked={priceRange?.label===r.label} onChange={()=>onPriceRange(priceRange?.label===r.label?null:r)} style={{accentColor:'#c9a84c',width:'12px',height:'12px',cursor:'pointer'}} />
              {r.label}
            </label>
          ))}
        </div>}
      </div>

      {FILTER_GROUPS.map(group=>{
        const available = group.tags.filter(t=>allTags.has(t));
        if(available.length===0) return null;
        return (
          <div key={group.label} style={{borderBottom:'0.5px solid rgba(255,255,255,0.05)'}}>
            <button onClick={()=>toggle(group.label)} style={sbHead}>
              {group.label} <span style={{fontSize:'9px',color:'rgba(255,255,255,0.2)',transform:open[group.label]?'rotate(180deg)':'none',display:'inline-block',transition:'transform 0.2s'}}>▼</span>
            </button>
            {open[group.label]&&<div style={{padding:'2px 22px 12px'}}>
              {available.map(tag=>(
                <label key={tag} style={sbOpt(activeTags.includes(tag))}>
                  <input type="checkbox" checked={activeTags.includes(tag)} onChange={()=>onTagToggle(tag)} style={{accentColor:'#c9a84c',width:'12px',height:'12px',cursor:'pointer'}} />
                  {group.display[group.tags.indexOf(tag)]||tag}
                </label>
              ))}
            </div>}
          </div>
        );
      })}
    </aside>
  );
}

function ProductCard({product, featured, badge}) {
  const price = parseFloat(product.priceRange?.minVariantPrice?.amount||0);
  const currency = product.priceRange?.minVariantPrice?.currencyCode||'USD';
  const fmt = new Intl.NumberFormat('en-US',{style:'currency',currency}).format(price);
  const image = product.featuredImage;

  if (featured) {
    return (
      <Link to={`/products/${product.handle}`} style={{position:'relative',height:'380px',overflow:'hidden',background:'#111',textDecoration:'none',display:'block'}}>
        {image&&<img src={image.url} alt={image.altText||product.title} style={{width:'100%',height:'100%',objectFit:'contain',opacity:0.88,transition:'transform 0.7s ease'}}
          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
        />}
        {badge&&<div style={{position:'absolute',top:'14px',left:'14px',background:'rgba(201,168,76,0.15)',border:'0.5px solid rgba(201,168,76,0.5)',color:'#c9a84c',fontSize:'8px',letterSpacing:'2px',textTransform:'uppercase',padding:'5px 12px'}}>{badge}</div>}
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'18px 20px',background:'linear-gradient(to top,rgba(0,0,0,0.97) 0%,rgba(0,0,0,0.5) 60%,transparent 100%)'}}>
          <div style={{fontSize:'13px',color:'#fff',marginBottom:'4px',lineHeight:1.3}}>{product.title}</div>
          <div style={{fontSize:'12px',color:'#c9a84c',fontWeight:500}}>{fmt}</div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/products/${product.handle}`} style={{textDecoration:'none',color:'inherit',background:'#111',display:'block'}}>
      <div style={{aspectRatio:'1',overflow:'hidden',background:'#111'}}>
        {image&&<img src={image.url} alt={image.altText||product.title} style={{width:'100%',height:'100%',objectFit:'contain',opacity:0.85,transition:'transform 0.6s ease,opacity 0.3s ease'}}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.05)';e.currentTarget.style.opacity='0.98'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.opacity='0.85'}}
        />}
      </div>
      <div style={{padding:'13px 15px 16px',borderTop:'0.5px solid rgba(255,255,255,0.05)'}}>
        <h4 style={{fontSize:'11px',fontWeight:400,margin:'0 0 5px',color:'rgba(255,255,255,0.6)',lineHeight:1.4}}>{product.title}</h4>
        <p style={{fontSize:'12px',fontWeight:500,margin:0,color:'#c9a84c'}}>{fmt}</p>
      </div>
    </Link>
  );
}

function MidBanner({collectionTitle}) {
  return (
    <div style={{position:'relative',height:'200px',overflow:'hidden',background:'#111',margin:'3px 0'}}>
      <img src={BANNER_IMG} alt="Vastara" style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.3,mixBlendMode:'luminosity'}} />
      <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(0,0,0,0.97) 0%,rgba(0,0,0,0.5) 60%,transparent 100%)'}} />
      <div style={{position:'absolute',top:'50%',left:'28px',transform:'translateY(-50%)'}}>
        <span style={{fontSize:'8px',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',display:'block',marginBottom:'10px'}}>Vastara Selection</span>
        <div style={{fontSize:'22px',fontWeight:300,color:'#fff',fontFamily:'Georgia,serif',marginBottom:'6px',lineHeight:1.2}}>Only what deserves<br />your wrist.</div>
        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',marginBottom:'14px'}}>Each piece chosen for craftsmanship, quality and presence.</div>
        <Link to={`/collections`} style={{fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:'#fff',background:'rgba(201,168,76,0.15)',border:'0.5px solid rgba(201,168,76,0.45)',padding:'7px 16px',display:'inline-block',textDecoration:'none'}}>
          Explore the Selection →
        </Link>
      </div>
    </div>
  );
}

export default function Collection() {
  const {collection} = useLoaderData();
  const [activeTags, setActiveTags] = useState([]);
  const [priceRange, setPriceRange] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState('All');
  const allProducts = collection.products.nodes;

  const allTags = useMemo(()=>{
    const set = new Set();
    allProducts.forEach(p=>(p.tags||[]).forEach(t=>set.add(t.toLowerCase())));
    return set;
  },[allProducts]);

  const quickFilters = useMemo(()=>{
    const opts = ['All'];
    if(allTags.has('automatic')) opts.push('Automatic');
    if(allTags.has('quartz watches')) opts.push('Quartz');
    ['dress watches','sport watches','sports watches','dive watches'].forEach(t=>{
      if(allTags.has(t)) opts.push(t.split(' ')[0].charAt(0).toUpperCase()+t.split(' ')[0].slice(1));
    });
    return opts.slice(0,6);
  },[allTags]);

  const toggleTag = (tag) => setActiveTags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag]);
  const clearAll = () => { setActiveTags([]); setPriceRange(null); setQuickFilter('All'); };

  const filtered = useMemo(()=>{
    let result = [...allProducts];
    if(quickFilter!=='All') {
      const qf = quickFilter.toLowerCase();
      result = result.filter(p=>(p.tags||[]).some(t=>t.toLowerCase().includes(qf)));
    }
    if(activeTags.length>0) result = result.filter(p=>{const pt=(p.tags||[]).map(t=>t.toLowerCase());return activeTags.every(at=>pt.includes(at));});
    if(priceRange) result = result.filter(p=>{const price=parseFloat(p.priceRange?.minVariantPrice?.amount||0);return price>=priceRange.min&&price<priceRange.max;});
    if(sortBy==='price-asc') result.sort((a,b)=>parseFloat(a.priceRange?.minVariantPrice?.amount||0)-parseFloat(b.priceRange?.minVariantPrice?.amount||0));
    if(sortBy==='price-desc') result.sort((a,b)=>parseFloat(b.priceRange?.minVariantPrice?.amount||0)-parseFloat(a.priceRange?.minVariantPrice?.amount||0));
    if(sortBy==='title') result.sort((a,b)=>a.title.localeCompare(b.title));
    return result;
  },[allProducts,activeTags,priceRange,sortBy,quickFilter]);

  const featured = filtered.slice(0,2);
  const rest = filtered.slice(2);
  // Split into chunks of 8, with editorial banner between each chunk
  const chunkSize = 8;
  const chunks = [];
  for(let i=0; i<rest.length; i+=chunkSize) {
    chunks.push(rest.slice(i, i+chunkSize));
  }
  const activeCount = activeTags.length+(priceRange?1:0);

  // Every 4th product in a chunk becomes a featured wide card
  const renderChunk = (chunk) => {
    const rows = [];
    let i = 0;
    while(i < chunk.length) {
      if(i % 5 === 4 && i + 1 < chunk.length) {
        // Wide featured card
        rows.push({type:'wide', product: chunk[i]});
        i++;
      } else {
        // Collect up to 2 for normal grid row
        const pair = [chunk[i]];
        if(i+1 < chunk.length && (i+1) % 5 !== 4) pair.push(chunk[i+1]);
        rows.push({type:'pair', products: pair});
        i += pair.length;
      }
    }
    return rows;
  };

  return (
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",minHeight:'100vh',background:'#0a0a0a'}}>
      <style suppressHydrationWarning>{`
        .col-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:3px}
        .col-feat-row{display:grid;grid-template-columns:1fr 1fr;gap:3px}
        .col-sb{display:block}
        .col-mob-btn{display:none}
        @media(max-width:900px){
          .col-sb{display:none}
          .col-mob-btn{display:flex}
          .col-feat-row{grid-template-columns:1fr}
        }
        @media(max-width:480px){
          .col-grid{grid-template-columns:1fr}
          .col-feat-row{grid-template-columns:1fr}
        }
      `}</style>

      {/* HERO */}
      <div style={{background:'#0a0a0a',padding:'96px 0 0',position:'relative',overflow:'hidden',borderBottom:'0.5px solid rgba(255,255,255,0.06)',minHeight:'560px'}}>
        <><div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(10,10,10,1) 0%,rgba(10,10,10,0.88) 38%,rgba(10,10,10,0.4) 65%,rgba(10,10,10,0.05) 100%)',zIndex:1}} /><img src='https://cdn.shopify.com/s/files/1/0778/2921/0327/files/banner_1_e7421a31-581d-4825-a5a0-f4d325d4697a.jpg?v=1772467291' alt='Vastara' style={{position:'absolute',right:0,top:0,height:'100%',width:'60%',objectFit:'cover',objectPosition:'center center',opacity:0.75}} /></>
        <div style={{position:'relative',padding:'0 48px 48px',maxWidth:'580px',zIndex:2}}>
          <span style={{fontSize:'9px',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',display:'block',marginBottom:'14px'}}>Curated Collection</span>
          <h1 style={{fontWeight:300,color:'#fff',fontFamily:'Georgia,serif',lineHeight:1.1,marginBottom:'14px',textTransform:'none'}}>
            <span style={{fontSize:'clamp(32px,4vw,52px)',letterSpacing:'-0.5px',display:'block'}}>
              {collection.title} <span style={{color:'#c9a84c'}}>—</span>
            </span>
            <span style={{fontSize:'clamp(22px,3vw,36px)',color:'#c9a84c',display:'block',marginTop:'6px',letterSpacing:'-0.3px',fontStyle:'italic'}}>
              Only what deserves your wrist.
            </span>
          </h1>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.38)',maxWidth:'480px',lineHeight:1.85,marginBottom:'28px'}}>
            {collection.description || 'A curated selection of timepieces chosen for design, quality, and presence. Only what deserves your wrist.'}
          </p>
          <div style={{display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
            <span style={{fontSize:'10px',color:'rgba(255,255,255,0.2)',letterSpacing:'1px'}}>{filtered.length} Timepieces</span>
            <div style={{width:'1px',height:'14px',background:'rgba(255,255,255,0.1)'}}></div>
            <span style={{fontSize:'10px',color:'rgba(255,255,255,0.2)',letterSpacing:'1px'}}>Free Worldwide Shipping</span>
            <div style={{width:'1px',height:'14px',background:'rgba(255,255,255,0.1)'}}></div>
            <span style={{fontSize:'10px',color:'rgba(255,255,255,0.2)',letterSpacing:'1px'}}>1-Year Warranty</span>
          </div>
        </div>
        <div style={{borderTop:'0.5px solid rgba(255,255,255,0.06)',padding:'13px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',flexWrap:'wrap',background:'rgba(0,0,0,0.25)'}}>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap',alignItems:'center'}}>
            <span style={{fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.2)',marginRight:'4px'}}>Quick Filter</span>
            {quickFilters.map(f=>(
              <button key={f} onClick={()=>setQuickFilter(f)} style={{padding:'6px 14px',border:'0.5px solid',borderColor:quickFilter===f?'#c9a84c':'rgba(255,255,255,0.12)',fontSize:'10px',letterSpacing:'1.5px',textTransform:'uppercase',cursor:'pointer',color:quickFilter===f?'#0a0a0a':'rgba(255,255,255,0.4)',background:quickFilter===f?'#c9a84c':'transparent',transition:'all 0.2s'}}>
                {f}
              </button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <button className="col-mob-btn" onClick={()=>setSidebarOpen(true)} style={{padding:'7px 14px',border:'0.5px solid rgba(255,255,255,0.15)',background:'transparent',fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer',color:'rgba(255,255,255,0.5)',alignItems:'center',gap:'6px'}}>
              Filters {activeCount>0&&`(${activeCount})`}
            </button>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:'6px 10px',border:'0.5px solid rgba(255,255,255,0.12)',background:'transparent',fontSize:'11px',color:'rgba(255,255,255,0.4)',outline:'none',cursor:'pointer'}}>
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="title">Name: A–Z</option>
            </select>
            <span style={{fontSize:'11px',color:'rgba(255,255,255,0.2)',whiteSpace:'nowrap'}}>{filtered.length} products</span>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:500,background:'#0a0a0a',overflowY:'auto',padding:'0 0 80px'}}>
          <div style={{padding:'16px 24px',borderBottom:'0.5px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'12px',fontWeight:500,color:'#fff',letterSpacing:'2px',textTransform:'uppercase'}}>Filters</span>
            <button onClick={()=>setSidebarOpen(false)} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'rgba(255,255,255,0.4)'}}>✕</button>
          </div>
          <Sidebar allTags={allTags} activeTags={activeTags} onTagToggle={toggleTag} priceRange={priceRange} onPriceRange={setPriceRange} onClear={clearAll} />
          <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'16px 24px',background:'#111',borderTop:'0.5px solid rgba(255,255,255,0.06)'}}>
            <button onClick={()=>setSidebarOpen(false)} style={{width:'100%',padding:'14px',background:'#c9a84c',color:'#0a0a0a',border:'none',fontSize:'11px',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer'}}>
              View {filtered.length} Products
            </button>
          </div>
        </div>
      )}

      {/* BODY */}
      <div style={{display:'flex',gap:0}}>
        <div className="col-sb">
          <Sidebar allTags={allTags} activeTags={activeTags} onTagToggle={toggleTag} priceRange={priceRange} onPriceRange={setPriceRange} onClear={clearAll} />
        </div>

        <div style={{flex:1,minWidth:0}}>
          {filtered.length===0?(
            <div style={{textAlign:'center',padding:'80px 20px'}}>
              <p style={{fontSize:'14px',color:'rgba(255,255,255,0.3)',marginBottom:'16px'}}>No products match your filters.</p>
              <button onClick={clearAll} style={{padding:'10px 24px',background:'#c9a84c',color:'#0a0a0a',border:'none',fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer',fontWeight:700}}>Clear Filters</button>
            </div>
          ):(
            <>
              {/* FEATURED 2 */}
              {featured.length > 0 && (
                <div className="col-feat-row">
                  {featured.map((p,i)=><ProductCard key={p.id} product={p} featured badge={i===0?"Editor's Pick":"Best Seller"} />)}
                </div>
              )}

              {/* SECTION LABEL */}
              {rest.length > 0 && (
                <div style={{padding:'22px 20px 14px',display:'flex',alignItems:'center',gap:'14px'}}>
                  <span style={{fontSize:'9px',letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,0.2)',whiteSpace:'nowrap'}}>Full Collection</span>
                  <div style={{flex:1,height:'0.5px',background:'rgba(255,255,255,0.07)'}}></div>
                </div>
              )}

              {/* CHUNKS WITH EDITORIAL BREAKS */}
              {chunks.map((chunk, ci) => (
                <div key={ci}>
                  {renderChunk(chunk).map((row, ri) => {
                    if(row.type === 'wide') {
                      return (
                        <div key={ri} style={{position:'relative',height:'280px',overflow:'hidden',background:'#111',margin:'3px 0',display:'flex',alignItems:'stretch'}}>
                          <div style={{flex:'0 0 55%',position:'relative',overflow:'hidden'}}>
                            {row.product.featuredImage&&<img src={row.product.featuredImage.url} alt={row.product.title} style={{width:'100%',height:'100%',objectFit:'contain',opacity:0.88}} />}
                          </div>
                          <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'32px 28px',background:'#0f0f0f',borderLeft:'0.5px solid rgba(255,255,255,0.05)'}}>
                            <span style={{fontSize:'8px',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',display:'block',marginBottom:'10px'}}>Featured</span>
                            <div style={{fontSize:'16px',fontWeight:400,color:'#fff',marginBottom:'8px',lineHeight:1.3,fontFamily:'Georgia,serif'}}>{row.product.title}</div>
                            <div style={{fontSize:'14px',color:'#c9a84c',fontWeight:500,marginBottom:'16px'}}>{new Intl.NumberFormat('en-US',{style:'currency',currency:row.product.priceRange?.minVariantPrice?.currencyCode||'USD'}).format(parseFloat(row.product.priceRange?.minVariantPrice?.amount||0))}</div>
                            <Link to={`/products/${row.product.handle}`} style={{fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:'#fff',background:'rgba(201,168,76,0.15)',border:'0.5px solid rgba(201,168,76,0.45)',padding:'8px 16px',display:'inline-block',textDecoration:'none',width:'fit-content'}}>View Product →</Link>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={ri} className="col-grid">
                        {row.products.map(p=><ProductCard key={p.id} product={p} />)}
                      </div>
                    );
                  })}

                  {/* Editorial banner between chunks, not after last */}
                  {ci < chunks.length - 1 && <MidBanner collectionTitle={collection.title} />}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <Analytics.CollectionView data={{collection:{id:collection.id,handle:collection.handle}}} />
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
