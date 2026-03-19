import {useState, useEffect} from 'react';
import {CartForm, useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';

function fmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {style:'currency', currency}).format(Number(amount));
}

function RemoveButton({lineId}) {
  return (
    <CartForm route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{lineIds:[lineId]}}>
      <button type="submit" style={{fontSize:'11px',color:'#bbb',background:'none',border:'none',cursor:'pointer',textDecoration:'underline',padding:0}}>
        Remove
      </button>
    </CartForm>
  );
}

function QtyButton({lineId, newQty, children}) {
  const isRemove = newQty === 0;
  return (
    <CartForm
      route="/cart"
      action={isRemove ? CartForm.ACTIONS.LinesRemove : CartForm.ACTIONS.LinesUpdate}
      inputs={isRemove ? {lineIds:[lineId]} : {lines:[{id:lineId, quantity:newQty}]}}
    >
      <button type="submit" style={{width:'30px',height:'30px',background:'none',border:'none',cursor:'pointer',fontSize:'18px',color:'#555',display:'flex',alignItems:'center',justifyContent:'center'}}>
        {children}
      </button>
    </CartForm>
  );
}

export default function CartDrawer({isOpen, onClose, cart: originalCart}) {
  // Use optimistic cart for immediate updates
  const cart = useOptimisticCart(originalCart);
  
  const lines = cart?.lines?.nodes ?? [];
  const subtotal = cart?.cost?.subtotalAmount;
  const checkoutUrl = cart?.checkoutUrl;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',zIndex:9999,opacity:mounted&&isOpen?1:0,pointerEvents:mounted&&isOpen?'auto':'none',transition:'opacity 0.3s ease'}} />

      <div style={{position:'fixed',top:0,right:0,height:'100%',width:'100%',maxWidth:'420px',background:'#fff',display:'flex',flexDirection:'column',zIndex:10000,transition:mounted?'transform 0.35s cubic-bezier(0.4,0,0.2,1)':'none',transform:mounted&&isOpen?'translateX(0)':'translateX(100%)',boxShadow:'-8px 0 40px rgba(0,0,0,0.12)'}}>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:'1px solid #f0f0f0',flexShrink:0}}>
          <div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'18px',fontWeight:'400',letterSpacing:'1px',color:'#0a0a0a',margin:0}}>Your Bag</h2>
            <p style={{fontSize:'11px',color:'#9ca3af',margin:'4px 0 0'}}>{cart?.totalQuantity||0} {cart?.totalQuantity===1?'item':'items'}</p>
          </div>
          <button onClick={onClose} style={{width:'32px',height:'32px',borderRadius:'50%',background:'#f5f5f5',border:'none',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',color:'#666'}}>✕</button>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'0 24px'}}>
          {lines.length === 0 ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',textAlign:'center',padding:'60px 0'}}>
              <div style={{fontSize:'52px',marginBottom:'16px',opacity:0.12}}>🛍</div>
              <p style={{color:'#9ca3af',fontSize:'14px',margin:'0 0 16px'}}>Your bag is empty</p>
              <button onClick={onClose} style={{fontSize:'13px',textDecoration:'underline',color:'#c9a84c',background:'none',border:'none',cursor:'pointer'}}>Continue Shopping</button>
            </div>
          ) : lines.map(line => {
            const img = line.merchandise?.image;
            const title = line.merchandise?.product?.title;
            const opts = (line.merchandise?.selectedOptions ?? []).filter(o => o.value !== 'Default Title');
            const total = line.cost?.totalAmount;
            return (
              <div key={line.id} style={{display:'flex',gap:'14px',padding:'16px 0',borderBottom:'1px solid #f5f5f5'}}>
                <div style={{width:'80px',height:'80px',background:'#f5f5f0',flexShrink:0,overflow:'hidden',borderRadius:'8px'}}>
                  {img
                    ? <img src={img.url} alt={title||''} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                    : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',opacity:0.2}}>⌚</div>
                  }
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:'13px',fontWeight:'600',color:'#0a0a0a',margin:'0 0 3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</p>
                  {opts.length > 0 && (
                    <p style={{fontSize:'11px',color:'#9ca3af',margin:'0 0 6px'}}>{opts.map(o=>o.value).join(' / ')}</p>
                  )}
                  <p style={{fontSize:'13px',fontWeight:'700',color:'#0a0a0a',margin:'0 0 10px'}}>
                    {total ? fmt(total.amount, total.currencyCode) : ''}
                  </p>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',alignItems:'center',border:'1px solid #e5e7eb',borderRadius:'8px',overflow:'hidden'}}>
                      <QtyButton lineId={line.id} newQty={line.quantity-1}>−</QtyButton>
                      <span style={{width:'32px',textAlign:'center',fontSize:'13px',fontWeight:'600'}}>{line.quantity}</span>
                      <QtyButton lineId={line.id} newQty={line.quantity+1}>+</QtyButton>
                    </div>
                    <RemoveButton lineId={line.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {lines.length > 0 && (
          <div style={{padding:'16px 24px 28px',borderTop:'1px solid #f0f0f0',background:'#fff',flexShrink:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
              <span style={{fontSize:'13px',color:'#6b7280'}}>Subtotal</span>
              <span style={{fontSize:'16px',fontWeight:'700',color:'#0a0a0a'}}>
                {subtotal ? fmt(subtotal.amount, subtotal.currencyCode) : ''}
              </span>
            </div>
            <p style={{fontSize:'11px',color:'#bbb',margin:'0 0 16px'}}>Taxes and shipping calculated at checkout</p>
            {checkoutUrl
              ? <a href={checkoutUrl} style={{display:'block',width:'100%',background:'#0a0a0a',color:'#fff',textAlign:'center',padding:'16px',fontSize:'12px',letterSpacing:'2px',textTransform:'uppercase',textDecoration:'none',borderRadius:'10px',boxSizing:'border-box',marginBottom:'10px',fontWeight:'600'}}>Checkout →</a>
              : <Link to="/checkout" onClick={onClose} style={{display:'block',width:'100%',background:'#0a0a0a',color:'#fff',textAlign:'center',padding:'16px',fontSize:'12px',letterSpacing:'2px',textTransform:'uppercase',textDecoration:'none',borderRadius:'10px',boxSizing:'border-box',marginBottom:'10px',fontWeight:'600'}}>Review Order & Checkout →</Link>
            }
            <button onClick={onClose} style={{display:'block',width:'100%',border:'1px solid #e5e7eb',background:'none',padding:'13px',fontSize:'12px',cursor:'pointer',borderRadius:'10px',color:'#666',letterSpacing:'1px'}}>Continue Shopping</button>
          </div>
        )}
      </div>
    </>
  );
}
