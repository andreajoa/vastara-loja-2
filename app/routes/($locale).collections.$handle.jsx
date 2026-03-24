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

const PRICE_RANGES = [{label:'Under $50',min:0,max:50},{label:'$50 – $100',min:50,max:100},{label:'$100 – $200',min:100,max:200},{label:'$200 – $500',min:200,max:500},{label:'Over $500',min:500,max:Infinity}];

const FILTER_GROUPS = [
  {label:'Style',tags:['dress watches','sport watches','sports watches','dive watches','minimalist watches','fashion watches','casual watches','luxury watches'],display:['Dress','Sport','Dive','Minimalist','Fashion','Casual','Luxury']},
  {label:'Movement',tags:['automatic','quartz watches','automatic calendar','mechanical'],display:['Automatic','Quartz','Automatic Calendar','Mechanical']},
  {label:'Material',tags:['leather watches','steel watches','rubber watches','titanium'],display:['Leather','Steel','Rubber','Titanium']},
  {label:'Gender',tags:['mens watches','womens watches','unisex'],display:["Men's","Women's",'Unisex']},
];

function Sidebar({allTags, activeTags, onTagToggle, priceRange, onPriceRange, onClear}) {
  const [open, setOpen] = useState({Style:true,Movement:false,Material:false,Gender:false,Price:false});
  const toggle = (l) => setOpen(o=>({...o,[l]:!o[l]}));
  return (
    <aside style={{width:'220px',minWidth:'220px',borderRight:'1px solid #ebebeb',alignSelf:'flex-start',position:'sticky',top:'80px'}}>
      <div style={{padding:'16px 20px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #f0f0f0'}}>
        <span style={{fontSize:'11px',fontWeight:600,letterSpacing:'1.5px',textTransform:'uppercase',color:'#000'}}>Filters</span>
        {(activeTags.length>0||priceRange!==null)&&<button onClick={onClear} style={{background:'none',border:'none',fontSize:'11px',color:'#999',cursor:'pointer',textDecoration:'underline'}}>Clear all</button>}
      </div>
      <div style={{borderBottom:'1px solid #f0f0f0'}}>
        <button onClick={()=>toggle('Price')} style={{width:'100%',background:'none',border:'none',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'12px',fontWeight:500,cursor:'pointer',color:'#000'}}>
          Price <span style={{fontSize:'10px',color:'#999',transform:open.Price?'rotate(180deg)':'none',display:'inline-block',transition:'transform 0.2s'}}>▼</span>
        </button>
        {open.Price&&<div style={{padding:'4px 20px 14px'}}>{PRICE_RANGES.map(r=>(
          <label key={r.label} style={{display:'flex',alignItems:'center',gap:'10px',padding:'5px 0',cursor:'pointer'}}>
            <input type="radio" name="price" checked={priceRange?.label===r.label} onChange={()=>onPriceRange(priceRange?.label===r.label?null:r)} style={{accentColor:'#000',width:'13px',height:'13px',cursor:'pointer'}} />
            <span style={{fontSize:'12px',color:'#333'}}>{r.label}</span>
          </label>
        ))}</div>}
      </div>
      {FILTER_GROUPS.map(group=>{
        const available = group.tags.filter(t=>allTags.has(t));
        if(available.length===0) return null;
        return (
          <div key={group.label} style={{borderBottom:'1px solid #f0f0f0'}}>
            <button onClick={()=>toggle(group.label)} style={{width:'100%',background:'none',border:'none',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'12px',fontWeight:500,cursor:'pointer',color:'#000'}}>
              {group.label} <span style={{fontSize:'10px',color:'#999',transform:open[group.label]?'rotate(180deg)':'none',display:'inline-block',transition:'transform 0.2s'}}>▼</span>
            </button>
            {open[group.label]&&<div style={{padding:'4px 20px 14px'}}>{available.map(tag=>(
              <label key={tag} style={{display:'flex',alignItems:'center',gap:'10px',padding:'5px 0',cursor:'pointer'}}>
                <input type="checkbox" checked={activeTags.includes(tag)} onChange={()=>onTagToggle(tag)} style={{accentColor:'#000',width:'13px',height:'13px',cursor:'pointer'}} />
                <span style={{fontSize:'12px',color:'#333'}}>{group.display[group.tags.indexOf(tag)]||tag}</span>
              </label>
            ))}</div>}
          </div>
        );
      })}
    </aside>
  );
}

function ProductCard({product}) {
  const price = parseFloat(product.priceRange?.minVariantPrice?.amount||0);
  const image = product.featuredImage;
  return (
    <Link to={`/products/${product.handle}`} style={{textDecoration:'none',color:'inherit',display:'block'}}>
      <div style={{background:'#f7f7f7',aspectRatio:'1',overflow:'hidden',marginBottom:'10px',transition:'transform 0.4s ease'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.03)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        {image?<img src={image.url} alt={image.altText||product.title} style={{width:'100%',height:'100%',objectFit:'contain',display:'block',background:'#f7f7f7'}} />:<div style={{width:'100%',height:'100%',background:'#e8e8e8'}} />}
      </div>
      <h4 style={{fontSize:'12px',fontWeight:400,margin:'0 0 4px',color:'#111',lineHeight:1.4}}>{product.title}</h4>
      <p style={{fontSize:'13px',fontWeight:600,margin:'0 0 10px',color:'#000'}}>${price.toFixed(2)}</p>
      <div style={{display:'inline-block',padding:'8px 16px',background:'#0a0a0a',color:'#fff',fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',fontWeight:600}}>View Product</div>
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

  const allTags = useMemo(()=>{
    const set = new Set();
    allProducts.forEach(p=>(p.tags||[]).forEach(t=>set.add(t.toLowerCase())));
    return set;
  },[allProducts]);

  const toggleTag = (tag) => setActiveTags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag]);
  const clearAll = () => { setActiveTags([]); setPriceRange(null); };

  const filtered = useMemo(()=>{
    let result = [...allProducts];
    if(activeTags.length>0) result = result.filter(p=>{const pt=(p.tags||[]).map(t=>t.toLowerCase());return activeTags.every(at=>pt.includes(at));});
    if(priceRange) result = result.filter(p=>{const price=parseFloat(p.priceRange?.minVariantPrice?.amount||0);return price>=priceRange.min&&price<priceRange.max;});
    if(sortBy==='price-asc') result.sort((a,b)=>parseFloat(a.priceRange?.minVariantPrice?.amount||0)-parseFloat(b.priceRange?.minVariantPrice?.amount||0));
    if(sortBy==='price-desc') result.sort((a,b)=>parseFloat(b.priceRange?.minVariantPrice?.amount||0)-parseFloat(a.priceRange?.minVariantPrice?.amount||0));
    if(sortBy==='title') result.sort((a,b)=>a.title.localeCompare(b.title));
    return result;
  },[allProducts,activeTags,priceRange,sortBy]);

  const activeCount = activeTags.length+(priceRange?1:0);

  return (
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",minHeight:'100vh',background:'#fff'}}>
      <style>{`
        .col-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px 20px}
        .col-sidebar-desktop{display:block}
        .col-mobile-filter-btn{display:none}
        @media(max-width:900px){.col-sidebar-desktop{display:none}.col-mobile-filter-btn{display:block}.col-grid{grid-template-columns:repeat(2,1fr);gap:16px 12px}}
        @media(max-width:480px){.col-grid{grid-template-columns:repeat(2,1fr);gap:12px 8px}}
      `}</style>

      <div style={{borderBottom:'1px solid #ebebeb',padding:'20px 40px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'10px'}}>
          <div>
            <p style={{fontSize:'10px',color:'#999',margin:'0 0 3px',letterSpacing:'1px',textTransform:'uppercase'}}>Collection</p>
            <h1 style={{fontSize:'26px',fontWeight:500,margin:0}}>{collection.title}</h1>
            {collection.description && <p style={{fontSize:'13px',color:'#6b7280',marginTop:'6px',maxWidth:'600px',lineHeight:'1.6'}}>{collection.description}</p>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <button className="col-mobile-filter-btn" onClick={()=>setSidebarOpen(true)} style={{padding:'8px 14px',border:'1px solid #000',background:'none',fontSize:'11px',fontWeight:600,letterSpacing:'1px',cursor:'pointer'}}>
              Filters {activeCount>0&&`(${activeCount})`}
            </button>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:'8px 12px',border:'1px solid #ddd',background:'#fff',fontSize:'12px',cursor:'pointer',outline:'none'}}>
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="title">Name: A–Z</option>
            </select>
            <span style={{fontSize:'12px',color:'#999'}}>{filtered.length} products</span>
          </div>
        </div>
        {activeCount>0&&(
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'12px'}}>
            {activeTags.map(tag=><button key={tag} onClick={()=>toggleTag(tag)} style={{padding:'4px 10px',background:'#000',color:'#fff',border:'none',fontSize:'11px',cursor:'pointer'}}>{tag} ✕</button>)}
            {priceRange&&<button onClick={()=>setPriceRange(null)} style={{padding:'4px 10px',background:'#000',color:'#fff',border:'none',fontSize:'11px',cursor:'pointer'}}>{priceRange.label} ✕</button>}
            <button onClick={clearAll} style={{padding:'4px 10px',background:'none',border:'1px solid #ddd',fontSize:'11px',cursor:'pointer',color:'#666'}}>Clear all</button>
          </div>
        )}
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:500,background:'#fff',overflowY:'auto',padding:'0 0 80px'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid #ebebeb',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'14px',fontWeight:600}}>Filters</span>
            <button onClick={()=>setSidebarOpen(false)} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer'}}>✕</button>
          </div>
          <Sidebar allTags={allTags} activeTags={activeTags} onTagToggle={toggleTag} priceRange={priceRange} onPriceRange={setPriceRange} onClear={clearAll} />
          <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'16px 20px',background:'#fff',borderTop:'1px solid #ebebeb'}}>
            <button onClick={()=>setSidebarOpen(false)} style={{width:'100%',padding:'13px',background:'#000',color:'#fff',border:'none',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>View {filtered.length} Products</button>
          </div>
        </div>
      )}

      <div style={{display:'flex',gap:0,padding:'0 40px'}}>
        <div className="col-sidebar-desktop" style={{paddingTop:'24px',marginRight:'32px'}}>
          <Sidebar allTags={allTags} activeTags={activeTags} onTagToggle={toggleTag} priceRange={priceRange} onPriceRange={setPriceRange} onClear={clearAll} />
        </div>
        <div style={{flex:1,paddingTop:'24px',minWidth:0}}>
          {filtered.length===0?(
            <div style={{textAlign:'center',padding:'80px 20px',color:'#999'}}>
              <p style={{fontSize:'15px',marginBottom:'12px'}}>No products match your filters.</p>
              <button onClick={clearAll} style={{padding:'10px 24px',background:'#000',color:'#fff',border:'none',fontSize:'12px',cursor:'pointer'}}>Clear Filters</button>
            </div>
          ):(
            <div className="col-grid">
              {filtered.map(product=><ProductCard key={product.id} product={product} />)}
            </div>
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
      id handle title description
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
