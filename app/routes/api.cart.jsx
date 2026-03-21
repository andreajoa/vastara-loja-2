import {json} from 'react-router';

export async function loader({context}) {
  const cart = await context.cart.get();
  return json({cart});
}
