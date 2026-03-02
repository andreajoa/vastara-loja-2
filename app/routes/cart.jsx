import {json} from '@shopify/remix-oxygen';
import {CART_FRAGMENT, CREATE_CART_MUTATION, ADD_TO_CART_MUTATION, REMOVE_FROM_CART_MUTATION, UPDATE_CART_MUTATION} from '~/lib/cart';

export async function loader({context}) {
  return json({cart: await context.cart.get()});
}

export async function action({request, context}) {
  const {storefront, session} = context;
  const form = await request.formData();
  const actionType = form.get('action');
  let cartId = session.get('cartId');

  if (actionType === 'add') {
    const variantId = form.get('variantId');
    const quantity = parseInt(form.get('quantity')||'1');
    if (!cartId) {
      const {cartCreate} = await storefront.mutate(CREATE_CART_MUTATION, {
        variables:{input:{lines:[{merchandiseId:variantId,quantity}]}}
      });
      cartId = cartCreate.cart.id;
      session.set('cartId', cartId);
      return json({cart:cartCreate.cart},{headers:{'Set-Cookie':await session.commit()}});
    }
    const {cartLinesAdd} = await storefront.mutate(ADD_TO_CART_MUTATION, {
      variables:{cartId,lines:[{merchandiseId:variantId,quantity}]}
    });
    return json({cart:cartLinesAdd.cart});
  }
  if (actionType === 'remove') {
    const {cartLinesRemove} = await storefront.mutate(REMOVE_FROM_CART_MUTATION, {
      variables:{cartId,lineIds:[form.get('lineId')]}
    });
    return json({cart:cartLinesRemove.cart});
  }
  if (actionType === 'update') {
    const lineId = form.get('lineId');
    const quantity = parseInt(form.get('quantity'));
    if (quantity <= 0) {
      const {cartLinesRemove} = await storefront.mutate(REMOVE_FROM_CART_MUTATION, {
        variables:{cartId,lineIds:[lineId]}
      });
      return json({cart:cartLinesRemove.cart});
    }
    const {cartLinesUpdate} = await storefront.mutate(UPDATE_CART_MUTATION, {
      variables:{cartId,lines:[{id:lineId,quantity}]}
    });
    return json({cart:cartLinesUpdate.cart});
  }
  return json({error:'Unknown action'},{status:400});
}
