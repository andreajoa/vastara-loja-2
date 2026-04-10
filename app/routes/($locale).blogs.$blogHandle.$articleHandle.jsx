import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data, location}) => {
  const article = data?.article;
  const title = article?.title || 'Article';
  const description = article?.seo?.description ||
    article?.contentHtml?.replace(/<[^>]*>/g, '').slice(0, 150).trim() + '...';
  const image = article?.image?.url || 'https://cdn.shopify.com/s/files/1/0778/2921/0327/files/VERTICAL_1.jpg';
  const blogHandle = location?.pathname?.split('/').find(s => s.includes('blog')) || 'blog';
  const articleHandle = article?.handle || '';
  const url = `https://vastara.online/blogs/${blogHandle}/${articleHandle}`;
  const publishedDate = article?.publishedAt;

  return [
    {title: `Vastara | ${title}`},
    {name: 'description', content: description},
    {tagName: 'link', rel: 'canonical', href: url},
    // Open Graph
    {property: 'og:type', content: 'article'},
    {property: 'og:url', content: url},
    {property: 'og:title', content: `Vastara | ${title}`},
    {property: 'og:description', content: description},
    {property: 'og:image', content: image},
    {property: 'og:site_name', content: 'Vastara'},
    {property: 'article:published_time', content: publishedDate},
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
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;

  return {article};
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

export default function Article() {
  const {article} = useLoaderData();
  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <div style={{paddingTop:'96px',minHeight:'100vh',background:'#fafafa'}}>
      <style>{`
        .article-hero{background:#0a0a0a;padding:60px 40px;text-align:center;}
        .article-img-wrap{max-width:900px;margin:0 auto;padding:0 24px;}
        .article-img-wrap img{width:100%;height:auto;display:block;border-radius:12px;margin-top:-40px;box-shadow:0 16px 60px rgba(0,0,0,0.15);}
        .article-body{max-width:740px;margin:0 auto;padding:48px 24px 80px;}
        .article-body h2{font-family:Georgia,serif;font-size:24px;font-weight:400;margin:36px 0 16px;color:#0a0a0a;}
        .article-body h3{font-size:18px;font-weight:600;margin:28px 0 12px;color:#0a0a0a;}
        .article-body p{font-size:15px;line-height:1.8;color:#374151;margin:0 0 20px;}
        .article-body ul,.article-body ol{padding-left:24px;margin:0 0 20px;}
        .article-body li{font-size:15px;line-height:1.8;color:#374151;margin-bottom:8px;}
        .article-body img{width:100%;border-radius:8px;margin:24px 0;}
        .article-body a{color:#c9a84c;text-decoration:underline;}
        @media(max-width:600px){
          .article-hero{padding:40px 20px;}
          .article-body{padding:32px 16px 60px;}
          .article-img-wrap img{margin-top:-20px;}
        }
      `}</style>

      <div className="article-hero">
        <p style={{fontSize:'10px',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'12px'}}>Vastara Editorial</p>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(24px,4vw,42px)',fontWeight:'400',color:'#fff',margin:'0 0 16px',lineHeight:'1.3',maxWidth:'800px',marginLeft:'auto',marginRight:'auto'}}>{title}</h1>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',flexWrap:'wrap'}}>
          {author?.name && <span style={{fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>{author.name}</span>}
          {author?.name && <span style={{color:'rgba(255,255,255,0.3)'}}>·</span>}
          <time dateTime={article.publishedAt} style={{fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>{publishedDate}</time>
        </div>
      </div>

      {image && (
        <div className="article-img-wrap">
          <Image
            data={image}
            sizes="(min-width: 900px) 860px, 100vw"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      )}

      <div className="article-body" dangerouslySetInnerHTML={{__html: contentHtml}} />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
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
