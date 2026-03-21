import {useLoaderData, Link, data} from 'react-router';
import {CartForm, Image, Money} from '@shopify/hydrogen';

export async function loader({context}) {
  const {cart} = context;
  const cartData = await cart.get();
  return {cart: cartData};
}

export async function action({request, context}) {
  const {cart, session} = context;
  const formData = await request.formData();
  const {action, inputs} = CartForm.getFormInput(formData);

  let result;

  switch (action) {
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
      result = await cart.updateDiscountCodes(inputs.discountCodes);
      break;
    default:
      throw new Error(`Unknown action: ${action}`);
  }

  const headers = new Headers();

  if (result?.cart?.id) {
    const cartIdHeaders = cart.setCartId(result.cart.id);
    for (const [key, value] of cartIdHeaders.entries()) {
      headers.append(key, value);
    }
  }

  if (session?.isPending) {
    headers.append('Set-Cookie', await session.commit());
  }

  return data(
    {
      cart: result?.cart,
      errors: result?.errors || result?.userErrors,
    },
    {headers}
  );
}

export default function Cart() {
  const {cart} = useLoaderData();

  if (!cart || !cart.lines?.nodes?.length) {
    return (
      <div style={{padding: '40px', textAlign: 'center'}}>
        <h1>Carrinho</h1>
        <p>Seu carrinho esta vazio</p>
        <Link to="/collections/all">Continuar Comprando</Link>
      </div>
    );
  }

  return (
    <div style={{padding: '40px', maxWidth: '800px', margin: '0 auto'}}>
      <h1>Carrinho ({cart.totalQuantity})</h1>

      {cart.lines.nodes.map((line) => (
        <div key={line.id} style={{display: 'flex', gap: '16px', padding: '16px', borderBottom: '1px solid #eee'}}>
          {line.merchandise?.image && (
            <Image data={line.merchandise.image} width={100} height={100} style={{objectFit: 'cover'}} />
          )}
          <div style={{flex: 1}}>
            <p style={{fontWeight: 'bold'}}>{line.merchandise?.product?.title}</p>
            <p>{line.merchandise?.title}</p>
            <p>Qtd: {line.quantity}</p>
            <Money data={line.cost.totalAmount} />
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesRemove}
              inputs={{lineIds: [line.id]}}
            >
              <button type="submit" style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px'}}>
                Remover
              </button>
            </CartForm>
          </div>
        </div>
      ))}

      <div style={{marginTop: '24px', textAlign: 'right'}}>
        <p style={{fontSize: '20px', fontWeight: 'bold'}}>
          Total: <Money data={cart.cost.totalAmount} />
        </p>
        <a
          href={cart.checkoutUrl}
          style={{
            display: 'inline-block',
            marginTop: '16px',
            padding: '16px 32px',
            background: '#000',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          Finalizar Compra
        </a>
      </div>
    </div>
  );
}
