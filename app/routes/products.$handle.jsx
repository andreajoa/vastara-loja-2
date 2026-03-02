import {data, Await, useLoaderData, Link} from 'react-router';
import {Suspense, useState, useContext} from 'react';
import {Analytics, getSelectedProductOptions} from '@shopify/hydrogen';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import ProductCard from '~/components/ProductCard';
import {CartContext} from '~/components/Layout';

function fmt(amount, currency='USD') {
  return new Intl.NumberFormat('en-US',{style:'currency',currency}).format(amount);
}

export async function loader({params, request, context}) {
  const {handle} = params;
  const {storefront} = context;
  const selectedOptions = getSelectedProductOptions(request);
  const [{product}, recommended] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {variables:{handle,selectedOptions}}),
    storefront.query(RECOMMENDED_QUERY, {variables:{handle}}).catch(()=>({productRecommendations:[]})),
  ]);
  if (!product) throw new Response('Not found',{status:404});
  return data({product, recommended: recommended?.productRecommendations || []});
}

export const meta = ({data}) => [{title:`${data?.product?.title||'Product'} | Vastara`}];

export default function ProductPage() {
  const {product, recommended} = useLoaderData();
  const cart = useContext(CartContext);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.nodes?.[0]);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const images = product?.images?.nodes || [];
  const variants = product?.variants?.nodes || [];
  const price = selectedVariant?.price;
  const comparePrice = selectedVariant?.compareAtPrice;
  const isAvailable = selectedVariant?.availableForSale;

  const handleAdd = () => {
    if (selectedVariant?.id) {
      cart?.addToCart(selectedVariant.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  return (
    <div style={{paddingTop:'104px',fontFamily:'"DM Sans",sans-serif'}}>
      <div style={{padding:'12px 24px',fontSize:'12px',color:'#6b7280',maxWidth:'1400px',margin:'0 auto'}}>
        <Link to="/" style={{color:'#6b7280',textDecoration:'none'}}>Home</Link>
        <span style={{margin:'0 6px'}}>/</span>
        <Link to="/collections/all" style={{color:'#6b7280',textDecoration:'none'}}>Watches</Link>
        <span style={{margin:'0 6px'}}>/</span>
        <span style={{color:'#0a0a0a'}}>{product.title}</span>
      </div>

      <div style={{maxWidth:'1400px',margin:'0 auto',padding:'16px 24px 64px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'64px',alignItems:'start'}}>
        <div>
          <div style={{aspectRatio:'1/1',background:'#f5f5f0',marginBottom:'12px',overflow:'hidden'}}>
            {images[selectedImg] && (
              <img src={images[selectedImg].url} alt={images[selectedImg].altText||product.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
            )}
          </div>
          {images.length > 1 && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
              {images.slice(0,8).map((img,i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  style={{aspectRatio:'1/1',background:'#f5f5f0',border: selectedImg===i ? '2px solid #c9a84c' : '2px solid transparent',padding:0,cursor:'pointer',overflow:'hidden'}}>
                  <img src={img.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{position:'sticky',top:'120px'}}>
          {product.vendor && (
            <p style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'8px'}}>{product.vendor}</p>
          )}
          <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(1.5rem,2.5vw,2.2rem)',lineHeight:'1.3',marginBottom:'12px'}}>{product.title}</h1>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
            <span style={{color:'#f59e0b',fontSize:'14px'}}>★★★★★</span>
            <span style={{fontSize:'12px',color:'#6b7280',fontFamily:'monospace'}}>4.7 · 218 reviews</span>
          </div>
          <div style={{display:'flex',alignItems:'baseline',gap:'12px',marginBottom:'24px'}}>
            {price && <span style={{fontSize:'28px',fontWeight:'600'}}>{fmt(price.amount,price.currencyCode)}</span>}
            {comparePrice && parseFloat(comparePrice.amount) > parseFloat(price?.amount||0) && (
              <span style={{fontSize:'18px',color:'#9ca3af',textDecoration:'line-through'}}>{fmt(comparePrice.amount,comparePrice.currencyCode)}</span>
            )}
          </div>

          {product.options?.map(opt => (
            opt.optionValues?.length > 1 && (
              <div key={opt.id} style={{marginBottom:'20px'}}>
                <p style={{fontSize:'12px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'10px',color:'#374151'}}>
                  {opt.name}: <strong>{selectedVariant?.selectedOptions?.find(o=>o.name===opt.name)?.value}</strong>
                </p>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                  {opt.optionValues.map(val => {
                    const v = variants.find(v => v.selectedOptions.some(o=>o.name===opt.name&&o.value===val.name));
                    const isSel = selectedVariant?.selectedOptions?.some(o=>o.name===opt.name&&o.value===val.name);
                    return (
                      <button key={val.name} onClick={() => v && setSelectedVariant(v)}
                        style={{padding:'8px 16px',fontSize:'13px',cursor:'pointer',transition:'all 0.2s',
                          background: isSel?'#0a0a0a':'transparent',color: isSel?'#fff':'#0a0a0a',
                          border: isSel?'2px solid #0a0a0a':'1px solid #d1d5db'}}>
                        {val.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          ))}

          <div style={{display:'flex',gap:'12px',marginBottom:'20px'}}>
            <div style={{display:'flex',alignItems:'center',border:'1px solid #d1d5db'}}>
              <button onClick={() => setQty(Math.max(1,qty-1))} style={{width:'40px',height:'48px',background:'none',border:'none',cursor:'pointer',fontSize:'20px'}}>−</button>
              <span style={{width:'48px',textAlign:'center',fontFamily:'monospace',fontSize:'15px'}}>{qty}</span>
              <button onClick={() => setQty(qty+1)} style={{width:'40px',height:'48px',background:'none',border:'none',cursor:'pointer',fontSize:'20px'}}>+</button>
            </div>
            <button onClick={handleAdd} disabled={!isAvailable}
              style={{flex:1,padding:'0 24px',fontSize:'12px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',
                border:'none',cursor: isAvailable?'pointer':'not-allowed',transition:'all 0.3s',
                background: added?'#15803d':isAvailable?'#0a0a0a':'#d1d5db',color:'#fff'}}>
              {added ? '✓ Added!' : isAvailable ? 'Add to Cart' : 'Sold Out'}
            </button>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',padding:'20px 0',borderTop:'1px solid #f3f4f6',borderBottom:'1px solid #f3f4f6',marginBottom:'24px'}}>
            {[['🚚','Free Shipping','Orders $75+'],['↩','Easy Returns','30-day policy'],['🔒','Secure','SSL encrypted']].map(([icon,label,sub]) => (
              <div key={label} style={{textAlign:'center'}}>
                <div style={{fontSize:'24px',marginBottom:'4px'}}>{icon}</div>
                <p style={{fontSize:'11px',fontWeight:'600',marginBottom:'2px'}}>{label}</p>
                <p style={{fontSize:'10px',color:'#9ca3af'}}>{sub}</p>
              </div>
            ))}
          </div>

          <div style={{borderTop:'1px solid #e5e7eb'}}>
            <div style={{display:'flex',borderBottom:'1px solid #e5e7eb'}}>
              {['description','specifications','features'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{flex:1,padding:'12px 8px',fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',
                    background:'none',border:'none',cursor:'pointer',
                    color: activeTab===tab?'#c9a84c':'#9ca3af',
                    borderBottom: activeTab===tab?'2px solid #c9a84c':'2px solid transparent'}}>
                  {tab}
                </button>
              ))}
            </div>
            <div style={{padding:'20px 0',fontSize:'13px',lineHeight:'1.8',color:'#4b5563'}}>
              {activeTab==='description' && (
                <div dangerouslySetInnerHTML={{__html: product.descriptionHtml||'<p>No description available.</p>'}} />
              )}
              {activeTab==='specifications' && (
                <div>
                  {[['Case Material','Stainless Steel 316L'],['Case Diameter','44mm'],['Water Resistance','300M / 30 ATM'],['Crystal','Sapphire Anti-Reflective'],['Movement','Automatic'],['Power Reserve','42 hours'],['Strap','Silicone / Stainless'],['Warranty','5 Years']].map(([k,v]) => (
                    <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                      <span style={{color:'#6b7280'}}>{k}</span>
                      <span style={{fontWeight:'500'}}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab==='features' && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                  {['Sapphire Crystal','Swiss Movement','316L Steel','Luminous Hands','Scratch Resistant','5 Year Warranty','Helium Escape Valve','Screw-down Crown'].map(f => (
                    <div key={f} style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <span style={{color:'#c9a84c',fontWeight:'bold'}}>✓</span><span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section style={{background:'#0a0a0a',color:'#fff',padding:'80px 24px',textAlign:'center'}}>
        <p style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'16px'}}>Engineering Excellence</p>
        <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(2rem,4vw,3.5rem)',marginBottom:'56px'}}>Built For Underwater Exploration</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'32px',maxWidth:'900px',margin:'0 auto'}}>
          {[['300M','Water Resistance'],['44mm','Case Diameter'],['100h','Power Reserve'],['5yr','Warranty']].map(([stat,label]) => (
            <div key={stat}>
              <p style={{fontFamily:'"Playfair Display",serif',fontSize:'3rem',color:'#c9a84c',marginBottom:'8px'}}>{stat}</p>
              <p style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',color:'#9ca3af'}}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{maxWidth:'1400px',margin:'0 auto',padding:'64px 24px'}}>
        <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'2rem',marginBottom:'32px'}}>You May Also Like</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'24px'}}>
          {recommended.slice(0,4).map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={cart?.addToCart} />
          ))}
        </div>
      </section>

      <Analytics.ProductView data={{products:[{id:product.id,title:product.title,vendor:product.vendor,variantId:selectedVariant?.id}]}} />
    </div>
  );
}

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
    product(handle: $handle) {
      id title description descriptionHtml vendor handle
      options { id name optionValues { name } }
      images(first: 10) { nodes { url altText width height } }
      priceRange { minVariantPrice { amount currencyCode } }
      variants(first: 50) {
        nodes {
          id availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
          image { url altText }
        }
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        id availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
      }
    }
  }
`;

const RECOMMENDED_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query RecommendedProducts($handle: String!) {
    product(handle: $handle) {
      recommendations: metafield(namespace: "shopify--discovery--product_recommendation", key: "related_products") {
        value
      }
    }
    products(first: 4, sortKey: BEST_SELLING) {
      nodes { ...ProductCard }
    }
  }
`;
