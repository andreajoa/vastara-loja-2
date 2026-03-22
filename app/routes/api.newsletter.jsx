export async function action({request, context}) {
  const {email} = await request.json();
  if (!email || !email.includes('@')) {
    return Response.json({ok: false, error: 'Invalid email'});
  }
  try {
    const result = await context.storefront.mutate(`
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer { id email }
          customerUserErrors { message }
        }
      }
    `, {
      variables: {
        input: {
          email,
          acceptsMarketing: true,
          password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
        }
      }
    });

    const errors = result?.customerCreate?.customerUserErrors || [];
    // If email already exists, still show success (they're already subscribed)
    if (errors.length && !errors[0].message.includes('already')) {
      return Response.json({ok: false, error: errors[0].message});
    }
    return Response.json({ok: true});
  } catch(e) {
    console.error('Newsletter error:', e);
    return Response.json({ok: false, error: 'Something went wrong'});
  }
}

export async function loader() {
  return Response.json({ok: false, error: 'Method not allowed'}, {status: 405});
}
