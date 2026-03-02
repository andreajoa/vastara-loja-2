import {Link} from 'react-router';

function fmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {style:'currency', currency}).format(amount);
}

export default function CartDrawer({isOpen, onClose, lines, cart, onRemove, onUpdate}) {
  const subtotal = cart?.cost?.subtotalAmount;

  return (
    <>
      {isOpen && (
        <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',zIndex:1100}} />
      )}
      <div style={{
        position:'fixed',top:0,right:0,height:'100%',width:'100%',maxWidth:'420px',
        background:'#fff',display:'flex',flexDirection:'column',
        zIndex:1101,transition:'transform 0.3s ease',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
      }}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:'1px solid #e5e7eb'}}>
          <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'20px',letterSpacing:'2px'}}>YOUR CART</h2>
          <span style={{fontSize:'12px',color:'#9ca3af',fontFamily:'monospace'}}>{cart?.totalQuantity || 0} items</span>
          <button onClick={onClose} style={{padding:'8px',background:'none',border:'none',cursor:'pointer',fontSize:'20px'}}>✕</button>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'16px 24px'}}>
          {!lines || lines.length === 0 ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',textAlign:'center'}}>
              <div style={{fontSize:'48px',marginBottom:'16px',opacity:0.2}}>🛍</div>
              <p style={{color:'#9ca3af'}}>Your cart is empty</p>
              <button onClick={onClose} style={{marginTop:'16px',fontSize:'13px',textDecoration:'underline',color:'#c9a84c',background:'none',border:'none',cursor:'pointer'}}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div>
              {lines.map(line => (
                <div key={line.id} style={{display:'flex',gap:'16px',padding:'16px 0',borderBottom:'1px solid #f3f4f6'}}>
                  <div style={{width:'80px',height:'80px',background:'#f9fafb',flexShrink:0,overflow:'hidden'}}>
                    {line.merchandise?.image && (
                      <img src={line.merchandise.image.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    )}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <h3 style={{fontSize:'13px',fontWeight:'500',marginBottom:'4px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      {line.merchandise?.product?.title}
                    </h3>
                    <p style={{fontSize:'11px',color:'#9ca3af',marginBottom:'8px'}}>
                      {line.merchandise?.selectedOptions?.map(o => o.value).join(' / ')}
                    </p>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{display:'flex',alignItems:'center',border:'1px solid #e5e7eb'}}>
                        <button onClick={() => onUpdate(line.id, Math.max(0, line.quantity - 1))}
                          style={{width:'28px',height:'28px',background:'none',border:'none',cursor:'pointer',fontSize:'16px'}}>−</button>
                        <span style={{width:'32px',textAlign:'center',fontSize:'13px',fontFamily:'monospace'}}>{line.quantity}</span>
                        <button onClick={() => onUpdate(line.id, line.quantity + 1)}
                          style={{width:'28px',height:'28px',background:'none',border:'none',cursor:'pointer',fontSize:'16px'}}>+</button>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <p style={{fontSize:'13px',fontWeight:'600'}}>
                          {line.cost?.totalAmount && fmt(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                        </p>
                        <button onClick={() => onRemove(line.id)}
                          style={{fontSize:'11px',color:'#9ca3af',background:'none',border:'none',cursor:'pointer',marginTop:'2px'}}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {lines && lines.length > 0 && (
          <div style={{padding:'24px',borderTop:'1px solid #e5e7eb',background:'#f9fafb'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
              <span style={{fontSize:'13px',color:'#6b7280'}}>Subtotal</span>
              <span style={{fontWeight:'600'}}>{subtotal ? fmt(subtotal.amount, subtotal.currencyCode) : '—'}</span>
            </div>
            <p style={{fontSize:'11px',color:'#9ca3af',marginBottom:'16px'}}>Shipping calculated at checkout</p>
            <Link to="/checkout" onClick={onClose}
              style={{display:'block',width:'100%',background:'#0a0a0a',color:'#fff',textAlign:'center',padding:'16px',
                fontSize:'12px',fontFamily:'monospace',letterSpacing:'3px',textTransform:'uppercase',textDecoration:'none',marginBottom:'12px'}}>
              Checkout
            </Link>
            <button onClick={onClose}
              style={{display:'block',width:'100%',border:'1px solid #d1d5db',background:'none',padding:'12px',
                fontSize:'13px',cursor:'pointer'}}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
