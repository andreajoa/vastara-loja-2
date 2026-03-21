import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

export async function loader({context}) {
  const {storefront} = context;

  const data = await storefront.query(`#graphql
    query CollectionAllPage($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
      collection(handle: "all") {
        id
        title
        description
        products(first: 24) {
          nodes {
            id
            handle
            title
            featuredImage {
              url
              altText
              width
              height
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `);

  if (!data?.collection) {
    throw new Response('Collection not found', {status: 404});
  }

  return data;
}

function formatMoney(amount, currencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(amount || 0));
}

export default function CollectionsAllPage() {
  const {collection} = useLoaderData();
  const products = collection?.products?.nodes || [];

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 48px'}}>
      <div style={{marginBottom: '32px'}}>
        <p style={{fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#777', marginBottom: '8px'}}>
          Collection
        </p>
        <h1 style={{fontSize: '40px', margin: 0}}>{collection.title}</h1>
        {collection.description ? (
          <p style={{marginTop: '12px', color: '#666', maxWidth: '720px', lineHeight: 1.6}}>
            {collection.description}
          </p>
        ) : null}
      </div>

      {products.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.handle}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid #eee',
                background: '#fff',
              }}
            >
              <div style={{background: '#f7f7f7', aspectRatio: '1 / 1', overflow: 'hidden'}}>
                {product.featuredImage ? (
                  <Image
                    data={product.featuredImage}
                    sizes="(min-width: 45em) 25vw, 50vw"
                    style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                  />
                ) : (
                  <div style={{width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#999'}}>
                    Sem imagem
                  </div>
                )}
              </div>

              <div style={{padding: '16px'}}>
                <h2 style={{fontSize: '16px', margin: '0 0 8px', lineHeight: 1.4}}>
                  {product.title}
                </h2>
                <p style={{margin: 0, fontWeight: 600}}>
                  {formatMoney(
                    product.priceRange?.minVariantPrice?.amount,
                    product.priceRange?.minVariantPrice?.currencyCode,
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
