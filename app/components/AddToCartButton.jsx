import {CartForm} from '@shopify/hydrogen';
import {useFetcher} from '@remix-run/react';

export function AddToCartButton({variantId, quantity = 1, children}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action="/cart">
      <input type="hidden" name="lines[0][merchandiseId]" value={variantId} />
      <input type="hidden" name="lines[0][quantity]" value={quantity} />
      <button
        type="submit"
        name="action"
        value={CartForm.ACTIONS.LinesAdd}
        disabled={fetcher.state !== 'idle'}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#000',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {fetcher.state !== 'idle' ? 'Adicionando...' : children || 'Adicionar ao Carrinho'}
      </button>
    </fetcher.Form>
  );
}
