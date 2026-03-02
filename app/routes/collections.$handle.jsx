import {json} from '@shopify/hydrogen';
import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {useState, useContext} from 'react';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {CartContext} from '~/components/Layout';

export async function loader({params, request, context}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});
  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {handle, ...paginationVariables}
  });
  if (!collection) throw new Response('Not found', {status:404});
  return json({collection});
}

export const meta = ({data}) => [{title:`${data?.collection?.title || 'Collection'} | Vastara`}];

function fmt(amount, currency='USD') {
  return new Intl.NumberFormat('en-US',{style:'currency',currency}).format(amount);
}

function Stars({count=5}) {
  return <span style={{color:'#f59e0b',fontSize:'11px'}}>{'★'.repeat(count)}{'☆'.repeat(5-count)}</span>;
}

export default function CollectionPage() {
  const {collection} = useLoaderData();
  const cart = useContext(CartContext);
  const [sort, setSort] = useState('BEST_SELLING');
  const products = collection?.products?.nodes || [];

  return (
    <div style={{paddingTop:'104px',fontFamily:'"DM Sans",sans-serif'}}>

      {/* Breadcrumb */}
      <div style={{padding:'12px 24px',fontSize:'12px',color:'#6b7280',maxWidth:'1400px',margin:'0 auto'}}>
        <Link to="/" style={{color:'#6b7280',textDecoration:'none'}}>Home</Link>
        <span style={{margin:'0 8px'}}>/</span>
        <span style={{color:'#0a0a0a'}}>{collection.title}</span>
      </div>

      {/* Title + Sort bar */}
      <div style={{maxWidth:'1400px',margin:'0 auto',padding:'0 24px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px'}}>
        <div>
          <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(1.5rem,3vw,2.5rem)',marginBottom:'4px'}}>{collection.title}</h1>
          <p style={{fontSize:'13px',color:'#6b7280'}}>{products.length} Products</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{fontSize:'12px',color:'#6b7280',fontFamily:'monospace'}}>Apply best sellers filter</span>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            style={{border:'1px solid #e5e7eb',padding:'8px 32px 8px 12px',fontSize:'12px',background:'#fff',cursor:'pointer',outline:'none'}}>
            <option value="BEST_SELLING">Best Selling</option>
            <option value="PRICE_ASC">Price: Low to High</option>
            <option value="PRICE_DESC">Price: High to Low</option>
            <option value="CREATED_AT">Newest</option>
          </select>
        </div>
      </div>

      {/* Product Grid — 3 columns with lifestyle images intercalated */}
      <div style={{maxWidth:'1400px',margin:'0 auto',padding:'0 24px 80px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2px'}}>
          {products.map((product, i) => {
            const price = product?.priceRange?.minVariantPrice;
            const comparePrice = product?.compareAtPriceRange?.minVariantPrice;
            const img = product?.images?.nodes?.[0];
            const variantId = product?.variants?.nodes?.[0]?.id;
            const isAvailable = product?.variants?.nodes?.[0]?.availableForSale;
            const isOnSale = comparePrice && parseFloat(comparePrice.amount) > parseFloat(price?.amount||0);

            return (
              <div key={product.id} style={{position:'relative',background:'#fff'}}>
                {/* Sale badge */}
                {isOnSale && (
                  <div style={{position:'absolute',top:'12px',left:'12px',zIndex:2,background:'#0a0a0a',color:'#fff',fontSize:'10px',padding:'2px 8px',fontFamily:'monospace',letterSpacing:'1px'}}>
                    On Sale
                  </div>
                )}
                {/* New badge for first few */}
                {i < 2 && !isOnSale && (
                  <div style={{position:'absolute',top:'12px',left:'12px',zIndex:2,background:'#c9a84c',color:'#0a0a0a',fontSize:'10px',padding:'2px 8px',fontFamily:'monospace',letterSpacing:'1px'}}>
                    New
                  </div>
                )}

                <Link to={`/products/${product.handle}`} style={{display:'block',textDecoration:'none',color:'inherit'}}>
                  <div style={{aspectRatio:'1/1',background:'#f5f5f0',overflow:'hidden',position:'relative'}}>
                    {img
                      ? <img src={img.url} alt={img.altText||product.title} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.6s ease'}}
                          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'}
                          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'} />
                      : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px'}}>⌚</div>
                    }
                  </div>
                  <div style={{padding:'16px 12px 20px'}}>
                    {product.vendor && (
                      <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',color:'#9ca3af',marginBottom:'4px'}}>{product.vendor}</p>
                    )}
                    <h3 style={{fontSize:'13px',fontWeight:'500',lineHeight:'1.4',marginBottom:'8px',color:'#0a0a0a'}}>{product.title}</h3>
                    <p style={{fontSize:'11px',color:'#6b7280',marginBottom:'8px',lineHeight:'1.5'}}>
                      {product.tags?.slice(0,3).join(' · ')}
                    </p>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                      {price && <span style={{fontSize:'14px',fontWeight:'600',color:'#0a0a0a'}}>{fmt(price.amount,price.currencyCode)}</span>}
                      {isOnSale && <span style={{fontSize:'12px',color:'#9ca3af',textDecoration:'line-through'}}>{fmt(comparePrice.amount,comparePrice.currencyCode)}</span>}
                    </div>
                    <Stars count={5} />
                  </div>
                </Link>
                <button
                  onClick={() => isAvailable && variantId && cart?.addToCart(variantId,1)}
                  disabled={!isAvailable}
                  style={{display:'none',width:'calc(100% - 24px)',margin:'0 12px 16px',padding:'10px',background: isAvailable?'#0a0a0a':'#d1d5db',color:'#fff',border:'none',fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',cursor: isAvailable?'pointer':'not-allowed'}}
                  className="add-to-cart-btn">
                  {isAvailable ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Load More */}
        {collection?.products?.pageInfo?.hasNextPage && (
          <div style={{textAlign:'center',marginTop:'48px'}}>
            <button style={{border:'1px solid #0a0a0a',padding:'14px 48px',fontSize:'12px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',background:'transparent',cursor:'pointer'}}>
              Load More
            </button>
          </div>
        )}
      </div>

      <style>{`
        div:hover > .add-to-cart-btn { display: block !important; }
      `}</style>

      <Analytics.CollectionView data={{collection:{id:collection.id,handle:collection.handle}}} />
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
