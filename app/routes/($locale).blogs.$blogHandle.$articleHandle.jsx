import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Vastara | ${data?.article.title ?? ''}`}];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request, params}) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {handle: articleHandle, data: blog.articleByHandle},
    {handle: blogHandle, data: blog},
  );

  const article = blog.articleByHandle;
  return {article};
}

function loadDeferredData({context}) {
  return {};
}

const articleStyles = `
  .va-wrapper {
    padding-top: 80px;
    min-height: 100vh;
    background: #fafaf8;
  }
  .va-hero {
    background: #0a0a0a;
    padding: 64px 40px 56px;
    text-align: center;
    margin-bottom: 0;
  }
  .va-eyebrow {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #c9a84c;
    margin: 0 0 16px;
    font-family: sans-serif;
  }
  .va-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(26px, 3.5vw, 46px);
    font-weight: 400;
    color: #fff;
    margin: 0 0 20px;
    line-height: 1.25;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
  .va-meta {
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #888;
    font-family: sans-serif;
  }
  .va-meta time, .va-meta address {
    display: inline;
    font-style: normal;
    color: #888;
  }
  .va-cover {
    width: 100%;
    max-height: 520px;
    object-fit: cover;
    display: block;
  }
  .va-cover-wrap {
    overflow: hidden;
    max-height: 520px;
  }
  .va-body {
    max-width: 760px;
    margin: 0 auto;
    padding: 56px 24px 96px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 18px;
    line-height: 1.85;
    color: #2a2a2a;
  }
  .va-body h1, .va-body h2, .va-body h3 {
    font-family: Georgia, serif;
    font-weight: 400;
    color: #0a0a0a;
    margin-top: 2em;
  }
  .va-body p {
    margin-bottom: 1.5em;
  }
  .va-body img {
    max-width: 100%;
    border-radius: 8px;
    margin: 1.5em 0;
  }
  .va-body a {
    color: #c9a84c;
    text-decoration: underline;
  }
  @media (max-width: 580px) {
    .va-hero {
      padding: 48px 20px 44px;
    }
    .va-body {
      font-size: 16px;
      padding: 40px 18px 72px;
    }
  }
`;

export default function Article() {
  /** @type {LoaderReturnData} */
  const {article} = useLoaderData();
  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <div className="va-wrapper">
      <style>{articleStyles}</style>

      <div className="va-hero">
        <p className="va-eyebrow">Vastara Editorial</p>
        <h1 className="va-title">{title}</h1>
        <p className="va-meta">
          <time dateTime={article.publishedAt}>{publishedDate}</time>
          {author?.name && (
            <>
              {' '}&middot;{' '}
              <address>{author.name}</address>
            </>
          )}
        </p>
      </div>

      {image && (
        <div className="va-cover-wrap">
          <Image
            data={image}
            sizes="100vw"
            loading="eager"
            className="va-cover"
          />
        </div>
      )}

      <div
        dangerouslySetInnerHTML={{__html: contentHtml}}
        className="va-body"
      />
    </div>
  );
}

const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
`;

/** @typedef {import('./+types/blogs.$blogHandle.$articleHandle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
