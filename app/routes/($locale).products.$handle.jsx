import {useLoaderData, Link, useNavigate, useFetcher} from 'react-router';
import {useState, useEffect, useRef} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  CartForm,
} from '@shopify/hydrogen';
import {useCart} from '~/components/Layout';
import {useAside} from '~/components/Aside';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta = ({data}) => [
  {title: `${data?.product?.title ?? ''} | Vastara`},
  {rel: 'canonical', href: `/products/${data?.product?.handle}`},
];

export async function loader(args) {
  const criticalData = await loadCriticalData(args);
  return criticalData;
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw new Error('Expected product handle to be defined');
  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);
  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product};
}

function fmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(parseFloat(amount));
}

function StarRating({rating = 5, size = 13}) {
  return (
    <span style={{display:'inline-flex',gap:'1px'}}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= rating ? '#c9a84c' : 'none'} stroke="#c9a84c" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </span>
  );
}

const MOCK_REVIEWS = [
  {id:1,author:'Michael R.',rating:5,date:'Jan 12, 2025',title:'Absolutely stunning',body:'Build quality is exceptional. Feels premium and the movement is incredibly smooth.',verified:true},
  {id:2,author:'Sarah T.',rating:5,date:'Feb 3, 2025',title:'Perfect everyday watch',body:'I wear this daily and it holds up beautifully. Gets compliments everywhere I go.',verified:true},
  {id:3,author:'James L.',rating:4,date:'Feb 20, 2025',title:'Great watch, minor sizing note',body:'Love the design. The bracelet runs a tiny bit large — had to remove one link. Otherwise perfect.',verified:true},
];

const CSS = `
  .pdp-sticky-nav{position:sticky;top:64px;z-index:100;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:44px;}
  .pdp-sticky-nav a{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#666;text-decoration:none;padding:0 14px;height:44px;display:flex;align-items:center;}
  .pdp-hero-right{position:sticky;top:24px;width:400px;height:calc(100vh - 48px);overflow-y:auto;padding:36px 32px;background:#fff;display:flex;flex-direction:column;z-index:10;border:1px solid #f0f0f0;border-radius:12px;margin:24px 24px 24px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);}
  .pdp-hero-right::-webkit-scrollbar{width:3px;}
  .pdp-hero-right::-webkit-scrollbar-thumb{background:#e0e0e0;}
  .pdp-specs{max-width:1100px;margin:0 auto;padding:80px 40px;display:grid;grid-template-columns:280px 1fr;gap:80px;}
  .pdp-spec-title{font-family:Georgia,serif;font-size:clamp(28px,3vw,42px);font-weight:400;position:sticky;top:120px;}
  .pdp-spec-item{display:grid;grid-template-columns:36px 1fr;gap:14px;padding:22px 0;border-bottom:1px solid #f0f0f0;}
  .pdp-reviews{background:#fafafa;padding:64px 24px;}
  .pdp-reviews-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:260px 1fr;gap:60px;}
  .pdp-review-card{padding:24px 0;border-bottom:1px solid #f0f0f0;}
  .pdp-opt-btn{padding:8px 14px;border:1px solid #e5e7eb;background:#fff;font-size:12px;cursor:pointer;transition:all 0.15s;color:#0a0a0a;}
  .pdp-opt-btn.sel{border-color:#0a0a0a;background:#0a0a0a;color:#fff;}
  .pdp-opt-btn:disabled{opacity:0.3;cursor:not-allowed;}
  .pdp-floating{position:fixed;bottom:24px;right:24px;z-index:500;background:#fff;border:1px solid #e8e8e8;border-radius:20px;padding:8px 8px 8px 12px;display:flex;align-items:center;gap:12px;transform:translateY(16px);opacity:0;transition:all 0.3s ease;box-shadow:0 8px 40px rgba(0,0,0,0.18);max-width:400px;min-width:320px;}
  .pdp-floating.vis{transform:translateY(0);opacity:1;}
  .pdp-shopify-desc{font-size:13px;color:#444;line-height:1.7;}
  .pdp-shopify-desc td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;}
  .pdp-shopify-desc td:first-child{color:#666;width:50%;}
  .pdp-shopify-desc td:last-child{font-weight:500;color:#0a0a0a;}
  @media(max-width:900px){
    .pdp-sticky-nav{display:none;}
    #the-watch{grid-template-columns:1fr !important;}
    .pdp-hero-right{position:relative;top:0;width:100%;height:auto;}
    .pdp-specs{grid-template-columns:1fr;gap:32px;padding:48px 24px;}
    .pdp-reviews-inner{grid-template-columns:1fr;}
  }
`;

function AddBtn({variantId, qty, available, label, style}) {
  const {open} = useAside();

  if (!available) {
    return <button disabled style={{...style, background:'#d1d5db', cursor:'not-allowed'}}>Sold Out</button>;
  }

  const linesData = [{merchandiseId: variantId, quantity: qty}];
  console.log('AddBtn: variantId=', variantId, 'qty=', qty, 'lines=', linesData);

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{lines: linesData}}
    >
      {(fetcher) => (
        <button
          type="submit"
          onClick={(e) => {
            console.log('AddBtn clicked, fetcher.state=', fetcher.state);
            open('cart');
          }}
          disabled={fetcher.state !== 'idle'}
          style={style}
        >
          {fetcher.state !== 'idle' ? 'Adding...' : label}
        </button>
      )}
    </CartForm>
  );
}

export default function Product() {
  const {product} = useLoaderData();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [floatingVisible, setFloatingVisible] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const allImages = product.images?.nodes || [];
  const variantImage = selectedVariant?.image;
  const images = allImages.length > 0 ? allImages : variantImage ? [variantImage] : [];
  const heroImage = variantImage || images[0];
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount || 0);
  const variantId = selectedVariant?.id;
  const available = selectedVariant?.availableForSale;
  const avgRating = 4.7;

  useEffect(() => {
    const fn = () => setFloatingVisible(window.scrollY > 700);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const addBtnStyle = {
    display:'block', width:'100%', padding:'14px',
    background: available ? '#0a0a0a' : '#d1d5db',
    color:'#fff', fontSize:'11px', letterSpacing:'2.5px',
    textTransform:'uppercase', cursor: available ? 'pointer' : 'not-allowed',
    marginTop:'10px', border:'none',
  };



  return (
    <div style={{fontFamily:'sans-serif',color:'#0a0a0a',paddingTop:'96px'}} suppressHydrationWarning>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{__html: CSS}} />

      <div className="pdp-sticky-nav">
        <div style={{display:'flex'}}>
          <a href="#the-watch">The Watch</a>
          <a href="#specs">Specs</a>
          <a href="#reviews">Reviews</a>
        </div>
      </div>

      <section id="the-watch" style={{display:'grid',gridTemplateColumns:'1fr 448px',alignItems:'start'}}>
        <div>
          <div style={{width:'100%',background:'#f5f5f0'}}>
            {heroImage
              ? <img src={heroImage.url} alt={heroImage.altText || product.title} style={{width:'100%',minHeight:'70vh',maxHeight:'95vh',objectFit:'cover',display:'block'}} />
              : <div style={{width:'100%',height:'85vh',background:'#f8f8f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'80px'}}>⌚</div>
            }
          </div>
          {images.length > 1 && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px',margin:'40px 0'}}>
              {images.slice(1,3).map((img,i) => (
                <img key={img.id||i} src={img.url} alt={img.altText||''} style={{width:'100%',aspectRatio:'1/1',objectFit:'cover',display:'block'}} />
              ))}
            </div>
          )}
        </div>

        <div className="pdp-hero-right">
          <div style={{fontSize:'10px',letterSpacing:'1.5px',textTransform:'uppercase',color:'#bbb',marginBottom:'14px'}}>
            <Link to="/" style={{color:'#bbb',textDecoration:'none'}}>Home</Link>
            <span style={{margin:'0 5px'}}>/</span>
            <Link to="/collections" style={{color:'#bbb',textDecoration:'none'}}>Watches</Link>
          </div>

          {product.vendor && <div style={{fontSize:'10px',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'5px'}}>{product.vendor}</div>}

          <h1 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:'400',lineHeight:'1.3',marginBottom:'10px'}}>{product.title}</h1>

          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px',cursor:'pointer'}}
            onClick={() => document.getElementById('reviews')?.scrollIntoView({behavior:'smooth'})}>
            <StarRating rating={Math.round(avgRating)} />
            <span style={{fontSize:'11px',color:'#999'}}>{avgRating} · 847 reviews</span>
          </div>

          <div style={{display:'flex',alignItems:'baseline',gap:'10px',marginBottom:'20px',paddingBottom:'20px',borderBottom:'1px solid #f0f0f0'}}>
            {price && <span style={{fontSize:'26px',fontWeight:'600'}}>{fmt(price.amount, price.currencyCode)}</span>}
            {isOnSale && <span style={{fontSize:'15px',color:'#9ca3af',textDecoration:'line-through'}}>{fmt(compareAtPrice.amount, compareAtPrice.currencyCode)}</span>}
            {isOnSale && <span style={{background:'#dc2626',color:'#fff',fontSize:'10px',padding:'2px 8px'}}>SALE</span>}
          </div>

          {productOptions.map(option => {
            if (option.optionValues.length <= 1) return null;
            const hasVariantImages = option.optionValues.some(v => v.firstSelectableVariant?.image);
            return (
              <div key={option.name} style={{marginBottom:'20px'}}>
                <div style={{fontSize:'10px',letterSpacing:'1.5px',textTransform:'uppercase',color:'#666',marginBottom:'10px'}}>{option.name}</div>
                {hasVariantImages ? (
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    {option.optionValues.map(value => {
                      const varImg = value.firstSelectableVariant?.image;
                      const isSelected = value.selected;
                      const isAvailable = value.firstSelectableVariant?.availableForSale !== false;
                      return value.isDifferentProduct ? (
                        <Link key={value.name} to={'/products/'+value.handle+'?'+value.variantUriQuery}
                          title={value.name}
                          style={{display:'block',width:'64px',height:'64px',padding:'2px',border:isSelected?'2px solid #0a0a0a':'2px solid #e5e7eb',borderRadius:'10px',background:'#f5f5f0',overflow:'hidden',opacity:isAvailable?1:0.35,textDecoration:'none',flexShrink:0,transition:'border-color 0.15s'}}>
                          {varImg && <img src={varImg.url} alt={value.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'7px',display:'block'}} />}
                        </Link>
                      ) : (
                        <button key={value.name} type="button" title={value.name}
                          disabled={!value.exists}
                          onClick={() => { if (!value.selected) navigate('?'+value.variantUriQuery, {replace:true,preventScrollReset:true}); }}
                          style={{width:'64px',height:'64px',padding:'2px',border:isSelected?'2px solid #0a0a0a':'2px solid #e5e7eb',borderRadius:'10px',background:'#f5f5f0',cursor:value.exists?'pointer':'not-allowed',overflow:'hidden',opacity:isAvailable?1:0.35,flexShrink:0,transition:'border-color 0.15s'}}>
                          {varImg
                            ? <img src={varImg.url} alt={value.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'7px',display:'block'}} />
                            : <span style={{fontSize:'9px',color:'#666',lineHeight:'1.2',display:'flex',alignItems:'center',justifyContent:'center',height:'100%',textAlign:'center',padding:'4px'}}>{value.name}</span>
                          }
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                    {option.optionValues.map(value => (
                      value.isDifferentProduct
                        ? <Link key={value.name} to={'/products/'+value.handle+'?'+value.variantUriQuery}
                            className={'pdp-opt-btn'+(value.selected?' sel':'')}
                            style={{textDecoration:'none',color:'inherit'}}>
                            {value.name}
                          </Link>
                        : <button key={value.name} type="button"
                            className={'pdp-opt-btn'+(value.selected?' sel':'')}
                            disabled={!value.exists}
                            onClick={() => { if (!value.selected) navigate('?'+value.variantUriQuery, {replace:true,preventScrollReset:true}); }}>
                            {value.name}
                          </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{display:'flex',gap:'8px',marginTop:'20px'}}>
            <div style={{display:'flex',alignItems:'center',border:'1px solid #e5e7eb',height:'48px'}}>
              <button onClick={() => setQty(q => Math.max(1,q-1))} style={{width:'34px',height:'48px',background:'none',border:'none',fontSize:'16px',cursor:'pointer',color:'#666'}}>−</button>
              <span style={{width:'26px',textAlign:'center',fontSize:'13px'}}>{qty}</span>
              <button onClick={() => setQty(q => q+1)} style={{width:'34px',height:'48px',background:'none',border:'none',fontSize:'16px',cursor:'pointer',color:'#666'}}>+</button>
            </div>
            <button onClick={() => setWishlist(w => !w)} style={{width:'48px',height:'48px',background:'none',border:'1px solid #e5e7eb',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill={wishlist?'#dc2626':'none'} stroke={wishlist?'#dc2626':'#888'} strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {variantId && (
            <AddBtn
              variantId={variantId}
              qty={qty}
              available={available}
              label={`Add to Bag  |  ${price ? fmt(price.amount, price.currencyCode) : ''}`}
              style={addBtnStyle} selectedVariant={selectedVariant}
            />
          )}

          <div style={{marginTop:'16px',paddingTop:'14px',borderTop:'1px solid #f5f5f5',display:'flex',flexDirection:'column',gap:'10px'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:'10px'}}>
              <span style={{fontSize:'16px'}}>🚚</span>
              <div>
                <div style={{fontSize:'11px',fontWeight:'600',color:'#0a0a0a'}}>FREE SHIPPING WORLDWIDE</div>
                <div style={{fontSize:'11px',color:'#999',marginTop:'3px',lineHeight:'1.6'}}>US & Canada: 5–10 Business Days</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',paddingTop:'8px',borderTop:'1px solid #f5f5f5'}}>
              <span style={{fontSize:'16px'}}>🔒</span>
              <div style={{fontSize:'11px',color:'#0a0a0a',fontWeight:'500'}}>30-Day Money-Back Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-IMAGE STRIP */}
      {images.length > 3 && (
        <div style={{position:'relative',margin:'0 0 60px'}}>
          <button onClick={()=>{const el=document.getElementById('pdp-strip');if(el)el.scrollBy({left:-400,behavior:'smooth'})}}
            style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',zIndex:10,width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.9)',border:'1px solid #e5e7eb',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>←</button>
          <div id="pdp-strip" style={{display:'flex',gap:'4px',overflowX:'auto',scrollbarWidth:'none'}} className="pdp-img-strip">
            {images.slice(3).map((img,i) => (
              <img key={img.id||i} src={img.url} alt={img.altText||''} style={{flexShrink:0,width:'calc(20% - 4px)',minWidth:'200px',aspectRatio:'1/1',objectFit:'cover',display:'block'}} />
            ))}
          </div>
          <button onClick={()=>{const el=document.getElementById('pdp-strip');if(el)el.scrollBy({left:400,behavior:'smooth'})}}
            style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',zIndex:10,width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.9)',border:'1px solid #e5e7eb',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>→</button>
        </div>
      )}

      <section id="specs">
        <div className="pdp-specs">
          <div><h2 className="pdp-spec-title">Specifications</h2></div>
          <div>
            {product.descriptionHtml
              ? <div className="pdp-shopify-desc" suppressHydrationWarning dangerouslySetInnerHTML={{__html: product.descriptionHtml ?? ''}} />
              : <p style={{color:'#777',fontSize:'13px'}} suppressHydrationWarning>{product.description}</p>
            }
          </div>
        </div>
      </section>

      {/* EDITORIAL BANNER */}
      <div style={{position:'relative',minHeight:'520px',overflow:'hidden',display:'flex',alignItems:'center',background:'#111',marginBottom:'80px'}}>
        {heroImage && <img src={heroImage.url} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.35}} />}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(10,10,10,0.75) 0%,rgba(10,10,10,0.2) 100%)'}} />
        <div style={{position:'relative',zIndex:2,padding:'60px 80px',color:'#fff',maxWidth:'600px'}}>
          <p style={{fontSize:'10px',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'20px',fontFamily:'monospace'}}>— Editorial</p>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(32px,4vw,52px)',fontWeight:'400',lineHeight:'1.15',marginBottom:'20px',letterSpacing:'-0.5px'}}>
            Some watches tell time.<br/><em>This one tells your story.</em>
          </h2>
          <p style={{fontSize:'14px',lineHeight:'1.85',color:'rgba(255,255,255,0.7)',marginBottom:'32px',maxWidth:'460px',fontWeight:'300'}}>
            The {product.title} is engineered for those who move with intention.
            Where precision meets permanence — a timepiece built not just to be worn, but to be remembered.
          </p>
          <div style={{display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
            {variantId && available && (
              <AddBtn variantId={variantId} qty={1} available={available} selectedVariant={selectedVariant}
                label={`Add to Bag — ${price ? fmt(price.amount,price.currencyCode) : ''}`}
                style={{padding:'14px 36px',background:'#fff',color:'#0a0a0a',fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer',border:'none',fontWeight:'500'}} />
            )}
            <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',letterSpacing:'1px'}}>Free shipping on orders $75+</span>
          </div>
        </div>
      </div>

      {/* BUY IT TOGETHER */}
      <div style={{background:'#fafafa',padding:'64px 40px',marginBottom:'0'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto'}}>
          <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'6px'}}>Complete the Look</div>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'26px',fontWeight:'400',marginBottom:'36px'}}>Buy It Together</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 40px 1fr 40px 1fr',gap:'0',alignItems:'center'}}>
            {[
              {img:images[0]||heroImage,title:product.title,vendor:product.vendor||'Vastara',priceStr:price?fmt(price.amount,price.currencyCode):'',main:true},
              {img:images[1]||heroImage,title:'Leather Watch Strap',vendor:'Vastara',priceStr:'$29.00',main:false},
              {img:images[2]||heroImage,title:'Watch Case Protector',vendor:'Vastara',priceStr:'$19.00',main:false},
            ].map((item,i) => (
              <>
                {i>0 && <div key={'plus'+i} style={{textAlign:'center',fontSize:'24px',color:'#ccc',fontWeight:'200'}}>+</div>}
                <div key={i} style={{background:'#fff',border:'1px solid #f0f0f0',padding:'20px'}}>
                  {item.img && <img src={item.img.url} alt={item.title} style={{width:'100%',aspectRatio:'1/1',objectFit:'cover',display:'block',marginBottom:'12px'}} />}
                  <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'3px'}}>{item.vendor}</div>
                  <div style={{fontSize:'13px',fontWeight:'500',marginBottom:'4px'}}>{item.title}</div>
                  <div style={{fontSize:'14px',color:'#c9a84c',fontWeight:'600'}}>{item.priceStr}</div>
                </div>
              </>
            ))}
          </div>
          <div style={{marginTop:'24px',textAlign:'center'}}>
            {variantId && (
              <AddBtn variantId={variantId} qty={1} available={available} selectedVariant={selectedVariant}
                label="Add Bundle to Bag"
                style={{display:'inline-block',padding:'14px 40px',background:'#0a0a0a',color:'#fff',fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer',border:'none'}} />
            )}
          </div>
        </div>
      </div>

      {/* RECENTLY VIEWED */}
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'64px 24px'}}>
        <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'6px'}}>Don't Miss</div>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'26px',fontWeight:'400',marginBottom:'28px'}}>You May Also Like</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'2px'}}>
          {images.slice(0,4).map((img,i) => (
            <div key={img.id||i} style={{position:'relative',overflow:'hidden',cursor:'pointer'}}
              onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>
              <img src={img.url} alt={img.altText||''} style={{width:'100%',aspectRatio:'1/1',objectFit:'cover',display:'block',transition:'transform 0.5s'}}
                onMouseEnter={e=>e.target.style.transform='scale(1.04)'}
                onMouseLeave={e=>e.target.style.transform='scale(1)'} />
              <div style={{padding:'12px 0'}}>
                <div style={{fontSize:'11px',color:'#999',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'3px'}}>{product.vendor}</div>
                <div style={{fontSize:'13px',fontWeight:'500'}}>{product.title}</div>
                <div style={{fontSize:'13px',color:'#c9a84c',marginTop:'3px'}}>{price?fmt(price.amount,price.currencyCode):''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section id="reviews" className="pdp-reviews">
        <div className="pdp-reviews-inner">
          <div>
            <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'10px'}}>Customer Reviews</div>
            <div style={{fontFamily:'Georgia,serif',fontSize:'52px',fontWeight:'400',lineHeight:'1'}}>{avgRating}</div>
            <StarRating rating={Math.round(avgRating)} size={16} />
            <div style={{fontSize:'12px',color:'#999',marginTop:'5px'}}>Based on 847 reviews</div>
          </div>
          <div>
            {MOCK_REVIEWS.map(review => (
              <div key={review.id} className="pdp-review-card">
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                  <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'600',color:'#666'}}>
                    {review.author[0]}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'12px',fontWeight:'500'}}>{review.author}</div>
                    <div style={{fontSize:'10px',color:'#999'}}>{review.date}</div>
                  </div>
                  {review.verified && <span style={{fontSize:'10px',color:'#16a34a',background:'#f0fdf4',padding:'2px 7px'}}>✓ Verified</span>}
                </div>
                <StarRating rating={review.rating} />
                <div style={{fontSize:'13px',fontWeight:'500',marginTop:'7px',marginBottom:'5px'}}>{review.title}</div>
                <div style={{fontSize:'13px',color:'#666',lineHeight:'1.7'}}>{review.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={`pdp-floating${floatingVisible?' vis':''}`}>
        {heroImage && (
          <div style={{width:'42px',height:'42px',borderRadius:'10px',overflow:'hidden',flexShrink:0,background:'#f5f5f0'}}>
            <img src={heroImage.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:'12px',fontWeight:'500',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{product.title}</div>
          <div style={{fontSize:'11px',color:'#999'}}>{price ? fmt(price.amount,price.currencyCode) : ''}</div>
        </div>
        {variantId && (
          <AddBtn variantId={variantId} qty={1} available={available}
            label="Add to Bag →"
            style={{flexShrink:0,padding:'11px 20px',background:available?'#0a0a0a':'#d1d5db',color:'#fff',border:'none',borderRadius:'12px',fontSize:'11px',letterSpacing:'1px',textTransform:'uppercase',cursor:available?'pointer':'not-allowed',whiteSpace:'nowrap',fontWeight:'500'}} selectedVariant={selectedVariant} />
        )}
      </div>

      <Analytics.ProductView data={{products:[{id:product.id,title:product.title,price:selectedVariant?.price?.amount||'0',vendor:product.vendor,variantId:selectedVariant?.id||'',variantTitle:selectedVariant?.title||'',quantity:1}]}} />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { __typename id url altText width height }
    price { amount currencyCode }
    product { title handle }
    selectedOptions { name value }
    sku title
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id title vendor handle descriptionHtml description
    encodedVariantExistence encodedVariantAvailability
    images(first: 10) { nodes { id url altText width height } }
    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariant }
        swatch { color image { previewImage { url } } }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) { ...ProductVariant }
    seo { description title }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) { ...Product }
  }
  ${PRODUCT_FRAGMENT}
`;
