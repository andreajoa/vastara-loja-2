import {useLoaderData, useSearchParams, Link} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {SearchForm} from '~/components/SearchForm';
import {getEmptyPredictiveSearchResult} from '~/lib/search';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const term = data?.term || '';
  return [
    {title: term ? `Search: ${term} — VASTARA` : 'Search — VASTARA'},
    {name: 'robots', content: 'noindex, follow'},
  ];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');
  const searchPromise = isPredictive
    ? predictiveSearch({request, context})
    : regularSearch({request, context});

  searchPromise.catch((error) => {
    console.error(error);
    return {term: '', result: null, error: error.message};
  });

  return await searchPromise;
}

function fmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(amount);
}

/**
 * Renders the /search route — elegant Vastara design
 */
export default function SearchPage() {
  /** @type {LoaderReturnData} */
  const {type, term, result, error} = useLoaderData();
  const [params] = useSearchParams();
  const [_, setParams] = useSearchParams();
  if (type === 'predictive') return null;

  const products = result?.items?.products?.nodes || [];
  const articles = result?.items?.articles?.nodes || [];
  const pages = result?.items?.pages?.nodes || [];
  const pageInfo = result?.items?.products?.pageInfo || {};
  const totalProducts = products.length;
  const totalAll = result?.total || 0;

  return (
    <>
      <style suppressHydrationWarning>{`
        .vst-search-page{max-width:1200px;margin:0 auto;padding:120px 24px 60px;min-height:60vh;}
        @media(max-width:600px){.vst-search-page{padding:100px 16px 40px;}}

        .vst-search-page-header{text-align:center;margin-bottom:48px;}
        .vst-search-page-title{font-family:'Playfair Display',Georgia,serif;font-size:32px;font-weight:400;color:#0a0a0a;letter-spacing:-0.5px;margin:0 0 8px;}
        .vst-search-page-subtitle{font-size:11px;font-weight:300;color:#999;letter-spacing:2px;text-transform:uppercase;margin:0;}

        .vst-search-page-bar{display:flex;align-items:center;max-width:560px;margin:0 auto 48px;position:relative;}
        .vst-search-page-bar input{width:100%;height:52px;border:1px solid #e0e0e0;border-radius:0;padding:0 48px 0 20px;font-size:14px;font-weight:300;color:#0a0a0a;background:#fff;outline:none;letter-spacing:0.3px;transition:border-color 0.2s;}
        .vst-search-page-bar input:focus{border-color:#0a0a0a;}
        .vst-search-page-bar input::placeholder{color:#c0c0c0;font-weight:300;}
        .vst-search-page-bar input::-webkit-search-cancel-button{-webkit-appearance:none;}
        .vst-search-page-bar button{position:absolute;right:4px;top:4px;height:44px;width:44px;display:flex;align-items:center;justify-content:center;background:#0a0a0a;border:none;border-radius:0;cursor:pointer;transition:opacity 0.2s;}
        .vst-search-page-bar button:hover{opacity:0.7;}

        .vst-search-count{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;margin-bottom:24px;}
        .vst-search-count strong{color:#0a0a0a;font-weight:500;}

        /* Product Grid */
        .vst-search-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:48px;}
        @media(max-width:900px){.vst-search-grid{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:600px){.vst-search-grid{grid-template-columns:repeat(2,1fr);gap:12px;}}

        .vst-search-card{text-decoration:none;color:inherit;display:block;}
        .vst-search-card-img{position:relative;overflow:hidden;background:#f3f3f0;aspect-ratio:1/1;margin-bottom:12px;}
        .vst-search-card-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.6s ease;}
        .vst-search-card:hover .vst-search-card-img img{transform:scale(1.05);}
        .vst-search-card-brand{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#aaa;font-weight:400;margin-bottom:4px;}
        .vst-search-card-title{font-size:13px;font-weight:400;color:#0a0a0a;margin-bottom:6px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .vst-search-card-price{font-size:13px;color:#0a0a0a;font-weight:300;}
        .vst-search-card-price .compare{font-size:12px;color:#bbb;text-decoration:line-through;margin-left:8px;font-weight:300;}
        .vst-search-card-badge{position:absolute;top:10px;left:10px;background:#dc2626;color:#fff;font-size:9px;padding:3px 8px;font-family:monospace;letter-spacing:1px;}

        /* Articles */
        .vst-search-articles{margin-top:32px;border-top:1px solid #eee;padding-top:32px;}
        .vst-search-articles-title{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#aaa;margin-bottom:20px;font-weight:600;}
        .vst-search-article{display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #f5f5f5;text-decoration:none;color:inherit;transition:all 0.15s;}
        .vst-search-article:hover{padding-left:6px;}
        .vst-search-article-icon{width:40px;height:40px;border-radius:50%;background:#f3f3f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .vst-search-article-title{font-size:13px;color:#222;font-weight:400;}
        .vst-search-article-arrow{margin-left:auto;color:#ddd;font-size:14px;transition:all 0.15s;transform:translateX(-4px);opacity:0;}
        .vst-search-article:hover .vst-search-article-arrow{opacity:1;transform:translateX(0);color:#0a0a0a;}

        /* Empty State */
        .vst-search-empty{text-align:center;padding:60px 20px;}
        .vst-search-empty-icon{font-size:48px;margin-bottom:16px;opacity:0.3;}
        .vst-search-empty-title{font-family:'Playfair Display',Georgia,serif;font-size:22px;color:#0a0a0a;margin-bottom:8px;font-weight:400;}
        .vst-search-empty-text{font-size:13px;color:#999;font-weight:300;margin-bottom:24px;}
        .vst-search-empty-suggestions{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;}
        .vst-search-empty-tag{padding:8px 16px;border:1px solid #e0e0e0;font-size:11px;color:#666;text-decoration:none;transition:all 0.15s;letter-spacing:0.5px;}
        .vst-search-empty-tag:hover{border-color:#0a0a0a;color:#0a0a0a;}

        /* Pagination */
        .vst-search-pagination{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:40px;padding-top:32px;border-top:1px solid #eee;}
        .vst-search-pagination a,.vst-search-pagination button{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#0a0a0a;text-decoration:none;padding:12px 28px;border:1px solid #e0e0e0;background:none;cursor:pointer;transition:all 0.2s;font-family:inherit;}
        .vst-search-pagination a:hover,.vst-search-pagination button:hover{background:#0a0a0a;color:#fff;border-color:#0a0a0a;}
        .vst-search-pagination span{font-size:12px;color:#999;font-weight:300;}

        /* Error */
        .vst-search-error{color:#dc2626;font-size:13px;text-align:center;padding:20px;font-weight:300;}
      `}</style>

      <div className="vst-search-page">
        {/* Header */}
        <div className="vst-search-page-header">
          <h1 className="vst-search-page-title">Search</h1>
          <p className="vst-search-page-subtitle">Find your perfect timepiece</p>
        </div>

        {/* Search Bar */}
        <SearchForm className="vst-search-page-bar">
          {({inputRef}) => (
            <>
              <input
                defaultValue={term}
                name="q"
                placeholder="Search watches, brands, collections..."
                ref={inputRef}
                type="search"
              />
              <button type="submit" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </>
          )}
        </SearchForm>

        {/* Error */}
        {error && <p className="vst-search-error">{error}</p>}

        {/* No term — empty state */}
        {!term && (
          <div className="vst-search-empty">
            <div className="vst-search-empty-icon">⌚</div>
            <h2 className="vst-search-empty-title">Discover Our Collection</h2>
            <p className="vst-search-empty-text">Search for watches, brands, or styles</p>
            <div className="vst-search-empty-suggestions">
              {['Bulova', 'Diver', 'Chronograph', 'Skeleton', 'Luxury', 'Minimal'].map(t => (
                <Link key={t} to={`/search?q=${t}`} className="vst-search-empty-tag">{t}</Link>
              ))}
            </div>
          </div>
        )}

        {/* Term but no results */}
        {term && !error && totalAll === 0 && (
          <div className="vst-search-empty">
            <div className="vst-search-empty-icon">🔍</div>
            <h2 className="vst-search-empty-title">No results found</h2>
            <p className="vst-search-empty-text">We couldn't find anything for "<strong>{term}</strong>"</p>
            <div className="vst-search-empty-suggestions">
              {['Bulova', 'Diver', 'Chronograph', 'Skeleton', 'Luxury'].map(t => (
                <Link key={t} to={`/search?q=${t}`} className="vst-search-empty-tag">{t}</Link>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {term && totalAll > 0 && (
          <>
            <div className="vst-search-count">
              Showing <strong>{totalProducts}</strong> product{totalProducts !== 1 ? 's' : ''} for "<strong>{term}</strong>"
            </div>

            {/* Product Grid */}
            {totalProducts > 0 && (
              <div className="vst-search-grid">
                {products.map(product => {
                  const variant = product.selectedOrFirstAvailableVariant;
                  const image = variant?.image;
                  const price = variant?.price;
                  const comparePrice = variant?.compareAtPrice;
                  const isSale = comparePrice && parseFloat(comparePrice.amount) > parseFloat(price?.amount || 0);

                  return (
                    <Link key={product.id} to={`/products/${product.handle}`} className="vst-search-card">
                      <div className="vst-search-card-img">
                        {image && <img src={image.url} alt={image.altText || product.title} loading="lazy" width="300" height="300" />}
                        {isSale && <span className="vst-search-card-badge">SALE</span>}
                      </div>
                      {product.vendor && <div className="vst-search-card-brand">{product.vendor}</div>}
                      <div className="vst-search-card-title">{product.title}</div>
                      <div className="vst-search-card-price">
                        {price ? fmt(price.amount, price.currencyCode) : ''}
                        {isSale && comparePrice && <span className="compare">{fmt(comparePrice.amount, comparePrice.currencyCode)}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Articles */}
            {articles.length > 0 && (
              <div className="vst-search-articles">
                <div className="vst-search-articles-title">Articles ({articles.length})</div>
                {articles.map(article => (
                  <Link key={article.id} to={`/blogs/news/${article.handle}`} className="vst-search-article">
                    <div className="vst-search-article-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    </div>
                    <span className="vst-search-article-title">{article.title}</span>
                    <svg className="vst-search-article-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m9 18 6-6-6-6"/></svg>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pageInfo.hasNextPage && (
              <div className="vst-search-pagination">
                {pageInfo.hasPreviousPage && (
                  <button onClick={() => setParams(prev => { prev.set('q', term); prev.set('direction', 'prev'); return prev; })}>
                    ← Previous
                  </button>
                )}
                <span>Page {params.get('cursor') ? '2+' : '1'}</span>
                {pageInfo.hasNextPage && (
                  <button onClick={() => setParams(prev => { prev.set('q', term); if (pageInfo.endCursor) prev.set('cursor', pageInfo.endCursor); return prev; })}>
                    Next →
                  </button>
                )}
              </div>
            )}
          </>
        )}

        <Analytics.SearchView data={{searchTerm: term, searchResults: result}} />
      </div>
    </>
  );
}

/**
 * Regular search query and fragments
 * (adjust as needed)
 */
const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    trackingParameters
    vendor
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
      }
    }
  }
`;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page {
     __typename
     handle
    id
    title
    trackingParameters
  }
`;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
  }
`;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          ...SearchPage
        }
      }
    }
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
`;

/**
 * Regular search fetcher
 * @param {Pick<
 *   Route.LoaderArgs,
 *   'request' | 'context'
 * >}
 * @return {Promise<RegularSearchReturn>}
 */
async function regularSearch({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 8});
  const term = String(url.searchParams.get('q') || '');

  // Search articles, pages, and products for the `q` term
  const {errors, ...items} = await storefront.query(SEARCH_QUERY, {
    variables: {...variables, term},
  });

  if (!items) {
    throw new Error('No search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc, {nodes}) => acc + nodes.length,
    0,
  );

  const error = errors
    ? errors.map(({message}) => message).join(', ')
    : undefined;

  return {type: 'regular', term, error, result: {total, items}};
}

/**
 * Predictive search query and fragments
 * (adjust as needed)
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
`;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
`;

/**
 * Predictive search fetcher
 * @param {Pick<
 *   Route.ActionArgs,
 *   'request' | 'context'
 * >}
 * @return {Promise<PredictiveSearchReturn>}
 */
async function predictiveSearch({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  // Predictively search articles, collections, pages, products, and queries (suggestions)
  const {predictiveSearch: items, errors} = await storefront.query(
    PREDICTIVE_SEARCH_QUERY,
    {
      variables: {
        // customize search options as needed
        limit,
        limitScope: 'EACH',
        term,
      },
    },
  );

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors.map(({message}) => message).join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc, item) => acc + item.length,
    0,
  );

  return {type, term, result: {items, total}};
}

/** @typedef {import('./+types/search').Route} Route */
/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
/** @typedef {import('~/lib/search').PredictiveSearchReturn} PredictiveSearchReturn */
/** @typedef {import('storefrontapi.generated').RegularSearchQuery} RegularSearchQuery */
/** @typedef {import('storefrontapi.generated').PredictiveSearchQuery} PredictiveSearchQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
