// // client/vite-project/sec/components/corporate/blog/SingleBlogPost.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { Container, Row, Col, Card, Button } from 'react-bootstrap';
// import axios from 'axios';
// import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
// import BaseSEO from '../../BaseSEO'
// import { backendURL } from '../../../utils/env';

// const API_URL = `${backendURL}/api`;

// const SingleBlogPost = () => {
//   const { slug } = useParams();
//   const [entry, setEntry] = useState(null);
//   const [recommendedPosts, setRecommendedPosts] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     window.scrollTo(0, 0);

//     axios.get(`${API_URL}/blog/posts/${slug}`)
//       .then((response) => {
//         if (response.data.items.length > 0) {
//           const item = response.data.items[0];
//           const assets = response.data.includes.Asset;
//           const entries = response.data.includes.Entry;

//           // Handle main post image
//           const imageId = item.fields.image?.sys.id;
//           const image = assets.find(asset => asset.sys.id === imageId);
//           item.imageUrl = image ? `https:${image.fields.file.url}` : '';

//           // Handle recommended posts
//           const recommendedIds = item.fields.recommendedPosts?.map(post => post.sys.id) || [];
//           const recommended = entries.filter(entry => recommendedIds.includes(entry.sys.id));

//           // Fetch and map images for recommended posts
//           const updatedRecommendedPosts = recommended.map(post => {
//             const imageId = post.fields.image?.sys?.id;
//             const image = assets.find(asset => asset.sys.id === imageId);
//             return {
//               ...post,
//               imageUrl: image ? `https:${image.fields.file.url}?w=250` : '/path/to/placeholder-image.jpg',
//             };
//           });

//           // Extract metaImage URL
//           const metaImageId = item.fields.metaImage?.sys?.id;
//           const metaImage = assets.find(asset => asset.sys.id === metaImageId);
//           const metaImageUrl = metaImage ? `https:${metaImage.fields.file.url}` : item.imageUrl;

//           // Set entry and recommended posts
//           setEntry({
//             ...item,
//             metaImageUrl
//           });
//           setRecommendedPosts(updatedRecommendedPosts);
//         } else {
//           setError(new Error('Post not found'));
//         }
//       })
//       .catch(error => {
//         console.error(error);
//         setError(error);
//       });
//   }, [slug]);

//   if (error) {
//     return <Container><div>Error: {error.message}</div></Container>;
//   }

//   if (!entry) {
//     return <Container><div>Loading...</div></Container>;
//   }

//   const { 
//     fields: { title, body, seoTitle, seoDescription, canonicalURL },
//     metaImageUrl,
//     sys: { createdAt, updatedAt }
//   } = entry;

//   const imageUrl = entry.metaImageUrl || entry.imageUrl;
//   const currentUrl = `${window.location.origin}/blog/${slug}`;

//   // Options for rendering rich text
//   const options = {
//     renderNode: {
//       'embedded-asset-block': (node) => {
//         const { fields } = node.data.target;
//         if (fields && fields.file && fields.title) {
//           const { file, title } = fields;
//           return (
//             <img
//               src={`https:${file.url}`}
//               alt={title}
//               style={{ maxWidth: '100%', height: 'auto' }}
//               className="mb-4"
//             />
//           );
//         }
//         return null;
//       }
//     }
//   };

//   return (
//     <>
//         <BaseSEO
//           title={seoTitle || title}
//           description={seoDescription || 'Read the latest travel tips and guides on YatraMaker.'}
//           ogImage={metaImageUrl || imageUrl}
//           canonicalUrl={`https://yatramaker.com/blog/${slug}`}
//           ogType="article"
//           schemaType="BlogPosting"
//         >
//         <script type="application/ld+json">
//           {JSON.stringify({
//             "@context": "https://schema.org",
//             "@type": "BlogPosting",
//             "headline": seoTitle || title,
//             "image": metaImageUrl,
//             "datePublished": createdAt,
//             "dateModified": updatedAt,
//             "author": {
//               "@type": "Organization",
//               "name": "YatraMaker"
//             }
//           })}
//         </script>
//       </BaseSEO>
//       <Container className="my-5">
//       <Row className="justify-content-center">
//         <Col xs={12} md={10} lg={8}>
//           <h1 className="mb-4">{title}</h1>
//           {imageUrl && (
//             <img
//               src={imageUrl}
//               alt={title}
//               className="img-fluid mb-4"
//               style={{ maxWidth: '100%', height: 'auto' }}
//             />
//           )}
//           <div className="blog-content mb-5" style={{ lineHeight: '1.6' }}>
//             {documentToReactComponents(body, options)}
//           </div>
//         </Col>
//       </Row>
//       {recommendedPosts.length > 0 && (
//         <div>
//           <hr />
//           <h2>Recommended Posts</h2>
//           <Row>
//             {recommendedPosts.map(post => {
//               const { imageUrl, fields, sys } = post;
//               const { title, slug } = fields;

//               return (
//                 <Col key={sys.id} xs={12} md={6} lg={4} className="mb-4">
//                   <Card>
//                     {imageUrl && (
//                       <Card.Img
//                         variant="top"
//                         src={imageUrl}
//                         alt={title}
//                       />
//                     )}
//                     <Card.Body>
//                       <Card.Title>{title}</Card.Title>
//                       <Button as={Link} to={`/blog/${slug}`} variant="primary">Read More</Button>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               );
//             })}
//           </Row>
//         </div>
//       )}
//       <Col className="mb-4 d-flex justify-content-center">
//         <Button variant="primary" size="lg" as={Link} to="/blog" className="mx-2">Go back to all blog posts</Button>
//         <Button variant="primary" size="lg" as={Link} to="/" className="mx-2">Return to Home</Button>
//       </Col>

//     </Container>


//     </>  
//   );
// }

// export default SingleBlogPost;

// client/vite-project/src/pages/blog/SingleBlogPost.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import BaseSEO from '@/components/BaseSEO';
import { backendURL } from '@/utils/env';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Home, Calendar, Clock } from "lucide-react";

const API_URL = `${backendURL}/api`;

interface BlogPost {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    title: string;
    body: any;
    seoTitle?: string;
    seoDescription?: string;
    canonicalURL?: string;
    metaImage?: {
      sys: {
        id: string;
      };
    };
    image?: {
      sys: {
        id: string;
      };
    };
    recommendedPosts?: Array<{
      sys: {
        id: string;
      };
    }>;
  };
  imageUrl?: string;
  metaImageUrl?: string;
}

interface RecommendedPost {
  sys: {
    id: string;
  };
  fields: {
    title: string;
    slug: string;
    summary?: string;
    image?: {
      sys: {
        id: string;
      };
    };
  };
  imageUrl?: string;
}

const SingleBlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [entry, setEntry] = useState<BlogPost | null>(null);
  const [recommendedPosts, setRecommendedPosts] = useState<RecommendedPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/blog/posts/${slug}`);
        
        if (response.data.items.length > 0) {
          const item = response.data.items[0];
          const assets = response.data.includes?.Asset || [];
          const entries = response.data.includes?.Entry || [];

          // Handle main post image
          const imageId = item.fields.image?.sys.id;
          const image = imageId ? assets.find((asset: any) => asset.sys.id === imageId) : null;
          const imageUrl = image ? `https:${image.fields.file.url}` : '';

          // Handle meta image
          const metaImageId = item.fields.metaImage?.sys?.id;
          const metaImage = metaImageId ? assets.find((asset: any) => asset.sys.id === metaImageId) : null;
          const metaImageUrl = metaImage ? `https:${metaImage.fields.file.url}` : imageUrl;

          // Handle recommended posts
          const recommendedIds = item.fields.recommendedPosts?.map((post: any) => post.sys.id) || [];
          const recommended = entries.filter((entry: any) => recommendedIds.includes(entry.sys.id));

          const updatedRecommendedPosts = recommended.map((post: any) => {
            const postImageId = post.fields.image?.sys?.id;
            const postImage = postImageId ? assets.find((asset: any) => asset.sys.id === postImageId) : null;
            return {
              ...post,
              imageUrl: postImage ? `https:${postImage.fields.file.url}?w=400&h=250&fit=fill` : undefined,
            };
          });

          setEntry({
            ...item,
            imageUrl,
            metaImageUrl
          });
          setRecommendedPosts(updatedRecommendedPosts);
        } else {
          setError('Blog post not found');
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError('Unable to load the blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-destructive">Oops!</h1>
            <p className="text-destructive mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
              <Button asChild>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!entry) return null;

  const { 
    fields: { title, body, seoTitle, seoDescription },
    metaImageUrl,
    imageUrl,
    sys: { createdAt, updatedAt }
  } = entry;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const readTime = () => {
    const wordCount = JSON.stringify(body).split(/\s+/).length;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Options for rendering rich text
  const options = {
    renderNode: {
      'embedded-asset-block': (node: any) => {
        const { fields } = node.data.target;
        if (fields && fields.file && fields.title) {
          const { file, title } = fields;
          return (
            <div className="my-8">
              <img
                src={`https:${file.url}`}
                alt={title}
                className="w-full h-auto rounded-lg"
              />
              {title && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {title}
                </p>
              )}
            </div>
          );
        }
        return null;
      },
      'paragraph': (node: any, children: any) => (
        <p className="mb-4 leading-relaxed">{children}</p>
      ),
      'heading-1': (node: any, children: any) => (
        <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">{children}</h2>
      ),
      'heading-2': (node: any, children: any) => (
        <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h3>
      ),
      'heading-3': (node: any, children: any) => (
        <h4 className="text-lg font-semibold mt-5 mb-2 text-foreground">{children}</h4>
      ),
      'unordered-list': (node: any, children: any) => (
        <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>
      ),
      'ordered-list': (node: any, children: any) => (
        <ol className="list-decimal pl-5 mb-4 space-y-2">{children}</ol>
      ),
    }
  };

  return (
    <>
      <BaseSEO
        title={seoTitle || title}
        description={seoDescription || 'Read the latest travel tips and guides on YatraMaker.'}
        ogImage={metaImageUrl || imageUrl}
        canonicalUrl={`https://yatramaker.com/blog/${slug}`}
        ogType="article"
        schemaType="BlogPosting"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": seoTitle || title,
            "image": metaImageUrl || imageUrl,
            "datePublished": createdAt,
            "dateModified": updatedAt,
            "author": {
              "@type": "Organization",
              "name": "YatraMaker"
            }
          })}
        </script>
      </BaseSEO>
      
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-8">
            <Button asChild variant="ghost" size="sm">
              <Link to="/blog" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to All Posts
              </Link>
            </Button>
          </div>

          {/* Article Header */}
          <article>
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground leading-tight">
                {title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readTime()}</span>
                </div>
              </div>

              {imageUrl && (
                <div className="mb-8">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-auto rounded-xl shadow-lg"
                  />
                </div>
              )}
            </header>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-12">
              {documentToReactComponents(body, options)}
            </div>
          </article>

          {/* Recommended Posts */}
          {recommendedPosts.length > 0 && (
            <section className="mt-16 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-8 text-foreground">Recommended Reads</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedPosts.map(post => {
                  const { fields, sys, imageUrl } = post;
                  const { title, slug } = fields;

                  return (
                    <Card key={sys.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {imageUrl && (
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-3 line-clamp-2">{title}</h3>
                        <Button asChild variant="outline" className="w-full">
                          <Link to={`/blog/${slug}`}>
                            Read More
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Blog
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Start Planning Your Trip
              </Link>
            </Button>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Looking for travel inspiration?{' '}
              <Link to="/" className="text-primary hover:underline font-medium">
                Discover destinations that fit your budget
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleBlogPost;