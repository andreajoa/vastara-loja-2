import {useRouteLoaderData, useLoaderData, Link} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {useState} from 'react';

export async function loader({context}) {
  const cart = await context.cart.get();
  return {cart};
}

function fmt(amount, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {style:'currency', currency}).format(Number(amount));
}

// Produtos de upsell/cross-sell — VARIANT_ID_PLACEHOLDER deve ser substituído pelo ID real do Shopify
// Format: gid://shopify/ProductVariant/1234567890123456789
const UPSELL_PRODUCTS = [
  {
    id: 'upsell-1',
    title: 'Premium Leather Strap',
    subtitle: 'Upgrade your look instantly',
    price: '89.00',
    currency: 'BRL',
    image: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_1.jpg?v=1772467367',
    variantId: 'VARIANT_ID_PLACEHOLDER_1', // Substituir pelo gid://shopify/ProductVariant/... real
    badge: 'MOST POPULAR',
    badgeColor: '#c9a84c',
  },
  {
    id: 'upsell-2',
    title: 'Watch Case Protector',
    subtitle: 'Protect your investment',
    price: '49.00',
    currency: 'BRL',
    image: 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_2.jpg?v=1772467366',
    variantId: 'VARIANT_ID_PLACEHOLDER_2', // Substituir pelo gid://shopify/ProductVariant/... real
    badge: 'BUNDLE & SAVE',
    badgeColor: '#16a34a',
  },
];

// Order bump — produto de baixo ticket mostrado no checkout
const ORDER_BUMP = {
  id: 'bump-1',
  title: 'Extended Warranty — 2 Years',
  subtitle: 'Full coverage, zero worries',
  price: '29.00',
  currency: 'BRL',
  variantId: 'VARIANT_ID_PLACEHOLDER_BUMP', // Substituir pelo gid://shopify/ProductVariant/... real
};

// Componente Order Bump — adiciona automaticamente ao carrinho quando selecionado
function OrderBumpSection({bump, cartLines}) {
  const [bumpAdded, setBumpAdded] = useState(false);

  // Verifica se o bump já está no carrinho
  const isInCart = cartLines.some(line =>
    line.merchandise?.id === bump.variantId
  );

  return (
    <div style={{background:'#fffbeb',border:'2px dashed #c9a84c',borderRadius:'12px',padding:'20px 24px',marginBottom:'24px',display:'flex',gap:'16px',alignItems:'center'}}>
      {isInCart || bumpAdded ? (
        <>
          <div style={{width:'20px',height:'20px',background:'#c9a84c',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',flexShrink:0}}>✓</div>
          <div style={{flex:1}}>
            <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'3px',fontWeight:'700'}}>⚡ Added to Order</div>
            <div style={{fontSize:'13px',fontWeight:'600',color:'#0a0a0a'}}>{bump.title}</div>
          </div>
          <span style={{fontSize:'16px',fontWeight:'700',color:'#0a0a0a',flexShrink:0}}>{fmt(bump.price, bump.currency)}</span>
        </>
      ) : (
        <CartForm route="/cart" action={CartForm.ACTIONS.LinesAdd} inputs={{lines:[{merchandiseId:bump.variantId,quantity:1}]}}>
          {(fetcher) => (
            <div style={{display:'flex',gap:'16px',alignItems:'center',width:'100%'}}>
              <input type="checkbox" id="order-bump" defaultChecked={false}
                onChange={(e) => { if (e.target.checked) setBumpAdded(true); }}
                style={{width:'18px',height:'18px',accentColor:'#c9a84c',flexShrink:0,cursor:'pointer'}} />
              <label htmlFor="order-bump" style={{cursor:'pointer',flex:1}}>
                <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'3px',fontWeight:'700'}}>⚡ Special Offer — Add to Order</div>
                <div style={{fontSize:'13px',fontWeight:'600',color:'#0a0a0a'}}>{bump.title}</div>
                <div style={{fontSize:'12px',color:'#6b7280',marginTop:'2px'}}>{bump.subtitle}</div>
              </label>
              <span style={{fontSize:'16px',fontWeight:'700',color:'#0a0a0a',flexShrink:0}}>{fmt(bump.price, bump.currency)}</span>
            </div>
          )}
        </CartForm>
      )}
    </div>
  );
}

function UpsellCard({product, onAdded}) {
  const isPlaceholder = product.variantId?.includes('PLACEHOLDER') || !product.variantId;

  if (isPlaceholder) {
    // Sem variantId real — mostra card com nota de configuração
    return (
      <div style={{background:'#fff',border:'1px solid #f0f0f0',borderRadius:'12px',overflow:'hidden',display:'flex',gap:'0',flexDirection:'column',position:'relative',opacity:0.7}}>
        {product.badge && (
          <div style={{position:'absolute',top:'12px',left:'12px',background:product.badgeColor,color:'#fff',fontSize:'9px',letterSpacing:'2px',padding:'3px 8px',borderRadius:'4px',fontWeight:'700'}}>
            {product.badge}
          </div>
        )}
        <div style={{height:'180px',background:'#f5f5f0',overflow:'hidden'}}>
          <img src={product.image} alt={product.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
        </div>
        <div style={{padding:'16px'}}>
          <p style={{fontSize:'13px',fontWeight:'600',color:'#0a0a0a',margin:'0 0 3px'}}>{product.title}</p>
          <p style={{fontSize:'11px',color:'#9ca3af',margin:'0 0 12px'}}>{product.subtitle}</p>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:'15px',fontWeight:'700',color:'#0a0a0a'}}>{fmt(product.price, product.currency)}</span>
            <span style={{fontSize:'9px',color:'#f59e0b',letterSpacing:'0.5px',background:'#fef3c7',padding:'4px 8px',borderRadius:'4px'}}>Configure variant ID</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:'#fff',border:'1px solid #f0f0f0',borderRadius:'12px',overflow:'hidden',display:'flex',flexDirection:'column',position:'relative'}}>
      {product.badge && (
        <div style={{position:'absolute',top:'12px',left:'12px',background:product.badgeColor,color:'#fff',fontSize:'9px',letterSpacing:'2px',padding:'3px 8px',borderRadius:'4px',fontWeight:'700',zIndex:1}}>
          {product.badge}
        </div>
      )}
      <div style={{height:'180px',background:'#f5f5f0',overflow:'hidden'}}>
        <img src={product.image} alt={product.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
      </div>
      <div style={{padding:'16px'}}>
        <p style={{fontSize:'13px',fontWeight:'600',color:'#0a0a0a',margin:'0 0 3px'}}>{product.title}</p>
        <p style={{fontSize:'11px',color:'#9ca3af',margin:'0 0 12px'}}>{product.subtitle}</p>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:'15px',fontWeight:'700',color:'#0a0a0a'}}>{fmt(product.price, product.currency)}</span>
          <CartForm route="/cart" action={CartForm.ACTIONS.LinesAdd} inputs={{lines:[{merchandiseId:product.variantId,quantity:1}]}}>
            {(fetcher) => (
              <button type="submit" disabled={fetcher.state!=='idle'}
                style={{padding:'8px 16px',background:'#0a0a0a',color:'#fff',border:'none',borderRadius:'8px',fontSize:'11px',letterSpacing:'1px',cursor:'pointer',textTransform:'uppercase'}}>
                {fetcher.state!=='idle' ? '...' : '+ Add'}
              </button>
            )}
          </CartForm>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const {cart} = useLoaderData();
  const lines = cart?.lines?.nodes ?? [];
  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;
  const checkoutUrl = cart?.checkoutUrl;

  // Verifica se upsells estão configurados
  const upsellsConfigured = !UPSELL_PRODUCTS.some(p => p.variantId?.includes('PLACEHOLDER') || !p.variantId);
  const bumpConfigured = !ORDER_BUMP.variantId?.includes('PLACEHOLDER') && ORDER_BUMP.variantId;

  return (
    <div style={{minHeight:'100vh',background:'#fafafa',paddingTop:'96px',fontFamily:'sans-serif'}}>
      <div style={{maxWidth:'1100px',margin:'0 auto',padding:'40px 24px'}}>

        {/* Header */}
        <div style={{marginBottom:'40px'}}>
          <Link to="/" style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#bbb',textDecoration:'none'}}>← Continue Shopping</Link>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'32px',fontWeight:'400',color:'#0a0a0a',margin:'12px 0 4px'}}>Review Your Order</h1>
          <p style={{fontSize:'13px',color:'#9ca3af',margin:0}}>Almost there — review your items and complete your purchase.</p>
        </div>

        {/* Nota de configuração - mostrar em desenvolvimento */}
        {!upsellsConfigured && (
          <div style={{background:'#fef3c7',border:'1px solid #f59e0b',borderRadius:'8px',padding:'12px 16px',marginBottom:'24px'}}>
            <p style={{fontSize:'12px',color:'#92400e',margin:0}}>
              <strong>Atenção:</strong> Para ativar os produtos de upsell, substitua os <code>variantId</code> em <code>checkout.jsx</code> pelos IDs reais do Shopify (formato: <code>gid://shopify/ProductVariant/1234567890123456789</code>).
            </p>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:'32px',alignItems:'start'}}>

          {/* LEFT — items + upsell */}
          <div>

            {/* Cart Items */}
            <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #f0f0f0',marginBottom:'24px',overflow:'hidden'}}>
              <div style={{padding:'20px 24px',borderBottom:'1px solid #f5f5f5'}}>
                <h2 style={{fontSize:'13px',fontWeight:'600',letterSpacing:'1px',textTransform:'uppercase',color:'#0a0a0a',margin:0}}>Your Items ({cart?.totalQuantity||0})</h2>
              </div>
              {lines.length === 0 ? (
                <div style={{padding:'40px 24px',textAlign:'center',color:'#9ca3af',fontSize:'14px'}}>
                  Your bag is empty. <Link to="/collections" style={{color:'#c9a84c'}}>Start shopping →</Link>
                </div>
              ) : lines.map((line, i) => (
                <div key={line.id} style={{display:'flex',gap:'16px',padding:'20px 24px',borderBottom:i<lines.length-1?'1px solid #f5f5f5':'none'}}>
                  <div style={{width:'72px',height:'72px',background:'#f5f5f0',borderRadius:'8px',overflow:'hidden',flexShrink:0}}>
                    {line.merchandise?.image
                      ? <img src={line.merchandise.image.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                      : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',opacity:0.3}}>⌚</div>
                    }
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:'14px',fontWeight:'500',color:'#0a0a0a',margin:'0 0 3px'}}>{line.merchandise?.product?.title}</p>
                    {line.merchandise?.selectedOptions?.filter(o=>o.value!=='Default Title').length > 0 && (
                      <p style={{fontSize:'12px',color:'#9ca3af',margin:'0 0 8px'}}>
                        {line.merchandise.selectedOptions.filter(o=>o.value!=='Default Title').map(o=>o.value).join(' / ')}
                      </p>
                    )}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      {/* Qty controls */}
                      <div style={{display:'flex',alignItems:'center',border:'1px solid #e5e7eb',borderRadius:'8px',overflow:'hidden'}}>
                        <CartForm route="/cart" action={CartForm.ACTIONS.LinesUpdate} inputs={{lines:[{id:line.id,quantity:Math.max(0,line.quantity-1)}]}}>
                          <button type="submit" style={{width:'28px',height:'28px',background:'none',border:'none',cursor:'pointer',fontSize:'14px',color:'#666'}}>−</button>
                        </CartForm>
                        <span style={{width:'24px',textAlign:'center',fontSize:'13px',fontWeight:'500'}}>{line.quantity}</span>
                        <CartForm route="/cart" action={CartForm.ACTIONS.LinesUpdate} inputs={{lines:[{id:line.id,quantity:line.quantity+1}]}}>
                          <button type="submit" style={{width:'28px',height:'28px',background:'none',border:'none',cursor:'pointer',fontSize:'14px',color:'#666'}}>+</button>
                        </CartForm>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <span style={{fontSize:'14px',fontWeight:'600',color:'#0a0a0a'}}>
                          {line.cost?.totalAmount && fmt(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',justifyContent:'flex-start'}}>
                    <CartForm route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{lineIds:[line.id]}}>
                      <button type="submit" style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:'16px',padding:'0'}}>✕</button>
                    </CartForm>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Bump */}
            {ORDER_BUMP.variantId && !ORDER_BUMP.variantId.includes('PLACEHOLDER') && (
              <OrderBumpSection bump={ORDER_BUMP} cartLines={lines} />
            )}

            {/* Upsell / Cross-sell */}
            <div style={{marginBottom:'24px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
                <div style={{flex:1,height:'1px',background:'#e5e7eb'}} />
                <span style={{fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',color:'#9ca3af',whiteSpace:'nowrap'}}>Complete Your Look</span>
                <div style={{flex:1,height:'1px',background:'#e5e7eb'}} />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                {UPSELL_PRODUCTS.map(p => <UpsellCard key={p.id} product={p} />)}
              </div>
            </div>

          </div>

          {/* RIGHT — order summary + checkout */}
          <div style={{position:'sticky',top:'120px'}}>
            <div style={{background:'#fff',border:'1px solid #f0f0f0',borderRadius:'12px',padding:'24px'}}>
              <h2 style={{fontSize:'13px',fontWeight:'600',letterSpacing:'1px',textTransform:'uppercase',color:'#0a0a0a',margin:'0 0 20px'}}>Order Summary</h2>

              {lines.map(line => (
                <div key={line.id} style={{display:'flex',justifyContent:'space-between',marginBottom:'10px',fontSize:'13px'}}>
                  <span style={{color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'180px'}}>
                    {line.merchandise?.product?.title} × {line.quantity}
                  </span>
                  <span style={{fontWeight:'500',color:'#0a0a0a',flexShrink:0,marginLeft:'8px'}}>
                    {line.cost?.totalAmount && fmt(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                  </span>
                </div>
              ))}

              <div style={{borderTop:'1px solid #f0f0f0',marginTop:'16px',paddingTop:'16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'8px'}}>
                  <span style={{color:'#6b7280'}}>Subtotal</span>
                  <span style={{fontWeight:'500'}}>{subtotal && fmt(subtotal.amount, subtotal.currencyCode)}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'16px'}}>
                  <span style={{color:'#6b7280'}}>Shipping</span>
                  <span style={{color:'#16a34a',fontWeight:'500'}}>FREE</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'16px',fontWeight:'700',color:'#0a0a0a',marginBottom:'20px',paddingTop:'12px',borderTop:'1px solid #f0f0f0'}}>
                  <span>Total</span>
                  <span>{total && fmt(total.amount, total.currencyCode)}</span>
                </div>
              </div>

              {/* Botão Shopify Checkout */}
              {checkoutUrl ? (
                <a href={checkoutUrl}
                  style={{display:'block',width:'100%',background:'#0a0a0a',color:'#fff',textAlign:'center',padding:'18px',fontSize:'12px',letterSpacing:'2px',textTransform:'uppercase',textDecoration:'none',borderRadius:'10px',boxSizing:'border-box',fontWeight:'600'}}>
                  Proceed to Checkout →
                </a>
              ) : (
                <div style={{display:'block',width:'100%',background:'#e5e7eb',color:'#9ca3af',textAlign:'center',padding:'18px',fontSize:'12px',letterSpacing:'2px',textTransform:'uppercase',borderRadius:'10px',boxSizing:'border-box'}}>
                  Loading...
                </div>
              )}

              <div style={{marginTop:'16px',display:'flex',flexDirection:'column',gap:'8px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'11px',color:'#9ca3af',justifyContent:'center'}}>
                  <span>🔒</span> Secure checkout via Shopify
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'11px',color:'#9ca3af',justifyContent:'center'}}>
                  <span>🚚</span> Free worldwide shipping
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'11px',color:'#9ca3af',justifyContent:'center'}}>
                  <span>↩️</span> 30-day money-back guarantee
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
