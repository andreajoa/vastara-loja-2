import {json} from '@remix-run/server-runtime';
import {useLoaderData, Link, useFetcher} from '@remix-run/react';
import {CartForm, Image, Money} from '@shopify/hydrogen';

export async function loader({context}) {
  const {cart} = context;
  const cartData = await cart.get();
  return json({cart: cartData});
}

export async function action({request, context}) {
  const {cart, session} = context;
  const formData = await request.formData();
  const {action, inputs} = CartForm.getFormInput(formData);

  let result;

  try {
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
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Cart action error:', error);
    return json({error: 'Failed to update cart'}, {status: 500});
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

  return json(
    {
      cart: result?.cart,
      errors: result?.errors || result?.userErrors,
    },
    {headers}
  );
}

export default function Cart() {
  const {cart} = useLoaderData();
  const fetcher = useFetcher();

  if (!cart || !cart.lines?.nodes?.length) {
    return (
      <div style={{padding: '40px', textAlign: 'center'}}>
        <h1>Carrinho</h1>
        <p>Seu carrinho está vazio</p>
        <Link to="/collections/all" style={{color: '#000', textDecoration: 'underline'}}>
          Continuar Comprando
        </Link>
      </div>
    );
  }

  return (
    <div style={{padding: '40px', maxWidth: '800px', margin: '0 auto'}}>
      <h1>Carrinho ({cart.totalQuantity})</h1>

      {cart.lines.nodes.map((line) => (
        <div key={line.id} style={{display: 'flex', gap: '16px', padding: '16px', borderBottom: '1px solid #eee'}}>
          {line.merchandise?.image && (
            <Image
              data={line.merchandise.image}
              width={100}
              height={100}
              style={{objectFit: 'cover'}}
            />
          )}
          <div style={{flex: 1}}>
            <h3 style={{margin: '0 0 8px'}}>{line.merchandise?.product?.title}</h3>
            <p style={{color: '#666', margin: '0 0 8px'}}>{line.merchandise?.title}</p>
            <p style={{margin: '0 0 8px'}}>Qtd: {line.quantity}</p>
            <Money data={line.cost.totalAmount} />

            <fetcher.Form method="post">
              <input type="hidden" name="lineIds[]" value={line.id} />
              <button
                type="submit"
                name="action"
                value={CartForm.ACTIONS.LinesRemove}
                style={{
                  marginTop: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'red',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Remover
              </button>
            </fetcher.Form>
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
