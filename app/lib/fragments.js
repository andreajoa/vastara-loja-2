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

export const CART_QUERY_FRAGMENT = `#graphql
  fragment CartApiQuery on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer { id email firstName lastName displayName }
      email
      phone
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        attributes { key value }
        cost {
          totalAmount { amount currencyCode }
          amountPerQuantity { amount currencyCode }
          compareAtAmountPerQuantity { amount currencyCode }
        }
        merchandise {
          ... on ProductVariant {
            id
            availableForSale
            compareAtPrice { amount currencyCode }
            price { amount currencyCode }
            requiresShipping
            title
            image { id url altText width height }
            product { handle title }
            selectedOptions { name value }
          }
        }
      }
    }
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalDutyAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    note
    attributes { key value }
    discountCodes { applicable code }
  }
`;
