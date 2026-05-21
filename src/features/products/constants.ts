export const PRODUCTS_NEW_QUERY_PARAM = "new";
export const PRODUCTS_NEW_QUERY_VALUE = "1";

export const productsNewUrl = () =>
  `/products?${PRODUCTS_NEW_QUERY_PARAM}=${PRODUCTS_NEW_QUERY_VALUE}`;
