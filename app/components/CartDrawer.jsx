import {useFetcher, Link} from 'react-router';

function fmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {style:'currency', currency}).format(Number(amount));
}

function RemoveButton({lineId}) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post" action="/cart">
      <input type="hidden" name="cartAction" value="REMOVE" />
      <input type="hidden" name="lineIds" value={JSON.stringify([lineId])} />
      <button type="submit" disabled={fetcher.state !== 'idle'} style={{fontSize:'11px',color:'#bbb',background:'none',border:'none',cursor:'pointer',textDecoration:'underline',padding:0}}>
        {fetcher.state !== 'idle' ? '...' : 'Remove'}
      </button>
    </fetcher.Form>
  );
}

export default function CartDrawer({isOpen, onClose, cart}) {
  const lines = cart?.lines?.nodes || [];
  const subtotal = cart?.cost?.subtotalAmount;
  const checkoutUrl = cart?.checkoutUrl;

  return (
    <>
      <div 
        onClick={onClose} 
        style={{
          position:'fixed',inset:0,
          background:'rgba(0,0,0,0.5)',
          zIndex:9998,
          opacity:isOpen?1:0,
          pointerEvents:isOpen?'auto':'none',
          transition:'opacity 0.3s ease'
        }} 
      />
      <div style={{
        position:'fixed',top:0,right:0,height:'100%',width:'100%',maxWidth:'420px',
        background:'#fff',display:'flex',flexDirection:'column',zIndex:9999,
        transform:isOpen?'translateX(0)':'translateX(100%)',
        transition:'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        boxShadow:'-8px 0 40px rgba(0,0,0,0.12)'
      }}>
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
              <p style={{color:'#9ca3af',fontSize:'14px',margin:'0 0 16px'}}>Your bag is empty</p>
              <button onClick={onClose} style={{fontSize:'13px',textDecoration:'underline',color:'#c9a84c',background:'none',border:'none',cursor:'pointer'}}>Continue Shopping</button>
            </div>
          ) : lines.map(line => {
            const img = line.merchandise?.image;
            const title = line.merchandise?.product?.title;
            const opts = (line.merchandise?.selectedOptions || []).filter(o => o.value !== 'Default Title');
            const total = line.cost?.totalAmount;
            return (
              <div key={line.id} style={{display:'flex',gap:'14px',padding:'16px 0',borderBottom:'1px solid #f5f5f5'}}>
                <div style={{width:'80px',height:'80px',background:'#f5f5f0',flexShrink:0,overflow:'hidden',borderRadius:'8px'}}>
                  {img ? <img src={img.url} alt={title||''} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} /> : null}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:'13px',fontWeight:'600',color:'#0a0a0a',margin:'0 0 3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</p>
                  {opts.length > 0 && <p style={{fontSize:'11px',color:'#9ca3af',margin:'0 0 6px'}}>{opts.map(o=>o.value).join(' / ')}</p>}
                  <p style={{fontSize:'13px',fontWeight:'700',color:'#0a0a0a',margin:'0 0 10px'}}>{total ? fmt(total.amount, total.currencyCode) : ''}</p>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:'13px',color:'#666'}}>Qty: {line.quantity}</span>
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
              <span style={{fontSize:'16px',fontWeight:'700',color:'#0a0a0a'}}>{subtotal ? fmt(subtotal.amount, subtotal.currencyCode) : ''}</span>
            </div>
            <p style={{fontSize:'11px',color:'#bbb',margin:'0 0 16px'}}>Taxes and shipping calculated at checkout</p>
            {checkoutUrl ? (
              <a href={checkoutUrl} style={{display:'block',width:'100%',background:'#0a0a0a',color:'#fff',textAlign:'center',padding:'16px',fontSize:'12px',letterSpacing:'2px',textTransform:'uppercase',textDecoration:'none',borderRadius:'10px',boxSizing:'border-box',fontWeight:'600'}}>Checkout</a>
            ) : (
              <Link to="/cart" onClick={onClose} style={{display:'block',width:'100%',background:'#0a0a0a',color:'#fff',textAlign:'center',padding:'16px',fontSize:'12px',letterSpacing:'2px',textTransform:'uppercase',textDecoration:'none',borderRadius:'10px',boxSizing:'border-box',fontWeight:'600'}}>View Cart</Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
