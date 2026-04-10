import {useNonce, Analytics, getShopAnalytics} from '@shopify/hydrogen';
import {Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData} from 'react-router';
import appStyles from '~/styles/app.css?url';
import {MENU_FRAGMENT} from '~/lib/fragments';
import Layout from '~/components/Layout';
import {GoogleAnalytics} from '~/components/GoogleAnalytics';

export const links = () => [
  {rel:'icon', type:'image/png', href:'/favicon.png'},
  {rel:'apple-touch-icon', href:'/favicon.png', sizes:'180x180'},
  // Hreflang com self-reference (todas as páginas referenciam todas as outras)
  {rel:'alternate', hrefLang:'en-us', href:'https://vastara.online/en-us/'},
  {rel:'alternate', hrefLang:'en-gb', href:'https://vastara.online/en-gb/'},
  {rel:'alternate', hrefLang:'en-ca', href:'https://vastara.online/en-ca/'},
  {rel:'alternate', hrefLang:'en-au', href:'https://vastara.online/en-au/'},
  {rel:'alternate', hrefLang:'en-nz', href:'https://vastara.online/en-nz/'},
  {rel:'alternate', hrefLang:'x-default', href:'https://vastara.online/'},
  {rel:'stylesheet', href:appStyles},
  // Font preconnections for faster loading
  {rel:'preconnect', href:'https://fonts.googleapis.com'},
  {rel:'preconnect', href:'https://fonts.gstatic.com', crossOrigin:'anonymous'},
  {rel:'preconnect', href:'https://cdn.shopify.com', crossOrigin:'anonymous'},
  // Preload critical font (Playfair Display)
  {rel:'preload', href:'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vysZs7B96zM4.woff2', as:'font', type:'font/woff2', crossOrigin:'anonymous'},
  // DNS prefetch for Google Analytics
  {rel:'dns-prefetch', href:'https://www.googletagmanager.com'},
  {rel:'dns-prefetch', href:'https://www.google-analytics.com'},
  // Favicon preload for LCP
  {rel:'preload', href:'/favicon.png', as:'image', type:'image/png'},
];

// Meta tags dinâmicas para cada página com hreflang corrigido
export const meta = ({data, location}) => {
  const currentPath = location?.pathname || '/';
  const origin = 'https://vastara.online';
  const baseUrl = `${origin}${currentPath}`;

  // Lista de locales suportados
  const locales = ['en-us', 'en-gb', 'en-ca', 'en-au', 'en-nz'];

  // Gerar tags hreflang para a página atual
  const hreflangLinks = locales.map(locale => ({
    tagName: 'link',
    rel: 'alternate',
    hrefLang: locale,
    href: `${origin}/${locale}${currentPath}`,
  }));

  // Adicionar x-default e self-reference
  hreflangLinks.push(
    {tagName: 'link', rel: 'alternate', hrefLang: 'x-default', href: baseUrl},
    {tagName: 'link', rel: 'canonical', href: baseUrl}
  );

  return [
    {name: 'robots', content: 'index, follow'},
    ...hreflangLinks,
  ];
};

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

export const shouldRevalidate = ({formMethod, defaultShouldRevalidate, formAction}) => {
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
      {/* Google Tag Manager - Moved to end of body to reduce render blocking */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="color-scheme" content="light" />
        <Meta /><Links />
        <script nonce={nonce} dangerouslySetInnerHTML={{__html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-LW70Z8LP18');
        `}} />
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
      {/* Google Tag Manager (noscript) */}
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TRLDBT7Q" height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
      {/* End Google Tag Manager (noscript) */}
        <Analytics.Provider cart={data.cart} shop={data.shop} consent={data.consent}>
          <Layout header={data.header} footer={data.footer}>
            <Outlet />
          </Layout>
        </Analytics.Provider>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        {/* Google Analytics - Moved to end of body, deferred for better performance */}
        <script defer nonce={nonce} dangerouslySetInnerHTML={{__html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-LW70Z8LP18');
        `}} />
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
