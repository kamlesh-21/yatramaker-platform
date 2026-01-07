// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Button } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import { backendURL } from '../../../utils/env';
// import BaseSEO from '../../BaseSEO';

// const API_URL = `${backendURL}/api`;

// const BlogLandingPage = ({ limit, showHeading = true, customHeading, customDescription }) => {
//   const [featuredBlogs, setFeaturedBlogs] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/blog/posts`);
//         const items = response.data.items || [];
//         const assets = response.data.includes ? response.data.includes.Asset : [];

//         // Limit the number of blog posts if the 'limit' prop is provided
//         const displayedItems = limit ? items.slice(0, limit) : items;

//         const updatedItems = displayedItems.map(item => {
//           const imageId = item.fields.image ? item.fields.image.sys.id : null;
//           const image = imageId ? assets.find(asset => asset.sys.id === imageId) : null;
//           return {
//             ...item,
//             imageUrl: image ? `https:${image.fields.file.url}` : null
//           };
//         });

//         setFeaturedBlogs(updatedItems);
//       } catch (error) {
//         console.error('Error fetching blog posts:', error);
//         setError('An error occurred while fetching blog posts.');
//       }
//     };

//     fetchBlogs();
//   }, [limit]);

//   if (error) {
//     return <Container><div className="alert alert-danger">Error fetching data: {error}</div></Container>;
//   }

//   return (
//     <>
//       {location.pathname === "/blog" && !customHeading && ( // Ensure SEO only applies on the blog page
//         <BaseSEO
//           title="Budget Travel Tips and Affordable Destinations | YatraMaker Blog"
//           description="Explore our latest travel insights, tips, and destination guides to plan your perfect trip."
//           ogImage="https://yatramaker.com/assets/ogimage8.jpg"
//           canonicalUrl="https://yatramaker.com/blog"
//           schemaType="Blog"
//           keywords="budget travel tips, affordable destinations, travel on a budget, cheap vacation ideas"
//         />
//       )}
//       <Container className="my-5">
//         {showHeading && (
//           <>
//             <h2 className="text-center mb-4">{customHeading || "Our Latest Blog Posts"}</h2>
//             {customDescription && <p className="text-center mb-4">{customDescription}</p>}
//           </>
//         )}
//         {featuredBlogs.length === 0 ? (
//           <div className="text-center">
//             <p>No blogs available at the moment. Stay tuned for upcoming blogs!</p>
//           </div>
//         ) : (
//           <Row className="row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
//             {featuredBlogs.map(blog => {
//               const { fields, sys } = blog;
//               const { title, slug, summary } = fields;
//               const imageUrl = blog.imageUrl;
  
//               return (
//                 <Col key={sys.id}>
//                   <Card className="h-100 shadow-sm">
//                     {imageUrl && (
//                       <Card.Img
//                         variant="top"
//                         src={`${imageUrl}?w=400&h=250&fit=fill`}
//                         alt={title}
//                         className="img-fluid"
//                       />
//                     )}
//                     <Card.Body>
//                       <Card.Title>{title}</Card.Title>
//                       <Card.Text>{summary}</Card.Text>
//                     </Card.Body>
//                     <Card.Footer className="bg-white border-top-0">
//                       <a href={`/blog/${slug}`} className="btn btn-outline-primary w-100">
//                         Read More
//                       </a>
//                     </Card.Footer>
//                   </Card>
//                 </Col>
//               );
//             })}
//           </Row>
//         )}
//       </Container>
//       <div className="text-center mb-4">
//         <a href="https://yatramaker.com" rel="canonical">Visit YatraMaker</a> to find destinations that fits your budget.
//       </div>
//     </>
//   );  
// };

// export default BlogLandingPage;

// client/vite-project/src/components/corporate/blog/BlogLandingPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { backendURL } from '@/utils/env';
import BaseSEO from '@/components/BaseSEO';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_URL = `${backendURL}/api`;

interface BlogPost {
  sys: {
    id: string;
  };
  fields: {
    title: string;
    slug: string;
    summary: string;
    image?: {
      sys: {
        id: string;
      };
    };
  };
  imageUrl?: string;
}

interface BlogLandingPageProps {
  limit?: number;
  showHeading?: boolean;
  customHeading?: string;
  customDescription?: string;
}

const BlogLandingPage: React.FC<BlogLandingPageProps> = ({ 
  limit, 
  showHeading = true, 
  customHeading, 
  customDescription 
}) => {
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/blog/posts`);
        const items = response.data.items || [];
        const assets = response.data.includes ? response.data.includes.Asset : [];

        // Limit the number of blog posts if the 'limit' prop is provided
        const displayedItems = limit ? items.slice(0, limit) : items;

        const updatedItems = displayedItems.map((item: any) => {
          const imageId = item.fields.image ? item.fields.image.sys.id : null;
          const image = imageId ? assets.find((asset: any) => asset.sys.id === imageId) : null;
          return {
            ...item,
            imageUrl: image ? `https:${image.fields.file.url}` : null
          };
        });

        setFeaturedBlogs(updatedItems);
        setError(null);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setError('Unable to load blog posts at the moment. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [limit]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const isBlogPage = window.location.pathname === "/blog";

  return (
    <>
      {isBlogPage && !customHeading && (
        <BaseSEO
          title="Budget Travel Tips and Affordable Destinations | YatraMaker Blog"
          description="Explore our latest travel insights, tips, and destination guides to plan your perfect trip."
          ogImage="https://yatramaker.com/assets/ogimage8.jpg"
          canonicalUrl="https://yatramaker.com/blog"
          schemaType="Blog"
          keywords="budget travel tips, affordable destinations, travel on a budget, cheap vacation ideas"
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showHeading && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {customHeading || "Our Latest Travel Insights"}
            </h2>
            {customDescription && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {customDescription}
              </p>
            )}
            {!customDescription && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Discover travel tips, destination guides, and budget-friendly inspiration for your next adventure
              </p>
            )}
          </div>
        )}

        {featuredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-4xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold mb-2">No blog posts available yet</h3>
              <p className="text-muted-foreground mb-6">
                We're working on some amazing travel content. Check back soon for inspiration!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredBlogs.map(blog => {
              const { fields, sys, imageUrl } = blog;
              const { title, slug, summary } = fields;

              return (
                <Card key={sys.id} className="group h-full flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden border">
                  {imageUrl && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={`${imageUrl}?w=400&h=250&fit=fill`}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="flex-1 p-6">
                    <h3 className="font-bold text-lg mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {summary}
                    </p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Link to={`/blog/${slug}`}>
                        Read More
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {!limit && featuredBlogs.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Looking for more travel inspiration? 
              <Link to="/" className="ml-2 text-primary hover:underline font-medium">
                Discover destinations that fit your budget
              </Link>
            </p>
          </div>
        )}

        {limit && featuredBlogs.length >= limit && (
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link to="/blog">
                View All Blog Posts
              </Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogLandingPage;