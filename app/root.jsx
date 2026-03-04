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

// CRITICAL: Always revalidate root when cart is modified
export const shouldRevalidate = ({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}) => {
  // Revalidate if we're making a non-GET request (cart actions)
  if (formMethod && formMethod !== 'GET') {
    return true;
  }
  // Revalidate if cart is in URL (drawer scenario)
  if (currentUrl.searchParams.has('cart') || nextUrl.searchParams.has('cart')) {
    return true;
  }
  return defaultShouldRevalidate;
};

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
