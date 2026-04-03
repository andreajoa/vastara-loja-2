import {useAnalytics} from '@shopify/hydrogen';
import {useEffect} from 'react';

export function GoogleAnalytics({measurementId}) {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('GoogleAnalytics');

  useEffect(() => {
    // Page view
    subscribe('page_viewed', (data) => {
      if (!window.gtag) return;
      window.gtag('event', 'page_view', {
        page_location: data.url,
      });
    });

    // Product viewed
    subscribe('product_viewed', (data) => {
      if (!window.gtag) return;
      const product = data.products?.[0];
      if (!product) return;
      window.gtag('event', 'view_item', {
        currency: product.price ? 'USD' : undefined,
        value: parseFloat(product.price || 0),
        items: [{
          item_id: product.id,
          item_name: product.title,
          item_variant: product.variantTitle,
          price: parseFloat(product.price || 0),
          quantity: product.quantity || 1,
        }],
      });
    });

    // Add to cart
    subscribe('product_added_to_cart', (data) => {
      if (!window.gtag) return;
      const line = data.cart?.lines?.nodes?.[data.cart.lines.nodes.length - 1];
      if (!line) return;
      window.gtag('event', 'add_to_cart', {
        currency: line.cost?.totalAmount?.currencyCode || 'USD',
        value: parseFloat(line.cost?.totalAmount?.amount || 0),
        items: [{
          item_id: line.merchandise?.id,
          item_name: line.merchandise?.product?.title,
          item_variant: line.merchandise?.title,
          price: parseFloat(line.merchandise?.price?.amount || 0),
          quantity: line.quantity,
        }],
      });
    });

    // Cart viewed
    subscribe('cart_viewed', (data) => {
      if (!window.gtag) return;
      const items = (data.cart?.lines?.nodes || []).map(line => ({
        item_id: line.merchandise?.id,
        item_name: line.merchandise?.product?.title,
        item_variant: line.merchandise?.title,
        price: parseFloat(line.merchandise?.price?.amount || 0),
        quantity: line.quantity,
      }));
      window.gtag('event', 'view_cart', {
        currency: data.cart?.cost?.totalAmount?.currencyCode || 'USD',
        value: parseFloat(data.cart?.cost?.totalAmount?.amount || 0),
        items,
      });
    });

    // Collection viewed
    subscribe('collection_viewed', (data) => {
      if (!window.gtag) return;
      window.gtag('event', 'view_item_list', {
        item_list_id: data.collection?.id,
        item_list_name: data.collection?.handle,
      });
    });

    ready();
  }, []);

  return null;
}
