import { Helmet } from 'react-helmet-async';

interface PageMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  robots?:
    | 'index'
    | 'noindex'
    | 'noindex,nofollow'
    | 'index,follow'
    | 'index,nofollow';
  lang?: string;
}

const defaultTitle = 'TūlBOX';
const defaultDescription =
  'TūlBOX is your modern toolkit for managing creative operations — featuring PDF tools, IMDb search, CWR conversion, and more.';
const defaultImage = 'https://tulbox.app/og-image.png';
const defaultRobots = 'index,nofollow';

export const PageMeta = ({
  title = defaultTitle,
  description = defaultDescription,
  image = defaultImage,
  url = typeof window !== 'undefined' ? window.location.href : undefined,
  robots = defaultRobots,
  lang = 'en',
}: PageMetaProps) => {
  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />

      {/* OpenGraph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};
