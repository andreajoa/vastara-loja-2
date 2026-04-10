import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} reactRouterContext
 * @param {HydrogenRouterContextProvider} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Allow inline styles and scripts with nonce
    styleSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.shopify.com", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    // Allow scripts from Shopify, Google Analytics, and inline with nonce
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'",
      "https://cdn.shopify.com",
      "https://shopify.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
    ],
    // Allow images from Shopify CDN and other trusted sources
    imgSrc: ["'self'", "https://cdn.shopify.com", "https://*.shopify.com", "data:", "https://www.googletagmanager.com"],
    // Allow connect to Google Analytics and IPAPI
    connectSrc: ["'self'",
      "https://cdn.shopify.com",
      "https://shopify.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://ipapi.co",
    ],
    // Allow frames for Google Tag Manager (if needed)
    frameSrc: ["'self'", "https://www.googletagmanager.com"],
    // Allow XHR/fetch to same-origin and Google services
    defaultSrc: ["'self'",
      "https://cdn.shopify.com",
      "https://shopify.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://ipapi.co",
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/hydrogen').HydrogenRouterContextProvider} HydrogenRouterContextProvider */
/** @typedef {import('react-router').EntryContext} EntryContext */
