import {useLoaderData, data} from 'react-router';
import {CartForm} from '@shopify/hydrogen';

export const meta = () => [{title: 'Cart | Vastara'}];

export async function action({request, context}) {
  const {cart} = context;
  const formData = await request.formData();

  const cartAction = formData.get('cartAction');
  
  if (cartAction === 'ADD_TO_CART') {
    const lines = JSON.parse(formData.get('lines') || '[]');
    const result = await cart.addLines(lines);
    const headers = cart.setCartId(result.cart.id);
    return data({cart: result.cart, errors: result.errors}, {headers});
  }

  if (cartAction === 'REMOVE') {
    const lineIds = JSON.parse(formData.get('lineIds') || '[]');
    const result = await cart.removeLines(lineIds);
    const headers = cart.setCartId(result.cart.id);
    return data({cart: result.cart, errors: result.errors}, {headers});
  }

  if (cartAction === 'UPDATE') {
    const lines = JSON.parse(formData.get('lines') || '[]');
    const result = await cart.updateLines(lines);
    const headers = cart.setCartId(result.cart.id);
    return data({cart: result.cart, errors: result.errors}, {headers});
  }

  // CartForm format
  const {action: formAction, inputs} = CartForm.getFormInput(formData);
  let result;

  switch (formAction) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate:
      const codes = inputs.discountCode ? [inputs.discountCode] : [];
      codes.push(...(inputs.discountCodes || []));
      result = await cart.updateDiscountCodes(codes);
      break;
    default:
      result = {cart: null, errors: [{message: 'Invalid action'}]};
  }

  const headers = result.cart?.id ? cart.setCartId(result.cart.id) : new Headers();
  return data({cart: result.cart, errors: result.errors}, {headers});
}

export async function loader({context}) {
  return await context.cart.get();
}

export default function CartPage() {
  const cart = useLoaderData();
  const lines = cart?.lines?.nodes || [];

  return (
    <div style={{padding:'120px 40px 60px',maxWidth:'800px',margin:'0 auto'}}>
      <h1 style={{fontSize:'28px',marginBottom:'32px'}}>Your Cart</h1>
      {lines.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          {lines.map(line => (
            <div key={line.id} style={{display:'flex',gap:'16px',padding:'16px 0',borderBottom:'1px solid #eee'}}>
              {line.merchandise?.image && (
                <img src={line.merchandise.image.url} alt="" style={{width:'80px',height:'80px',objectFit:'cover'}} />
              )}
              <div>
                <p style={{fontWeight:'600'}}>{line.merchandise?.product?.title}</p>
                <p>Qty: {line.quantity}</p>
                <p>${line.cost?.totalAmount?.amount}</p>
              </div>
            </div>
          ))}
          {cart.checkoutUrl && (
            <a href={cart.checkoutUrl} style={{display:'inline-block',marginTop:'24px',padding:'14px 28px',background:'#000',color:'#fff',textDecoration:'none'}}>
              Checkout
            </a>
          )}
        </div>
      )}
    </div>
  );
}
