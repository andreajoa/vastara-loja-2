import {useLoaderData, Link, data, redirect} from 'react-router';
import {CartForm, Image, Money} from '@shopify/hydrogen';

export async function loader({context}) {
  const cartData = await context.cart.get();
  return {cart: cartData};
}

export async function action({request, context}) {
  const {cart, session} = context;
  const formData = await request.formData();

  // 1) Suporta o formato do Hydrogen CartForm (cartFormInput)
  let action;
  let inputs;

  if (formData.has(CartForm.INPUT_NAME)) {
    const parsed = CartForm.getFormInput(formData);
    action = parsed.action;
    inputs = parsed.inputs;
  } else {
    // 2) Suporta o seu formato antigo: cartAction + lines (JSON)
    const cartAction = String(formData.get('cartAction') || '');
    const linesRaw = String(formData.get('lines') || '[]');

    if (cartAction === 'ADD_TO_CART') {
      action = CartForm.ACTIONS.LinesAdd;
      try {
        inputs = {lines: JSON.parse(linesRaw)};
      } catch {
        throw new Error('Invalid "lines" JSON in cart action');
      }
    } else {
      throw new Error(
        `Unsupported cart payload. Expected "${CartForm.INPUT_NAME}" or cartAction=ADD_TO_CART.`,
      );
    }
  }

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
      throw new Error(`Unknown cart action: ${action}`);
  }

  // IMPORTANTÍSSIMO: persistir o cartId no cookie
  const headers = new Headers();

  if (result?.cart?.id) {
    const cartHeaders = cart.setCartId(result.cart.id);
    for (const [key, value] of cartHeaders.entries()) {
      headers.append(key, value);
    }
  }

  if (session?.isPending) {
    headers.append('Set-Cookie', await session.commit());
  }

  const errors = result?.errors || result?.userErrors;

  // Se for navegação de documento (form normal), redireciona para /cart
  const accept = request.headers.get('accept') || '';
  const isDocumentRequest =
    accept.includes('text/html') && !new URL(request.url).searchParams.has('_data');

  if (isDocumentRequest) {
    return redirect('/cart', {headers});
  }

  // Se for fetcher (CartForm), devolve data JSON
  return data({cart: result?.cart, errors}, {headers});
}

export default function Cart() {
  const {cart} = useLoaderData();

  if (!cart || !cart.lines?.nodes?.length) {
    return (
      <div style={{padding: '40px', textAlign: 'center'}}>
        <h1>Carrinho</h1>
        <p>Seu carrinho está vazio</p>
        <Link to="/collections/all">Continuar Comprando</Link>
      </div>
    );
  }

  return (
    <div style={{padding: '40px', maxWidth: '800px', margin: '0 auto'}}>
      <h1>Carrinho ({cart.totalQuantity})</h1>

      {cart.lines.nodes.map((line) => (
        <div
          key={line.id}
          style={{
            display: 'flex',
            gap: '16px',
            padding: '16px',
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
            <p style={{fontWeight: 'bold'}}>
              {line.merchandise?.product?.title}
            </p>
            <p>{line.merchandise?.title}</p>
            <p>Qtd: {line.quantity}</p>
            <Money data={line.cost.totalAmount} />
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
