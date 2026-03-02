import {Link} from 'react-router';
import {useState} from 'react';

function fmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {style:'currency', currency}).format(amount);
}

export default function ProductCard({product, onAddToCart}) {
  const [hovered, setHovered] = useState(false);
  const images = product?.images?.nodes || [];
  const img1 = images[0];
  const img2 = images[1] || images[0];
  const price = product?.priceRange?.minVariantPrice;
  const comparePrice = product?.compareAtPriceRange?.minVariantPrice;
  const variantId = product?.variants?.nodes?.[0]?.id;
  const isAvailable = product?.variants?.nodes?.[0]?.availableForSale;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (variantId && onAddToCart) onAddToCart(variantId);
  };

  return (
    <Link to={`/products/${product.handle}`} style={{display:'block',textDecoration:'none',color:'inherit'}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={{position:'relative',overflow:'hidden',background:'#f3f3f0',aspectRatio:'1/1',marginBottom:'12px'}}>
        {img1 && (
          <img
            src={hovered && img2 ? img2.url : img1.url}
            alt={img1.altText || product.title}
            style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.7s ease',transform: hovered ? 'scale(1.05)' : 'scale(1)'}}
          />
        )}
        {comparePrice && parseFloat(comparePrice.amount) > parseFloat(price?.amount || 0) && (
          <span style={{position:'absolute',top:'12px',left:'12px',background:'#dc2626',color:'#fff',fontSize:'11px',padding:'2px 8px',fontFamily:'monospace'}}>SALE</span>
        )}
        <div style={{
          position:'absolute',bottom:0,left:0,right:0,padding:'12px',
          background:'rgba(255,255,255,0.97)',
          transition:'transform 0.3s ease',
          transform: hovered ? 'translateY(0)' : 'translateY(100%)'
        }}>
          <button onClick={handleAdd} disabled={!isAvailable}
            style={{width:'100%',padding:'10px',fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',
              background: isAvailable ? '#0a0a0a' : '#d1d5db',color:'#fff',border:'none',cursor: isAvailable ? 'pointer' : 'not-allowed'}}>
            {isAvailable ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>
      </div>
      <div>
        {product.vendor && <p style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',color:'#6b6b6b',marginBottom:'4px'}}>{product.vendor}</p>}
        <h3 style={{fontSize:'14px',fontWeight:'500',marginBottom:'4px',lineHeight:'1.3'}}>{product.title}</h3>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          {price && <span style={{fontSize:'14px',fontWeight:'600'}}>{fmt(price.amount, price.currencyCode)}</span>}
          {comparePrice && parseFloat(comparePrice.amount) > parseFloat(price?.amount || 0) && (
            <span style={{fontSize:'12px',color:'#9ca3af',textDecoration:'line-through'}}>{fmt(comparePrice.amount, comparePrice.currencyCode)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
