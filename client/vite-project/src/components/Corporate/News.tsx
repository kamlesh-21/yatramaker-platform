import BaseSEO from '../BaseSEO';
import Subscribe from '../Subscribe';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const News = () => {
  const newsItems = [
    {
      date: "July 15, 2024",
      title: "YatraMaker Launches Multi-City Trip Planner",
      description: "We're excited to announce our new Multi-City Trip Planner feature. Now you can easily plan complex itineraries spanning multiple destinations, all within your specified budget.",
      link: "/blog/multi-city-trip-planner"
    },
    {
      date: "June 30, 2024",
      title: "Partnership with Major Airlines Expands Travel Options",
      description: "YatraMaker has partnered with several major airlines, significantly expanding our flight options and allowing us to offer even more competitive prices for our users.",
      link: "/blog/airline-partnerships"
    },
    {
      date: "June 1, 2024",
      title: "New AI-Powered Personalization Features",
      description: "Our latest update introduces AI-powered personalization, providing even more tailored travel recommendations based on your past trips and preferences.",
      link: "/blog/ai-personalization"
    },
    {
      date: "May 15, 2024",
      title: "YatraMaker Mobile App Now Available",
      description: "Take YatraMaker with you wherever you go! Our new mobile app for iOS and Android devices lets you plan trips and access your itineraries on the move.",
      link: "/blog/mobile-app-launch"
    }
  ];

  return (
    <>
      <BaseSEO
        title="Latest News - YatraMaker | Travel Industry Updates"
        description="Stay updated with the latest news and updates from YatraMaker. Discover new features, improvements to our travel planning platform, and industry insights."
        canonicalUrl="https://yatramaker.com/news"
        ogImage="https://yatramaker.com/assets/ogimage3.jpg"
        ogType="website"
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Latest News</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Stay up to date with the latest features and improvements at YatraMaker. We&apos;re constantly evolving to make your travel planning experience even better.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {newsItems.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <CardDescription className="text-sm text-muted-foreground">
                  {item.date}
                </CardDescription>
                <CardTitle className="text-xl font-semibold">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Link 
                  to={item.link} 
                  className="text-primary hover:underline font-medium"
                >
                  Read more →
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-10 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">
              Want to be the first to know about our updates? Subscribe to our newsletter below:
            </p>
            <Subscribe />
          </div>
        </div>

        {/* Return to Home */}
        <div className="mt-10 text-center">
          <Link 
            to="/" 
            className="text-primary hover:underline inline-flex items-center gap-2"
          >
            ← Return to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default News;