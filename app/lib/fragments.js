export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    handle
    vendor
    tags
    priceRange {
      minVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    images(first: 2) {
      nodes { url altText width height }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        selectedOptions { name value }
      }
    }
  }
`;

export const MENU_FRAGMENT = `#graphql
  fragment MenuItem on MenuItem {
    id title url type
    items { id title url type }
  }
  fragment Menu on Menu {
    id handle
    items { ...MenuItem }
  }
`;
