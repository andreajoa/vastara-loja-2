import {Link, useLoaderData} from 'react-router';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data, location}) => {
  const blog = data?.blog;
  const title = blog?.title || 'Blog';
  const description = blog?.seo?.description ||
    `Read the latest articles from Vastara. Discover watch guides, style tips, and premium timepiece insights.`;
  const blogHandle = blog?.handle || 'blog';
  const url = `https://vastara.online/blogs/${blogHandle}`;
  const image = 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_1.jpg';

  return [
    {title: `Vastara | ${title}`},
    {name: 'description', content: description},
    {tagName: 'link', rel: 'canonical', href: url},
    // Open Graph
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: url},
    {property: 'og:title', content: `Vastara | ${title}`},
    {property: 'og:description', content: description},
    {property: 'og:image', content: image},
    {property: 'og:site_name', content: 'Vastara'},
    // Twitter Card
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: `Vastara | ${title}`},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: image},
    // Additional SEO
    {name: 'robots', content: 'index, follow'},
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request, params}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Blog() {
  const {blog} = useLoaderData();
  const {articles} = blog;

  return (
    <div style={{paddingTop:'96px',minHeight:'100vh',background:'#fafafa'}}>
      <style>{`
        .blog-hero{background:#0a0a0a;padding:60px 40px;text-align:center;margin-bottom:48px;}
        .blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;max-width:1200px;margin:0 auto;padding:0 40px 80px;}
        .blog-card{background:#fff;border-radius:12px;overflow:hidden;text-decoration:none;color:inherit;display:block;transition:transform 0.3s ease,box-shadow 0.3s ease;}
        .blog-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,0.1);}
        .blog-card-img{width:100%;aspect-ratio:3/2;object-fit:cover;display:block;background:#f5f5f0;}
        .blog-card-body{padding:20px;}
        .blog-card-date{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:8px;}
        .blog-card-title{font-family:Georgia,serif;font-size:17px;font-weight:400;color:#0a0a0a;line-height:1.4;margin:0;}
        @media(max-width:900px){.blog-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:600px){.blog-grid{grid-template-columns:1fr;padding:0 16px 60px;}.blog-hero{padding:40px 20px;}}
      `}</style>

      <div className="blog-hero">
        <p style={{fontSize:'10px',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'12px'}}>Vastara Editorial</p>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(28px,4vw,48px)',fontWeight:'400',color:'#fff',margin:0}}>{blog.title}</h1>
      </div>

      <div className="blog-grid">
        <PaginatedResourceSection connection={articles}>
          {({node: article, index}) => (
            <ArticleItem article={article} key={article.id} loading={index < 3 ? 'eager' : 'lazy'} />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function ArticleItem({article, loading}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <Link to={`/blogs/${article.blog.handle}/${article.handle}`} className="blog-card">
      {article.image && (
        <Image
          alt={article.image.altText || article.title}
          data={article.image}
          loading={loading}
          sizes="(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw"
          className="blog-card-img"
        />
      )}
      <div className="blog-card-body">
        <p className="blog-card-date">{publishedAt}</p>
        <h3 className="blog-card-title">{article.title}</h3>
      </div>
    </Link>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
`;

/** @typedef {import('./+types/blogs.$blogHandle._index').Route} Route */
/** @typedef {import('storefrontapi.generated').ArticleItemFragment} ArticleItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
