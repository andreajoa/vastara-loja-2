import {useNonce, Analytics, getShopAnalytics} from '@shopify/hydrogen';
import {Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData} from 'react-router';
import appStyles from '~/styles/app.css?url';
import {MENU_FRAGMENT} from '~/lib/fragments';
import Layout from '~/components/Layout';

export const links = () => [
  {rel:'stylesheet', href:appStyles},
  {rel:'preconnect', href:'https://fonts.googleapis.com'},
  {rel:'preconnect', href:'https://fonts.gstatic.com', crossOrigin:'anonymous'},
  {rel:'preload', href:'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap', as:'style'},
  {rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap'},
];

export const meta = () => [
  {name: 'robots', content: 'index, follow'},
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

// Always revalidate root to keep cart fresh
export const shouldRevalidate = ({formMethod, defaultShouldRevalidate, formAction}) => {
  // Always revalidate when any form is submitted (including fetchers to /cart)
  if (formMethod && formMethod !== 'GET') return true;
  if (formAction?.includes('/cart')) return true;
  return defaultShouldRevalidate;
};

export const handle = {id: 'root'};

export default function App() {
  const nonce = useNonce();
  const data = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="color-scheme" content="light" />
        <Meta /><Links />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://vastara.online/#organization",
              "name": "Vastara",
              "url": "https://vastara.online",
              "logo": "https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_1.jpg",
              "sameAs": [
                "https://www.instagram.com/vastarastore/",
                "https://www.facebook.com/profile.php?id=100094888641840",
                "https://www.tiktok.com/@vastara_store",
                "https://www.youtube.com/@VASTARA-STORE"
              ],
              "contactPoint": {"@type": "ContactPoint", "contactType": "customer service", "availableLanguage": "English"}
            },
            {
              "@type": "WebSite",
              "@id": "https://vastara.online/#website",
              "url": "https://vastara.online",
              "name": "Vastara — Premium Watches",
              "publisher": {"@id": "https://vastara.online/#organization"},
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://vastara.online/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          ]
        })}} />
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
