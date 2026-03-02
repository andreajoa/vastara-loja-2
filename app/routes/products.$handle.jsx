import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from 'react-router';
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
  const {product} = await storefront.query(PRODUCT_QUERY, {variables:{handle,selectedOptions}});
  if (!product) throw new Response('Not found',{status:404});
  const recommended = storefront.query(RECOMMENDED_QUERY, {variables:{productId:product.id}});
  return defer({product, recommended});
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

      {/* Breadcrumb */}
      <div style={{padding:'12px 24px',fontSize:'12px',color:'#6b7280',maxWidth:'1400px',margin:'0 auto'}}>
        <Link to="/" style={{color:'#6b7280',textDecoration:'none'}}>Home</Link>
        <span style={{margin:'0 6px'}}>/</span>
        <Link to="/collections/all" style={{color:'#6b7280',textDecoration:'none'}}>Watches</Link>
        <span style={{margin:'0 6px'}}>/</span>
        <span style={{color:'#0a0a0a'}}>{product.title}</span>
      </div>

      {/* Main product section */}
      <div style={{maxWidth:'1400px',margin:'0 auto',padding:'16px 24px 64px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'64px',alignItems:'start'}}>

        {/* LEFT — Image Gallery */}
        <div>
          {/* Main image */}
          <div style={{aspectRatio:'1/1',background:'#f5f5f0',marginBottom:'12px',overflow:'hidden'}}>
            {images[selectedImg] && (
              <img src={images[selectedImg].url} alt={images[selectedImg].altText||product.title}
                style={{width:'100%',height:'100%',objectFit:'cover'}} />
            )}
          </div>
          {/* Thumbnails */}
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

        {/* RIGHT — Product Info */}
        <div style={{position:'sticky',top:'120px'}}>
          {product.vendor && (
            <p style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'8px'}}>{product.vendor}</p>
          )}
          <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(1.5rem,2.5vw,2.2rem)',lineHeight:'1.3',marginBottom:'12px'}}>{product.title}</h1>

          {/* Stars + reviews count */}
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
            <span style={{color:'#f59e0b',fontSize:'14px'}}>★★★★★</span>
            <span style={{fontSize:'12px',color:'#6b7280',fontFamily:'monospace'}}>4.7 · 218 reviews</span>
          </div>

          {/* Price */}
          <div style={{display:'flex',alignItems:'baseline',gap:'12px',marginBottom:'24px'}}>
            {price && <span style={{fontSize:'28px',fontWeight:'600'}}>{fmt(price.amount,price.currencyCode)}</span>}
            {comparePrice && parseFloat(comparePrice.amount) > parseFloat(price?.amount||0) && (
              <span style={{fontSize:'18px',color:'#9ca3af',textDecoration:'line-through'}}>{fmt(comparePrice.amount,comparePrice.currencyCode)}</span>
            )}
          </div>

          {/* Variants */}
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
                          background: isSel ? '#0a0a0a' : 'transparent',
                          color: isSel ? '#fff' : '#0a0a0a',
                          border: isSel ? '2px solid #0a0a0a' : '1px solid #d1d5db'}}>
                        {val.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          ))}

          {/* Qty + Add */}
          <div style={{display:'flex',gap:'12px',marginBottom:'20px'}}>
            <div style={{display:'flex',alignItems:'center',border:'1px solid #d1d5db'}}>
              <button onClick={() => setQty(Math.max(1,qty-1))} style={{width:'40px',height:'48px',background:'none',border:'none',cursor:'pointer',fontSize:'20px'}}>−</button>
              <span style={{width:'48px',textAlign:'center',fontFamily:'monospace',fontSize:'15px'}}>{qty}</span>
              <button onClick={() => setQty(qty+1)} style={{width:'40px',height:'48px',background:'none',border:'none',cursor:'pointer',fontSize:'20px'}}>+</button>
            </div>
            <button onClick={handleAdd} disabled={!isAvailable}
              style={{flex:1,padding:'0 24px',fontSize:'12px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',
                border:'none',cursor: isAvailable?'pointer':'not-allowed',transition:'all 0.3s',
                background: added ? '#15803d' : isAvailable ? '#0a0a0a' : '#d1d5db',
                color:'#fff'}}>
              {added ? '✓ Added!' : isAvailable ? 'Add to Cart' : 'Sold Out'}
            </button>
          </div>

          {/* Trust badges */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',padding:'20px 0',borderTop:'1px solid #f3f4f6',borderBottom:'1px solid #f3f4f6',marginBottom:'24px'}}>
            {[['🚚','Free Shipping','Orders $75+'],['↩','Easy Returns','30-day policy'],['🔒','Secure','SSL encrypted']].map(([icon,label,sub]) => (
              <div key={label} style={{textAlign:'center'}}>
                <div style={{fontSize:'24px',marginBottom:'4px'}}>{icon}</div>
                <p style={{fontSize:'11px',fontWeight:'600',marginBottom:'2px'}}>{label}</p>
                <p style={{fontSize:'10px',color:'#9ca3af'}}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{borderTop:'1px solid #e5e7eb'}}>
            <div style={{display:'flex',borderBottom:'1px solid #e5e7eb'}}>
              {['description','specifications','features'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{flex:1,padding:'12px 8px',fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',
                    background:'none',border:'none',cursor:'pointer',transition:'all 0.2s',
                    color: activeTab===tab ? '#c9a84c' : '#9ca3af',
                    borderBottom: activeTab===tab ? '2px solid #c9a84c' : '2px solid transparent'}}>
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
                  {[
                    ['Case Material','Stainless Steel 316L'],
                    ['Case Diameter','44mm'],
                    ['Water Resistance','300M / 30 ATM'],
                    ['Crystal','Sapphire Anti-Reflective'],
                    ['Movement','Automatic'],
                    ['Power Reserve','42 hours'],
                    ['Strap','Silicone / Stainless'],
                    ['Warranty','5 Years'],
                  ].map(([k,v]) => (
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
                      <span style={{color:'#c9a84c',fontWeight:'bold'}}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dark specs banner */}
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

      {/* Reviews */}
      <section style={{maxWidth:'1400px',margin:'0 auto',padding:'64px 24px'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'40px',flexWrap:'wrap',gap:'16px'}}>
          <div>
            <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'2rem',marginBottom:'8px'}}>Only Watch Reviews</h2>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <span style={{color:'#f59e0b',fontSize:'24px'}}>★★★★★</span>
              <span style={{fontFamily:'"Playfair Display",serif',fontSize:'2.5rem',fontWeight:'700'}}>4.7</span>
              <span style={{fontSize:'13px',color:'#9ca3af'}}>based on 218 reviews</span>
            </div>
          </div>
          <button style={{border:'1px solid #0a0a0a',padding:'12px 28px',fontSize:'12px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',background:'transparent',cursor:'pointer'}}>
            Write a Review
          </button>
        </div>

        {/* Rating breakdown */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'48px',marginBottom:'48px'}}>
          <div>
            {[[5,78],[4,15],[3,5],[2,1],[1,1]].map(([stars,pct]) => (
              <div key={stars} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                <span style={{fontSize:'12px',color:'#6b7280',width:'16px'}}>{stars}</span>
                <span style={{color:'#f59e0b',fontSize:'12px'}}>★</span>
                <div style={{flex:1,height:'6px',background:'#f3f4f6',borderRadius:'3px',overflow:'hidden'}}>
                  <div style={{width:`${pct}%`,height:'100%',background:'#c9a84c',borderRadius:'3px'}} />
                </div>
                <span style={{fontSize:'11px',color:'#9ca3af',width:'30px'}}>{pct}%</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:'13px',color:'#6b7280',lineHeight:'1.8'}}>
            <p>Customers love the quality and craftsmanship of this timepiece. The water resistance and luminous hands are frequently praised.</p>
          </div>
        </div>

        {/* Individual reviews */}
        <div style={{display:'grid',gap:'32px'}}>
          {[
            {name:'James M.',rating:5,date:'2025-01-15',title:'Perfect dive watch',body:'Incredibly impressed with the quality. The lume is phenomenal and the bracelet is comfortable all day long. Worth every penny.',verified:true,img:null},
            {name:'Sarah K.',rating:5,date:'2025-01-08',title:'Stunning timepiece',body:'Got this as a gift and it exceeded all expectations. The details are crisp and it keeps perfect time. The sapphire crystal is flawless.',verified:true,img:null},
            {name:'Robert T.',rating:4,date:'2024-12-22',title:'Great value for money',body:'Solid construction and beautiful design. One star off only because the clasp took some getting used to. Overall excellent watch.',verified:true,img:null},
            {name:'Maria L.',rating:5,date:'2024-12-10',title:'Exceeded expectations',body:'The ice blue dial is even more stunning in person. The automatic movement winds beautifully and the power reserve is impressive.',verified:true,img:null},
          ].map((r,i) => (
            <div key={i} style={{borderBottom:'1px solid #f3f4f6',paddingBottom:'32px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px',flexWrap:'wrap',gap:'8px'}}>
                <div>
                  <p style={{fontWeight:'600',marginBottom:'4px'}}>{r.name}</p>
                  <span style={{color:'#f59e0b'}}>{'★'.repeat(r.rating)}</span>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{fontSize:'12px',color:'#9ca3af',fontFamily:'monospace'}}>{r.date}</p>
                  {r.verified && <p style={{fontSize:'11px',color:'#16a34a',marginTop:'2px'}}>✓ Verified Purchase</p>}
                </div>
              </div>
              <p style={{fontWeight:'600',marginBottom:'8px',fontSize:'14px'}}>{r.title}</p>
              <p style={{fontSize:'13px',color:'#4b5563',lineHeight:'1.7'}}>{r.body}</p>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center',marginTop:'40px'}}>
          <button style={{border:'1px solid #e5e7eb',padding:'12px 32px',fontSize:'12px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',background:'transparent',cursor:'pointer',color:'#6b7280'}}>
            Load More Reviews
          </button>
        </div>
      </section>

      {/* Recommended */}
      <section style={{maxWidth:'1400px',margin:'0 auto',padding:'0 24px 80px'}}>
        <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'2rem',marginBottom:'32px'}}>You May Also Like</h2>
        <Suspense fallback={null}>
          <Await resolve={recommended}>
            {(data) => (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'24px'}}>
                {data?.productRecommendations?.slice(0,4).map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={cart?.addToCart} />
                ))}
              </div>
            )}
          </Await>
        </Suspense>
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
  query RecommendedProducts($productId: ID!) {
    productRecommendations(productId: $productId) { ...ProductCard }
  }
`;
