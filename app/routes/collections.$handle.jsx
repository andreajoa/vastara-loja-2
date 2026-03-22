import {data as json, useLoaderData, Link, useFetcher} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {useState, useContext, useMemo, useEffect} from 'react';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {CartContext} from '~/components/Layout';

export async function loader({params, request, context}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});
  const {collection} = await storefront.query(COLLECTION_QUERY, {variables: {handle, ...paginationVariables}});
  if (!collection) throw new Response('Not found', {status: 404});
  return json({collection});
}

export const meta = ({data}) => [{title: (data?.collection?.title || 'Collection') + ' | Vastara'}];

function fmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(amount);
}

const PRICE_RANGES = [
  {label: 'Under $100', min: 0, max: 100},
  {label: '$100 - $200', min: 100, max: 200},
  {label: '$200 - $500', min: 200, max: 500},
  {label: 'Over $500', min: 500, max: Infinity},
];

const FILTER_GROUPS = [
  {label: 'Style', tags: ['dress','sport','dive','casual','minimalist','luxury','fashion'], display: ['Dress','Sport','Dive','Casual','Minimalist','Luxury','Fashion']},
  {label: 'Movement', tags: ['automatic','quartz','mechanical','solar'], display: ['Automatic','Quartz','Mechanical','Solar']},
  {label: 'Material', tags: ['leather','steel','titanium','rubber','nylon'], display: ['Leather','Steel','Titanium','Rubber','Nylon']},
  {label: 'Gender', tags: ['mens','womens','unisex'], display: ["Men's","Women's",'Unisex']},
];

function Sidebar({allTags, activeTags, onTagToggle, priceRange, onPriceRange, onClear}) {
  const [open, setOpen] = useState({Price: true, Style: true, Movement: false, Material: false, Gender: false});
  const toggle = (l) => setOpen(o => ({...o, [l]: !o[l]}));
  const activeCount = activeTags.length + (priceRange ? 1 : 0);
  return (
    <aside style={{width:'220px',minWidth:'220px',flexShrink:0,borderRight:'1px solid #e5e7eb',alignSelf:'flex-start',position:'sticky',top:'110px'}}>
      <div style={{padding:'14px 20px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #e5e7eb'}}>
        <span style={{fontSize:'11px',fontWeight:600,letterSpacing:'1.5px',textTransform:'uppercase',color:'#0a0a0a'}}>Filters</span>
        {activeCount > 0 && <button onClick={onClear} style={{background:'none',border:'none',fontSize:'11px',color:'#9ca3af',cursor:'pointer',textDecoration:'underline'}}>Clear all</button>}
      </div>
      <div style={{borderBottom:'1px solid #e5e7eb'}}>
        <button onClick={() => toggle('Price')} style={{width:'100%',background:'none',border:'none',padding:'11px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'12px',fontWeight:500,cursor:'pointer',color:'#0a0a0a'}}>
          Price <span style={{fontSize:'9px',color:'#9ca3af'}}>v</span>
        </button>
        {open.Price && (
          <div style={{padding:'2px 20px 12px'}}>
            {PRICE_RANGES.map(r => (
              <label key={r.label} style={{display:'flex',alignItems:'center',gap:'10px',padding:'5px 0',cursor:'pointer'}}>
                <input type="radio" name="price" checked={priceRange?.label === r.label} onChange={() => onPriceRange(priceRange?.label === r.label ? null : r)} style={{accentColor:'#0a0a0a',width:'13px',height:'13px',cursor:'pointer'}} />
                <span style={{fontSize:'12px',color:'#374151'}}>{r.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {FILTER_GROUPS.map(group => {
        const available = group.tags.filter(t => allTags.has(t));
        if (available.length === 0) return null;
        return (
          <div key={group.label} style={{borderBottom:'1px solid #e5e7eb'}}>
            <button onClick={() => toggle(group.label)} style={{width:'100%',background:'none',border:'none',padding:'11px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'12px',fontWeight:500,cursor:'pointer',color:'#0a0a0a'}}>
              {group.label} <span style={{fontSize:'9px',color:'#9ca3af'}}>v</span>
            </button>
            {open[group.label] && (
              <div style={{padding:'2px 20px 12px'}}>
                {available.map(tag => (
                  <label key={tag} style={{display:'flex',alignItems:'center',gap:'10px',padding:'5px 0',cursor:'pointer'}}>
                    <input type="checkbox" checked={activeTags.includes(tag)} onChange={() => onTagToggle(tag)} style={{accentColor:'#0a0a0a',width:'13px',height:'13px',cursor:'pointer'}} />
                    <span style={{fontSize:'12px',color:'#374151'}}>{group.display[group.tags.indexOf(tag)] || tag}</span>
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

export default function CollectionPage() {
  const {collection} = useLoaderData();
  const cart = useContext(CartContext);
  const fetcher = useFetcher();

  const initialProducts = collection?.products?.nodes || [];
  const [extraProducts, setExtraProducts] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [priceRange, setPriceRange] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (fetcher.data?.collection?.products?.nodes) {
      setExtraProducts(prev => [...prev, ...fetcher.data.collection.products.nodes]);
    }
  }, [fetcher.data]);

  const allProducts = useMemo(() => [...initialProducts, ...extraProducts], [initialProducts, extraProducts]);

  const allTags = useMemo(() => {
    const set = new Set();
    allProducts.forEach(p => (p.tags || []).forEach(t => set.add(t.toLowerCase())));
    return set;
  }, [allProducts]);

  const toggleTag = (tag) => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  const clearAll = () => { setActiveTags([]); setPriceRange(null); };

  const products = useMemo(() => {
    let result = [...allProducts];
    if (activeTags.length > 0) {
      result = result.filter(p => {
        const pt = (p.tags || []).map(t => t.toLowerCase());
        return activeTags.every(at => pt.includes(at));
      });
    }
    if (priceRange) {
      result = result.filter(p => {
        const price = parseFloat(p.priceRange?.minVariantPrice?.amount || 0);
        return price >= priceRange.min && price < priceRange.max;
      });
    }
    return result;
  }, [allProducts, activeTags, priceRange]);

  const activeCount = activeTags.length + (priceRange ? 1 : 0);
  const pageInfo = fetcher.data?.collection?.products?.pageInfo || collection?.products?.pageInfo;
  const hasNextPage = pageInfo?.hasNextPage;
  const endCursor = pageInfo?.endCursor;

  const loadMore = () => {
    fetcher.load('?after=' + endCursor);
  };

  return (
    <div style={{paddingTop:'104px',fontFamily:'sans-serif'}}>
      <style dangerouslySetInnerHTML={{__html: `

        .col-sidebar-desktop { display: block; }
        .col-mobile-filter-btn { display: none; }
        @media(max-width: 900px) {
          .col-sidebar-desktop { display: none !important; }
          .col-mobile-filter-btn { display: block !important; }
          .col-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}} />

      <div style={{padding:'12px 24px',fontSize:'12px',color:'#6b7280',maxWidth:'1400px',margin:'0 auto'}}>
        <Link to="/" style={{color:'#6b7280',textDecoration:'none'}}>Home</Link>
        <span style={{margin:'0 8px'}}>/</span>
        <span style={{color:'#0a0a0a'}}>{collection.title}</span>
      </div>

      <div style={{maxWidth:'1400px',margin:'0 auto',padding:'0 24px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px'}}>
        <div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(1.5rem,3vw,2.5rem)',marginBottom:'4px'}}>{collection.title}</h1>
          <p style={{fontSize:'13px',color:'#6b7280'}}>{products.length} Products</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <button className="col-mobile-filter-btn" onClick={() => setSidebarOpen(true)} style={{padding:'8px 16px',border:'1px solid #0a0a0a',background:'none',fontSize:'11px',letterSpacing:'1px',textTransform:'uppercase',cursor:'pointer'}}>
            Filters{activeCount > 0 ? ' (' + activeCount + ')' : ''}
          </button>
        </div>
      </div>

      {activeCount > 0 && (
        <div style={{maxWidth:'1400px',margin:'0 auto',padding:'0 24px 16px',display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {activeTags.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)} style={{padding:'3px 10px',background:'#0a0a0a',color:'#fff',border:'none',fontSize:'11px',cursor:'pointer'}}>
              {tag} x
            </button>
          ))}
          {priceRange && (
            <button onClick={() => setPriceRange(null)} style={{padding:'3px 10px',background:'#0a0a0a',color:'#fff',border:'none',fontSize:'11px',cursor:'pointer'}}>
              {priceRange.label} x
            </button>
          )}
          <button onClick={clearAll} style={{padding:'3px 10px',background:'none',border:'1px solid #ddd',fontSize:'11px',cursor:'pointer',color:'#666'}}>Clear all</button>
        </div>
      )}

      {sidebarOpen && (
        <div style={{position:'fixed',inset:0,zIndex:500,background:'#fff',overflowY:'auto',padding:'0 0 80px'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid #e5e7eb',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'14px',fontWeight:600}}>Filters</span>
            <button onClick={() => setSidebarOpen(false)} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer'}}>x</button>
          </div>
          <Sidebar allTags={allTags} activeTags={activeTags} onTagToggle={toggleTag} priceRange={priceRange} onPriceRange={setPriceRange} onClear={clearAll} />
          <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'16px 20px',background:'#fff',borderTop:'1px solid #e5e7eb'}}>
            <button onClick={() => setSidebarOpen(false)} style={{width:'100%',padding:'13px',background:'#0a0a0a',color:'#fff',border:'none',fontSize:'12px',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer'}}>
              View {products.length} Products
            </button>
          </div>
        </div>
      )}

      <div style={{maxWidth:'1400px',margin:'0 auto',padding:'0 24px 80px',display:'flex',alignItems:'flex-start'}}>
        <div className="col-sidebar-desktop" style={{paddingTop:'8px',marginRight:'32px'}}>
          <Sidebar allTags={allTags} activeTags={activeTags} onTagToggle={toggleTag} priceRange={priceRange} onPriceRange={setPriceRange} onClear={clearAll} />
        </div>
        <div style={{flex:1,minWidth:0}}>
          {products.length === 0 ? (
            <div style={{textAlign:'center',padding:'80px 20px',color:'#999'}}>
              <p style={{fontSize:'15px',marginBottom:'12px'}}>No products match your filters.</p>
              <button onClick={clearAll} style={{padding:'10px 24px',background:'#0a0a0a',color:'#fff',border:'none',fontSize:'12px',cursor:'pointer'}}>Clear Filters</button>
            </div>
          ) : (
            <div className="col-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2px'}}>
              {products.map((product, i) => {
                const price = product?.priceRange?.minVariantPrice;
                const comparePrice = product?.compareAtPriceRange?.minVariantPrice;
                const imgNode = product?.images?.nodes?.[0];
                const variantId = product?.variants?.nodes?.[0]?.id;
                const isAvailable = product?.variants?.nodes?.[0]?.availableForSale;
                const isOnSale = comparePrice && parseFloat(comparePrice.amount) > parseFloat(price?.amount || 0);
                return (
                  <div key={product.id} style={{position:'relative',background:'#fff'}}>
                    {isOnSale && <div style={{position:'absolute',top:'12px',left:'12px',zIndex:2,background:'#0a0a0a',color:'#fff',fontSize:'10px',padding:'2px 8px',letterSpacing:'1px'}}>Sale</div>}
                    {i < 2 && !isOnSale && <div style={{position:'absolute',top:'12px',left:'12px',zIndex:2,background:'#c9a84c',color:'#0a0a0a',fontSize:'10px',padding:'2px 8px',letterSpacing:'1px'}}>New</div>}
                    <Link to={'/products/' + product.handle} style={{display:'block',textDecoration:'none',color:'inherit'}}>
                      <div style={{aspectRatio:'1/1',background:'#f5f5f0',overflow:'hidden'}}>
                        {imgNode
                          ? <img src={imgNode.url} alt={imgNode.altText || product.title} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.6s ease'}} onMouseEnter={e => e.currentTarget.style.transform='scale(1.04)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} />
                          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px'}}>⌚</div>
                        }
                      </div>
                      <div style={{padding:'16px 12px 12px'}}>
                        {product.vendor && <p style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#9ca3af',marginBottom:'4px'}}>{product.vendor}</p>}
                        <h3 style={{fontSize:'13px',fontWeight:500,lineHeight:'1.4',marginBottom:'8px',color:'#0a0a0a'}}>{product.title}</h3>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          {price && <span style={{fontSize:'14px',fontWeight:600,color:'#0a0a0a'}}>{fmt(price.amount, price.currencyCode)}</span>}
                          {isOnSale && <span style={{fontSize:'12px',color:'#9ca3af',textDecoration:'line-through'}}>{fmt(comparePrice.amount, comparePrice.currencyCode)}</span>}
                        </div>
                      </div>
                    </Link>
                    <Link to={'/products/' + product.handle} style={{display:'block',width:'calc(100% - 24px)',margin:'0 12px 16px',padding:'10px',background:'#0a0a0a',color:'#fff',textAlign:'center',fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',textDecoration:'none',fontWeight:600}}>
                      View Product
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
          {hasNextPage && (
            <div style={{textAlign:'center',marginTop:'48px',paddingBottom:'40px'}}>
              <button
                onClick={loadMore}
                disabled={fetcher.state === 'loading'}
                style={{border:'1px solid #0a0a0a',padding:'14px 48px',fontSize:'12px',letterSpacing:'3px',textTransform:'uppercase',background:fetcher.state==='loading'?'#f5f5f5':'transparent',cursor:fetcher.state==='loading'?'wait':'pointer'}}>
                {fetcher.state === 'loading' ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
      <Analytics.CollectionView data={{collection: {id: collection.id, handle: collection.handle}}} />
    </div>
  );
}

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Collection($handle: String!, $first: Int, $after: String) {
    collection(handle: $handle) {
      id title description handle
      image { url altText width height }
      products(first: $first, after: $after, sortKey: BEST_SELLING) {
        nodes { ...ProductCard }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;