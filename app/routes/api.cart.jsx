export async function loader({context}) {
  const cart = await context.cart.get();
  return Response.json({cart});
}
