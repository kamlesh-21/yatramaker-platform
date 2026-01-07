import { useEffect } from 'react';
import BaseSEO from '../BaseSEO';
import { Link } from 'react-router-dom';

const Contact = () => {
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    script1.async = true;
    document.body.appendChild(script1);

    script1.onload = () => {
      // Declare the type for jotformEmbedHandler to avoid TypeScript error
      (window as any).jotformEmbedHandler("iframe[id='JotFormIFrame-242030028752446']", "https://form.jotform.com/");
    };

    return () => {
      document.body.removeChild(script1);
    };
  }, []);

  return (
    <>
      <BaseSEO
        title="Contact YatraMaker - Travel Support & Inquiries"
        description="Reach out to YatraMaker for travel support, customer service, or any inquiries. Visit our office, call, or email us for personalized assistance on travel-related matters."
        canonicalUrl="https://yatramaker.com/contact"
        ogImage="https://yatramaker.com/assets/ogimage4.jpg"
        schemaType="ContactPage"
        keywords="contact YatraMaker, travel support, YatraMaker customer service, travel planning help, YatraMaker contact information"
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Connect with us</h1>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Visit us</h2>
              <p className="text-muted-foreground">
                R: 175, Sri Ram Kunj, Phase 3, Nawadih, Dhanbad, Jharkhand - 828130
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Call us</h2>
              <p className="text-muted-foreground">
                +91 9646 56 2880
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Email us</h2>
              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Travel related queries:{' '}
                  <a href="mailto:trips@yatramaker.com" className="text-primary hover:underline">
                    trips@yatramaker.com
                  </a>
                </p>
                <p className="text-muted-foreground">
                  For Customer Support:{' '}
                  <a href="mailto:support@yatramaker.com" className="text-primary hover:underline">
                    support@yatramaker.com
                  </a>
                </p>
                <p className="text-muted-foreground">
                  For any other query:{' '}
                  <a href="mailto:info@yatramaker.com" className="text-primary hover:underline">
                    info@yatramaker.com
                  </a>
                  ,{' '}
                  <a href="mailto:makeayatra@gmail.com" className="text-primary hover:underline">
                    makeayatra@gmail.com
                  </a>
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Follow us</h2>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.facebook.com/people/YatraMaker/61563261184870/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Facebook
                </a>
                <a href="https://x.com/YatraMaker" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Twitter
                </a>
                <a href="https://www.linkedin.com/company/yatramaker/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  LinkedIn
                </a>
                <a href="https://www.instagram.com/yatra_maker/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Instagram
                </a>
              </div>
            </div>
            
            <div className="mt-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3649.7663980224957!2d86.41013317444212!3d23.8269044858367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjPCsDQ5JzM2LjgiTiA4NsKwMjQnNDUuOCJF!5e0!3m2!1sen!2sin!4v1721622265161!5m2!1sen!2sin"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Google Maps Location"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
          
          {/* Right Column - Contact Form */}
          <div>
            <iframe
              id="JotFormIFrame-242030028752446"
              title="Information Request Form"
              onLoad={() => window.parent.scrollTo(0, 0)}
              allow="geolocation; microphone; camera; fullscreen"
              src="https://form.jotform.com/242030028752446"
              frameBorder="0"
              style={{ width: '100%', height: '800px', border: 'none' }}
              scrolling="no"
            ></iframe>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <Link to="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default Contact;