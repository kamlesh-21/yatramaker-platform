import BaseSEO from '../BaseSEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Partners = () => {
  const partnerTypes = [
    {
      type: "Hotels",
      description: "Join our network of accommodations to reach budget-conscious travelers and increase your bookings.",
      icon: "🏨"
    },
    {
      type: "Airlines",
      description: "Partner with us to offer competitive flight options and reach a wider audience of travel planners.",
      icon: "✈️"
    },
    {
      type: "OTAs",
      description: "Integrate your offerings with our platform to provide more options and value to our users.",
      icon: "🌐"
    },
    {
      type: "Travel API Providers",
      description: "Help us enhance our data and functionality to provide even more accurate and comprehensive travel planning.",
      icon: "🔌"
    },
    {
      type: "Travel Agents",
      description: "Leverage our platform to offer budget-based travel planning to your clients and expand your business.",
      icon: "👩‍💼"
    }
  ];

  return (
    <>
      <BaseSEO
        title="Partner with YatraMaker - Enhance Travel Experiences Together"
        description="Join YatraMaker in revolutionizing travel planning. Partner with us to offer budget-friendly, comprehensive travel solutions to a growing user base."
        canonicalUrl="https://yatramaker.com/partner"
        ogImage="https://yatramaker.com/assets/ogimage4.jpg"
        ogType="website"
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Partner Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Partner with YatraMaker</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join us in revolutionizing travel planning and providing exceptional experiences to budget-conscious travelers worldwide.
          </p>
        </div>

        {/* Partner Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {partnerTypes.map((partner, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{partner.icon}</div>
                <CardTitle>{partner.type}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>{partner.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold mb-4">Ready to Collaborate?</h2>
          <Button size="lg" asChild>
            <a href="mailto:info@yatramaker.com">
              Contact Our Partnerships Team
            </a>
          </Button>
        </div>

        {/* Partner Credits Section */}
        <div className="mt-10 text-center border-t pt-10">
          <p className="text-sm text-muted-foreground mb-4">Partner Credits</p>
          <div className="flex flex-wrap justify-center items-center gap-6 mb-4">
            <a href="https://submitx.com" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://submitx.com/images/submitx.jpg" 
                alt="SubmitX.com - Website Promotion Service" 
                className="max-w-[100px] h-auto"
              />
            </a>
            <a href="https://www.activesearchresults.com/" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://www.activesearchresults.com/images/asrbutton.png" 
                alt="Active Search Results" 
                className="max-w-[100px] h-auto"
              />
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            Special thanks to{' '}
            <a href="https://submitx.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              SubmitX.com
            </a>
            ,{' '}
            <a href="https://www.activesearchresults.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Active Search Results
            </a>
            ,{' '}
            <a href="https://www.websquash.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Free search engine submission
            </a>
            {' '}for their promotion services.
          </p>
        </div>
      </div>
    </>
  );
};

export default Partners;