// client/vite-project/src/components/Corporate/Contact.tsx
import { useState } from 'react';
import BaseSEO from '@/components/BaseSEO';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, Mail, Loader2, Check } from 'lucide-react';
import { submitContactForm } from '@/lib/api';

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general' as 'general' | 'travel' | 'support' | 'booking' | 'feedback' | 'other'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitContactForm(formData);
      
      setIsSubmitted(true);
      toast({
        title: "✅ Message Sent!",
        description: "We'll get back to you within 24 hours."
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
      
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact us directly",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Visit us
              </h2>
              <p className="text-muted-foreground">
                R: 175, Sri Ram Kunj, Phase 3, Nawadih, Dhanbad, Jharkhand - 828130
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call us
              </h2>
              <p className="text-muted-foreground">
                <a href="tel:+919646562880" className="text-primary hover:underline">
                  +91 9646 56 2880
                </a>
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email us
              </h2>
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
              />
            </div>
          </div>
          
          {/* Right Column - Contact Form */}
          <div className="bg-card border rounded-lg p-6">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground mb-6">
                  Thank you for contacting us. We'll respond within 24 hours.
                </p>
                <Button onClick={() => setIsSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Send us a message</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiryType">Inquiry Type</Label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="travel">Travel Planning</option>
                    <option value="support">Customer Support</option>
                    <option value="booking">Booking Related</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to our Privacy Policy
                </p>
              </form>
            )}
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