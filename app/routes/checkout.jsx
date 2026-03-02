
import {data as json, redirect, useLoaderData, Link} from 'react-router';
import {useState, useContext} from 'react';
import {CartContext} from '~/components/Layout';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';

function fmt(amount, currency='USD') {
  return new Intl.NumberFormat('en-US',{style:'currency',currency}).format(amount);
}

export async function loader({context}) {
  const {cart, storefront} = context;
  const cartData = await cart.get();
  if (!cartData || cartData.totalQuantity === 0) return redirect('/');
  const {products} = await storefront.query(UPSELL_QUERY);
  return json({cart: cartData, upsells: products?.nodes || []});
}

export const meta = () => [{title:'Checkout | Vastara'}];

export default function CheckoutPage() {
  const {cart, upsells} = useLoaderData();
  const cartCtx = useContext(CartContext);
  const [orderBump, setOrderBump] = useState(false);
  const [showDownsell, setShowDownsell] = useState(false);
  const [upsellDismissed, setUpsellDismissed] = useState(false);

  const lines = cart?.lines?.nodes || [];
  const subtotal = cart?.cost?.subtotalAmount;

  const crossSells = upsells.slice(0,3);
  const upsellProduct = upsells[3] || upsells[0];
  const orderBumpProduct = upsells[4] || upsells[1];
  const downsellProduct = upsells[5] || upsells[2];

  const handleCheckout = () => {
    if (cart?.checkoutUrl) window.location.href = cart.checkoutUrl;
  };

  return (
    <div style={{paddingTop:'104px',background:'#f9fafb',minHeight:'100vh',fontFamily:'"DM Sans",sans-serif'}}>
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'32px 24px'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'32px',flexWrap:'wrap'}}>
          <Link to="/" style={{fontSize:'13px',color:'#9ca3af',textDecoration:'none',fontFamily:'monospace'}}>← Continue Shopping</Link>
          <span style={{color:'#e5e7eb'}}>|</span>
          <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:'2rem'}}>Checkout</h1>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:'32px',alignItems:'start'}}>

          {/* LEFT COLUMN — Offers */}
          <div style={{display:'flex',flexDirection:'column',gap:'24px'}}>

            {/* CROSS-SELLS */}
            {crossSells.length > 0 && (
              <div style={{background:'#fff',border:'1px solid #e5e7eb',padding:'24px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
                  <span style={{background:'#c9a84c',color:'#0a0a0a',fontSize:'10px',fontFamily:'monospace',letterSpacing:'2px',padding:'4px 10px',textTransform:'uppercase'}}>
                    Frequently Bought Together
                  </span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
                  {crossSells.map(p => {
                    const price = p.priceRange?.minVariantPrice;
                    const img = p.images?.nodes?.[0];
                    const variantId = p.variants?.nodes?.[0]?.id;
                    return (
                      <div key={p.id} style={{textAlign:'center'}}>
                        <div style={{aspectRatio:'1/1',background:'#f5f5f0',marginBottom:'8px',overflow:'hidden'}}>
                          {img && <img src={img.url} alt={p.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />}
                        </div>
                        <p style={{fontSize:'12px',fontWeight:'500',marginBottom:'4px',lineHeight:'1.3'}}>{p.title}</p>
                        {price && <p style={{fontSize:'12px',color:'#c9a84c',fontFamily:'monospace',marginBottom:'8px'}}>{fmt(price.amount,price.currencyCode)}</p>}
                        <button onClick={() => variantId && cartCtx?.addToCart(variantId,1)}
                          style={{width:'100%',padding:'8px',background:'#f3f4f6',border:'none',fontSize:'11px',fontFamily:'monospace',letterSpacing:'1px',cursor:'pointer',transition:'all 0.2s'}}
                          onMouseEnter={e=>{e.currentTarget.style.background='#0a0a0a';e.currentTarget.style.color='#fff';}}
                          onMouseLeave={e=>{e.currentTarget.style.background='#f3f4f6';e.currentTarget.style.color='#0a0a0a';}}>
                          + Add
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* UPSELL — One-time offer */}
            {upsellProduct && !upsellDismissed && (
              <div style={{background:'#0a0a0a',color:'#fff',padding:'24px',position:'relative'}}>
                <button onClick={() => setUpsellDismissed(true)}
                  style={{position:'absolute',top:'16px',right:'16px',background:'none',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'18px'}}>✕</button>
                <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'12px'}}>
                  ⚡ Special One-Time Offer — This Page Only
                </p>
                <div style={{display:'flex',gap:'20px',alignItems:'center'}}>
                  {upsellProduct.images?.nodes?.[0] && (
                    <div style={{width:'100px',height:'100px',background:'#1f2937',flexShrink:0,overflow:'hidden'}}>
                      <img src={upsellProduct.images.nodes[0].url} alt={upsellProduct.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    </div>
                  )}
                  <div style={{flex:1}}>
                    <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:'1.3rem',marginBottom:'8px'}}>{upsellProduct.title}</h3>
                    <p style={{fontSize:'13px',color:'#9ca3af',marginBottom:'16px',lineHeight:'1.6'}}>
                      Add this exclusive item at a special checkout price. Never offered at this price again.
                    </p>
                    <div style={{display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
                      {upsellProduct.priceRange?.minVariantPrice && (
                        <span style={{fontSize:'20px',fontWeight:'700',color:'#c9a84c'}}>
                          {fmt(upsellProduct.priceRange.minVariantPrice.amount, upsellProduct.priceRange.minVariantPrice.currencyCode)}
                        </span>
                      )}
                      <button onClick={() => {
                        const vid = upsellProduct.variants?.nodes?.[0]?.id;
                        if (vid) cartCtx?.addToCart(vid,1);
                        setUpsellDismissed(true);
                      }}
                        style={{padding:'12px 24px',background:'#c9a84c',color:'#0a0a0a',border:'none',fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer'}}>
                        Yes, Add to My Order!
                      </button>
                      <button onClick={() => setUpsellDismissed(true)}
                        style={{fontSize:'12px',color:'#6b7280',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>
                        No thanks
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ORDER BUMP */}
            {orderBumpProduct && (
              <div style={{border:'2px dashed #c9a84c',padding:'20px',background: orderBump?'#fef9ec':'#fff',cursor:'pointer',transition:'background 0.2s'}}
                onClick={() => {
                  const newVal = !orderBump;
                  setOrderBump(newVal);
                  const vid = orderBumpProduct.variants?.nodes?.[0]?.id;
                  if (newVal && vid) cartCtx?.addToCart(vid,1);
                }}>
                <label style={{display:'flex',alignItems:'flex-start',gap:'16px',cursor:'pointer'}} onClick={e=>e.stopPropagation()}>
                  <input type="checkbox" checked={orderBump}
                    onChange={e => {
                      setOrderBump(e.target.checked);
                      const vid = orderBumpProduct.variants?.nodes?.[0]?.id;
                      if (e.target.checked && vid) cartCtx?.addToCart(vid,1);
                    }}
                    style={{width:'20px',height:'20px',marginTop:'2px',flexShrink:0,accentColor:'#c9a84c'}} />
                  <div>
                    <p style={{fontWeight:'600',fontSize:'14px',marginBottom:'4px'}}>
                      ✅ Yes! Add <strong>{orderBumpProduct.title}</strong> to my order
                    </p>
                    <p style={{fontSize:'12px',color:'#6b7280',lineHeight:'1.6'}}>
                      Normally {orderBumpProduct.priceRange?.minVariantPrice && fmt(orderBumpProduct.priceRange.minVariantPrice.amount, orderBumpProduct.priceRange.minVariantPrice.currencyCode)}, add now for just{' '}
                      <strong style={{color:'#c9a84c'}}>
                        {orderBumpProduct.priceRange?.minVariantPrice && fmt(parseFloat(orderBumpProduct.priceRange.minVariantPrice.amount)*0.7, orderBumpProduct.priceRange.minVariantPrice.currencyCode)}
                      </strong>
                      {' '}— exclusive checkout offer.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* DOWNSELL */}
            <div>
              {!showDownsell ? (
                <button onClick={() => setShowDownsell(true)}
                  style={{fontSize:'12px',color:'#9ca3af',background:'none',border:'none',cursor:'pointer',textDecoration:'underline',padding:0}}>
                  Looking for a more affordable option? See our special offer →
                </button>
              ) : downsellProduct && (
                <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',padding:'20px'}}>
                  <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',color:'#2563eb',marginBottom:'12px'}}>
                    💙 Better Value Alternative
                  </p>
                  <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
                    {downsellProduct.images?.nodes?.[0] && (
                      <div style={{width:'72px',height:'72px',flexShrink:0,overflow:'hidden',background:'#dbeafe'}}>
                        <img src={downsellProduct.images.nodes[0].url} alt={downsellProduct.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      </div>
                    )}
                    <div style={{flex:1}}>
                      <h4 style={{fontWeight:'600',marginBottom:'4px',fontSize:'14px'}}>{downsellProduct.title}</h4>
                      <p style={{fontSize:'12px',color:'#4b5563',marginBottom:'12px'}}>A great alternative at a more accessible price point.</p>
                      <button onClick={() => {
                        const vid = downsellProduct.variants?.nodes?.[0]?.id;
                        if (vid) cartCtx?.addToCart(vid,1);
                        setShowDownsell(false);
                      }}
                        style={{padding:'8px 20px',background:'#2563eb',color:'#fff',border:'none',fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer'}}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — Order Summary */}
          <div style={{position:'sticky',top:'120px'}}>
            <div style={{background:'#fff',border:'1px solid #e5e7eb',padding:'24px'}}>
              <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'1.5rem',marginBottom:'24px'}}>Order Summary</h2>

              {/* Line items */}
              <div style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'24px'}}>
                {lines.map(line => (
                  <div key={line.id} style={{display:'flex',gap:'12px',alignItems:'center'}}>
                    <div style={{width:'56px',height:'56px',background:'#f5f5f0',flexShrink:0,overflow:'hidden',position:'relative'}}>
                      {line.merchandise?.image && (
                        <img src={line.merchandise.image.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      )}
                      <span style={{position:'absolute',top:'-6px',right:'-6px',background:'#6b7280',color:'#fff',fontSize:'10px',width:'18px',height:'18px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace'}}>
                        {line.quantity}
                      </span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:'13px',fontWeight:'500',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{line.merchandise?.product?.title}</p>
                      <p style={{fontSize:'11px',color:'#9ca3af'}}>{line.merchandise?.selectedOptions?.map(o=>o.value).join(' / ')}</p>
                    </div>
                    <p style={{fontSize:'13px',fontWeight:'600',flexShrink:0}}>
                      {line.cost?.totalAmount && fmt(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Discount code */}
              <div style={{display:'flex',gap:'8px',marginBottom:'20px'}}>
                <input type="text" placeholder="Discount code"
                  style={{flex:1,border:'1px solid #e5e7eb',padding:'10px 12px',fontSize:'13px',outline:'none'}} />
                <button style={{padding:'10px 16px',background:'#f3f4f6',border:'none',fontSize:'12px',fontFamily:'monospace',cursor:'pointer'}}>
                  Apply
                </button>
              </div>

              {/* Totals */}
              <div style={{borderTop:'1px solid #f3f4f6',paddingTop:'16px',marginBottom:'20px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                  <span style={{fontSize:'13px',color:'#6b7280'}}>Subtotal</span>
                  <span style={{fontSize:'13px'}}>{subtotal ? fmt(subtotal.amount,subtotal.currencyCode) : '—'}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'16px'}}>
                  <span style={{fontSize:'13px',color:'#6b7280'}}>Shipping</span>
                  <span style={{fontSize:'12px',color:'#16a34a'}}>Calculated at Shopify</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #e5e7eb',paddingTop:'16px'}}>
                  <span style={{fontWeight:'600'}}>Total</span>
                  <span style={{fontWeight:'700',fontSize:'18px'}}>{subtotal ? fmt(subtotal.amount,subtotal.currencyCode) : '—'}</span>
                </div>
              </div>

              {/* CTA */}
              <button onClick={handleCheckout}
                style={{width:'100%',padding:'16px',background:'#0a0a0a',color:'#fff',border:'none',fontSize:'12px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',cursor:'pointer',marginBottom:'12px',transition:'opacity 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
                onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                Complete Purchase →
              </button>

              <p style={{fontSize:'11px',textAlign:'center',color:'#9ca3af',marginBottom:'8px'}}>🔒 Secure checkout powered by Shopify</p>
              <p style={{fontSize:'11px',textAlign:'center',color:'#9ca3af'}}>You'll be redirected to Shopify to complete payment.</p>

              {/* Payment icons */}
              <div style={{display:'flex',justifyContent:'center',gap:'8px',marginTop:'16px',flexWrap:'wrap'}}>
                {['VISA','MC','AMEX','PayPal','Apple Pay'].map(p => (
                  <span key={p} style={{border:'1px solid #e5e7eb',padding:'4px 8px',fontSize:'9px',fontFamily:'monospace',color:'#6b7280',borderRadius:'3px'}}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const UPSELL_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query UpsellProducts {
    products(first: 6, sortKey: BEST_SELLING) {
      nodes { ...ProductCard }
    }
  }
`;
