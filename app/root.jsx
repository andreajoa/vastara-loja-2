import {useNonce, Analytics, getShopAnalytics} from '@shopify/hydrogen';
import {Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, isRouteErrorResponse, useLoaderData} from 'react-router';
import appStyles from '~/styles/app.css?url';
import {MENU_FRAGMENT} from '~/lib/fragments';
import Layout from '~/components/Layout';

export const links = () => [
  {rel:'stylesheet', href:appStyles},
  {rel:'preconnect', href:'https://fonts.googleapis.com'},
  {rel:'preconnect', href:'https://fonts.gstatic.com', crossOrigin:'anonymous'},
  {rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap'},
];

export async function loader({context}) {
  const {storefront, env, cart} = context;
  const [header, footer, cartData] = await Promise.all([
    storefront.query(HEADER_QUERY, {variables:{headerMenuHandle:'main-menu'}}),
    storefront.query(FOOTER_QUERY, {variables:{footerMenuHandle:'footer'}}),
    cart.get(),
  ]);
  return {
    header,
    footer,
    cart: cartData,
    shop: getShopAnalytics({storefront, publicStorefrontId: env.PUBLIC_STOREFRONT_ID}),
    consent: {
      checkoutDomain: env.PUBLIC_STORE_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    },
  };
}

export const handle = {id: "root"};
export default function App() {
  const nonce = useNonce();
  const data = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta /><Links />
      </head>
      <body>
        <Analytics.Provider cart={data.cart} shop={data.shop} consent={data.consent}>
          <Layout header={data.header} footer={data.footer}>
            <Outlet />
          </Layout>
        </Analytics.Provider>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const nonce = useNonce();
  let msg = 'Unknown error', status = 500;
  if (isRouteErrorResponse(error)) { msg = error?.data?.message ?? error.data; status = error.status; }
  else if (error instanceof Error) { msg = error.message; }
  return (
    <html lang="en">
      <head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><Meta /><Links /></head>
      <body style={{background:'#0a0a0a',color:'#f5f5f0',display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:'16px',fontFamily:'sans-serif'}}>
        <h1 style={{fontSize:'64px',color:'#c9a84c'}}>{status}</h1>
        <p>{msg}</p>
        <a href="/" style={{color:'#c9a84c'}}>← Back Home</a>
        <ScrollRestoration nonce={nonce} /><Scripts nonce={nonce} />
      </body>
    </html>
  );
}

const HEADER_QUERY = `#graphql
  ${MENU_FRAGMENT}
  query Header($headerMenuHandle: String!) {
    shop { name description brand { logo { image { url } } } }
    menu(handle: $headerMenuHandle) { ...Menu }
  }
`;

const FOOTER_QUERY = `#graphql
  ${MENU_FRAGMENT}
  query Footer($footerMenuHandle: String!) {
    menu(handle: $footerMenuHandle) { ...Menu }
  }
`;
