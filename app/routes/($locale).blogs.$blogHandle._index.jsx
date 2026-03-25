import {Link, useLoaderData} from 'react-router';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Vastara | ${data?.blog.title ?? ''}`}];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request, params}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 6,
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
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

function loadDeferredData({context}) {
  return {};
}

const blogStyles = `
  .vb-wrapper {
    padding-top: 80px;
    min-height: 100vh;
    background: #fafaf8;
  }
  .vb-hero {
    background: #0a0a0a;
    padding: 70px 40px 60px;
    text-align: center;
    margin-bottom: 56px;
  }
  .vb-eyebrow {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #c9a84c;
    margin: 0 0 14px;
    font-family: sans-serif;
  }
  .vb-hero-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(30px, 4vw, 52px);
    font-weight: 400;
    color: #fff;
    margin: 0;
    letter-spacing: -0.5px;
  }
  .vb-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px 80px;
  }
  .vb-card {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    display: block;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid #f0ede8;
  }
  .vb-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.10);
  }
  .vb-card img,
  .vb-card-img {
    width: 100%;
    aspect-ratio: 3/2;
    object-fit: cover;
    display: block;
  }
  .vb-card-body {
    padding: 20px 22px 24px;
  }
  .vb-card-date {
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #c9a84c;
    margin: 0 0 10px;
    font-family: sans-serif;
  }
  .vb-card-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 17px;
    font-weight: 400;
    color: #1a1a1a;
    line-height: 1.5;
    margin: 0;
  }
  @media (max-width: 900px) {
    .vb-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      padding: 0 24px 60px;
    }
  }
  @media (max-width: 580px) {
    .vb-grid {
      grid-template-columns: 1fr;
      gap: 20px;
      padding: 0 16px 60px;
    }
    .vb-hero {
      padding: 50px 20px 44px;
    }
  }
`;

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog} = useLoaderData();
  const {articles} = blog;

  return (
    <div className="vb-wrapper">
      <style>{blogStyles}</style>

      <div className="vb-hero">
        <p className="vb-eyebrow">Vastara Editorial</p>
        <h1 className="vb-hero-title">{blog.title}</h1>
      </div>

      <div className="vb-grid">
        <PaginatedResourceSection connection={articles}>
          {({node: article, index}) => (
            <ArticleItem
              article={article}
              key={article.id}
              loading={index < 3 ? 'eager' : 'lazy'}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   article: ArticleItemFragment;
 *   loading?: HTMLImageElement['loading'];
 * }}
 */
function ArticleItem({article, loading}) {
  const publishedAt = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <Link
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      className="vb-card"
    >
      {article.image && (
        <Image
          alt={article.image.altText || article.title}
          aspectRatio="3/2"
          data={article.image}
          loading={loading}
          sizes="(min-width: 900px) 33vw, (min-width: 580px) 50vw, 100vw"
          className="vb-card-img"
        />
      )}
      <div className="vb-card-body">
        <p className="vb-card-date">{publishedAt}</p>
        <h3 className="vb-card-title">{article.title}</h3>
      </div>
    </Link>
  );
}

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
