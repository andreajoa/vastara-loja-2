import {useLoaderData, Link, redirect, data} from 'react-router';
import {CartForm, Image, Money} from '@shopify/hydrogen';

export async function loader({context}) {
  const cartData = await context.cart.get();
  return {cart: cartData};
}

export async function action({request, context}) {
  const {cart, session} = context;
  const formData = await request.formData();

  let cartAction;
  let inputs;

  if (formData.has(CartForm.INPUT_NAME)) {
    // É um submit do CartForm do Hydrogen
    const parsed = CartForm.getFormInput(formData);
    cartAction = parsed.action;
    inputs = parsed.inputs;
  } else {
    // É o seu submit antigo (sem o CartForm) do botão "Add to Bag"
    const legacyAction = String(formData.get('cartAction') || '');
    const linesRaw = String(formData.get('lines') || '[]');

    if (legacyAction === 'ADD_TO_CART') {
      cartAction = CartForm.ACTIONS.LinesAdd;
      try {
        inputs = {lines: JSON.parse(linesRaw)};
      } catch (e) {
        console.error("Error parsing lines JSON:", e);
        throw new Error('Invalid "lines" JSON in cart action');
      }
    } else if (legacyAction === 'REMOVE') {
      cartAction = CartForm.ACTIONS.LinesRemove;
      try {
        inputs = {lineIds: JSON.parse(String(formData.get('lineIds') || '[]'))};
      } catch(e) {
        throw new Error('Invalid lineIds JSON');
      }
    } else {
      throw new Error('Unsupported cart payload.');
    }
  }

  let result;

  switch (cartAction) {
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
      throw new Error(`Unknown cart action: ${cartAction}`);
  }

  const headers = new Headers();

  // Salvar o ID do carrinho no cookie, se houver um novo ou atualizado
  if (result?.cart?.id) {
    const cartIdHeaders = cart.setCartId(result.cart.id);
    for (const [key, value] of cartIdHeaders.entries()) {
      headers.append(key, value);
    }
  }

  // Commit da sessão se ela foi modificada
  if (session?.isPending) {
    headers.append('Set-Cookie', await session.commit());
  }

  // Set cart cookie first so cart.get() finds it
  const cartId = result.cart?.id;
  let fullCart = result.cart;
  if (cartId) {
    try {
      const cartHandler = context.cart;
      // Temporarily override getCartId to return our new cart id
      const originalGet = cartHandler.get.bind(cartHandler);
      const fetched = await context.storefront.query(
        `#graphql
          query GetCart($id: ID!) {
            cart(id: $id) {
              id checkoutUrl totalQuantity
              cost {
                subtotalAmount { amount currencyCode }
                totalAmount { amount currencyCode }
              }
              lines(first: 100) {
                nodes {
                  id quantity
                  cost { totalAmount { amount currencyCode } }
                  merchandise {
                    ... on ProductVariant {
                      id title
                      price { amount currencyCode }
                      image { url altText }
                      product { title handle }
                      selectedOptions { name value }
                    }
                  }
                }
              }
            }
          }
        `,
        {variables: {id: cartId}, cache: context.storefront.CacheNone()}
      );
      if (fetched?.cart) fullCart = fetched.cart;
    } catch(e) {
      console.error('Cart fetch error:', e);
    }
  }
  return data({cart: fullCart}, {headers});
}

export default function Cart() {
  const {cart} = useLoaderData();

  if (!cart || !cart.lines?.nodes?.length) {
    return (
      <div style={{padding: '40px', textAlign: 'center'}}>
        <h1>Your Bag</h1>
        <p>Your bag is empty</p>
        <Link to="/collections/all">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div style={{padding: '40px', maxWidth: '900px', margin: '0 auto'}}>
      <h1>Your Bag ({cart.totalQuantity})</h1>

      {cart.lines.nodes.map((line) => (
        <div
          key={line.id}
          style={{
            display: 'flex',
            gap: '16px',
            padding: '16px 0',
            borderBottom: '1px solid #eee',
          }}
        >
          {line.merchandise?.image && (
            <Image
              data={line.merchandise.image}
              width={100}
              height={100}
              style={{objectFit: 'cover'}}
            />
          )}

          <div style={{flex: 1}}>
            <p style={{fontWeight: 'bold'}}>{line.merchandise?.product?.title}</p>
            <p>{line.merchandise?.title}</p>
            <p>Qty: {line.quantity}</p>
            <Money data={line.cost.totalAmount} />
            {/* Adicionei o botão de remover aqui para teste */}
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
