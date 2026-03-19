import {useFetcher} from 'react-router';
import {useEffect, useRef} from 'react';

export function AddToCartButton({variantId, quantity = 1, disabled, children, style, onSuccess}) {
  const fetcher = useFetcher();
  const isAdding = fetcher.state !== 'idle';
  const wasAdding = useRef(false);

  useEffect(() => {
    if (wasAdding.current && fetcher.state === 'idle' && !fetcher.data?.errors?.length) {
      onSuccess?.();
    }
    wasAdding.current = fetcher.state === 'submitting';
  }, [fetcher.state, fetcher.data, onSuccess]);

  return (
    <fetcher.Form method="post" action="/cart">
      <input type="hidden" name="cartAction" value="ADD_TO_CART" />
      <input type="hidden" name="lines" value={JSON.stringify([{merchandiseId: variantId, quantity}])} />
      <button 
        type="submit" 
        disabled={disabled || isAdding || !variantId}
        style={style}
      >
        {isAdding ? 'Adding...' : children}
      </button>
    </fetcher.Form>
  );
}
