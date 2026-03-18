export const CART_FRAGMENT = `#graphql
  fragment CartLine on CartLine {
    id
    quantity
    merchandise {
      ... on ProductVariant {
        id title
        price { amount currencyCode }
        image { url altText }
        product { title handle }
        selectedOptions { name value }
      }
    }
    cost {
      totalAmount { amount currencyCode }
      amountPerQuantity { amount currencyCode }
    }
  }
  fragment Cart on Cart {
    id checkoutUrl totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) { nodes { ...CartLine } }
    discountCodes { applicable code }
  }
`;

export const CREATE_CART_MUTATION = `#graphql
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ...Cart }
      errors: userErrors { message field }
    }
  }
  ${CART_FRAGMENT}
`;

export const ADD_TO_CART_MUTATION = `#graphql
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...Cart }
      errors: userErrors { message field }
    }
  }
  ${CART_FRAGMENT}
`;

export const REMOVE_FROM_CART_MUTATION = `#graphql
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...Cart }
      errors: userErrors { message field }
    }
  }
  ${CART_FRAGMENT}
`;

export const UPDATE_CART_MUTATION = `#graphql
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...Cart }
      errors: userErrors { message field }
    }
  }
  ${CART_FRAGMENT}
`;
