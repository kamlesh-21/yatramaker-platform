// client/vite-project/src/pages/TermsOfService.tsx
import { Card, CardContent } from "@/components/ui/card";
import { FileText, AlertCircle, CheckCircle, Shield } from "lucide-react";
import BaseSEO from '@/components/BaseSEO';

const TermsOfService = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <>
      <BaseSEO
        title="Terms of Service - YatraMaker"
        description="Understand how YatraMaker helps you plan better trips and what you can expect from our travel planning service."
        canonicalUrl="https://yatramaker.com/terms"
        ogType="website"
      />
      
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4 text-foreground">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          {/* Important Notice */}
          <Card className="mb-8 border-amber-200 bg-amber-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-amber-800">Important Information</h3>
                  <p className="text-amber-700">
                    YatraMaker is a travel planning platform. We help you discover and plan trips. 
                    We&apos;re not a booking site, and we don&apos;t guarantee prices or availability. 
                    Our recommendations are based on the best available information at the time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="space-y-10">
                {/* What We Do */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">What YatraMaker Does</h2>
                  <p className="text-muted-foreground mb-4">
                    We help travelers like you discover destinations and plan trips that fit your budget, time, and preferences. 
                    Our service focuses on intelligent travel planning rather than simple destination listings.
                  </p>
                  <div className="bg-muted p-4 rounded-lg mt-4">
                    <p className="text-sm">
                      <span className="font-medium">Key Point:</span> We provide travel recommendations and planning assistance. 
                      You make the final decisions about where to go and how to book.
                    </p>
                  </div>
                </section>

                {/* Your Role */}
                <section>
                  <div className="flex items-start gap-4 mb-4">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Your Responsibilities as a Traveler</h3>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Provide accurate information for better recommendations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Verify final prices and availability before booking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Check travel requirements (visas, health, safety)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Make your own travel insurance arrangements</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* What We Provide */}
                <section>
                  <h3 className="text-xl font-semibold mb-3">What You Can Expect From Us</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold">We Provide</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Personalized travel recommendations</li>
                        <li>• Realistic cost estimates</li>
                        <li>• Optimized trip routes</li>
                        <li>• Activity and accommodation suggestions</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">We Don&apos;t Provide</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Price guarantees</li>
                        <li>• Booking services</li>
                        <li>• Travel insurance</li>
                        <li>• Visa assistance</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Cost Estimates */}
                <section>
                  <h3 className="text-xl font-semibold mb-3">About Our Cost Estimates</h3>
                  <p className="text-muted-foreground mb-3">
                    Our cost estimates are based on current average prices and our best judgment. 
                    Actual prices may vary due to:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Seasonal price changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Last-minute availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Currency fluctuations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Promotional offers</span>
                    </li>
                  </ul>
                </section>

                {/* Content Rights */}
                <section>
                  <h3 className="text-xl font-semibold mb-3">Content & Information</h3>
                  <p className="text-muted-foreground">
                    All destination information, recommendations, and planning tools on YatraMaker are provided 
                    to help you make better travel decisions. This content is for personal, non-commercial use only.
                  </p>
                </section>

                {/* Third Party Services */}
                <section>
                  <h3 className="text-xl font-semibold mb-3">Links to Other Services</h3>
                  <p className="text-muted-foreground">
                    We may suggest or link to third-party booking sites, accommodation providers, or activity operators. 
                    These are independent services with their own terms and privacy policies.
                  </p>
                </section>

                {/* Liability */}
                <section>
                  <div className="flex items-start gap-4">
                    <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Important Limitations</h3>
                      <p className="text-muted-foreground mb-3">
                        While we work hard to provide accurate and helpful travel information, we cannot guarantee:
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Exact pricing or availability</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>That every recommendation will be perfect for you</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Uninterrupted service or error-free recommendations</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Changes & Contact */}
                <section>
                  <h3 className="text-xl font-semibold mb-3">Changes & Contact</h3>
                  <p className="text-muted-foreground mb-4">
                    We may update these terms as our service evolves. The latest version will always be available here.
                  </p>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Questions about these terms?</span><br />
                      Email: info@yatramaker.com<br />
                      {/* Address: R: 175, Sri Ram Kunj, Phase 3, Nawadih, Dhanbad, Jharkhand - 828130 */}
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              <a href="https://yatramaker.com" className="hover:text-primary transition-colors">
                Visit YatraMaker
              </a> to discover destinations and plan trips that actually work for you
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;