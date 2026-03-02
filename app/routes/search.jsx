import {json} from '@shopify/hydrogen';
import {useLoaderData, Link} from 'react-router';
import {useContext} from 'react';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import ProductCard from '~/components/ProductCard';
import {CartContext} from '~/components/Layout';

export async function loader({request, context}) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  if (!q) return json({results:null, q:''});
  const {products} = await context.storefront.query(SEARCH_QUERY, {variables:{query:q,first:20}});
  return json({results: products?.nodes||[], q});
}

export const meta = () => [{title:'Search | Vastara'}];

export default function SearchPage() {
  const {results, q} = useLoaderData();
  const cart = useContext(CartContext);
  return (
    <div style={{paddingTop:'104px',maxWidth:'1400px',margin:'0 auto',padding:'120px 24px 80px',fontFamily:'"DM Sans",sans-serif'}}>
      <h1 style={{fontFamily:'"Playfair Display",serif',fontSize:'2.5rem',marginBottom:'32px'}}>Search Watches</h1>
      <form method="get" style={{display:'flex',gap:'12px',marginBottom:'48px',maxWidth:'500px'}}>
        <input type="search" name="q" defaultValue={q} placeholder="Search watches..."
          style={{flex:1,border:'1px solid #d1d5db',padding:'12px 16px',fontSize:'14px',outline:'none'}} />
        <button type="submit" style={{padding:'12px 24px',background:'#0a0a0a',color:'#fff',border:'none',fontSize:'11px',fontFamily:'monospace',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer'}}>
          Search
        </button>
      </form>
      {results && (
        <>
          <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'24px',fontFamily:'monospace'}}>{results.length} results for "{q}"</p>
          {results.length > 0
            ? <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'24px'}}>
                {results.map(p => <ProductCard key={p.id} product={p} onAddToCart={cart?.addToCart} />)}
              </div>
            : <p style={{color:'#9ca3af',fontSize:'15px'}}>No results found. Try different keywords.</p>
          }
        </>
      )}
    </div>
  );
}

const SEARCH_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Search($query: String!, $first: Int!) {
    products(first: $first, query: $query) { nodes { ...ProductCard } }
  }
`;
