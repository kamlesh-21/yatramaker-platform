// client/vite-project/src/pages/Privacy.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, EyeOff, Mail } from "lucide-react";
import BaseSEO from '@/components/BaseSEO';

const Privacy = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <>
      <BaseSEO
        title="Privacy Policy - YatraMaker"
        description="Learn how YatraMaker protects your information and respects your privacy while helping you plan your perfect trip."
        canonicalUrl="https://yatramaker.com/privacy"
        ogType="website"
      />
      
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4 text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Introduction */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Your Privacy Matters to Us</h2>
                  <p className="text-muted-foreground">
                    At YatraMaker, we&apos;re travelers too. We understand that privacy is important, especially when planning your trips. 
                    This policy explains how we handle your information while helping you discover amazing destinations.
                  </p>
                </section>

                {/* Simple Explanation */}
                <section>
                  <div className="flex items-start gap-4 mb-4">
                    <Lock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">What We Need & Why</h3>
                      <p className="text-muted-foreground">
                        To create personalized travel recommendations, we ask for information like your budget, travel dates, 
                        and preferences. This helps us find trips that actually work for you.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Information Use */}
                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Information You Give Us</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Budget and travel preferences</li>
                        <li>• Trip duration and dates</li>
                        <li>• Traveler details (for accurate planning)</li>
                        <li>• Starting location</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">How We Use It</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• To find destinations that fit your budget</li>
                        <li>• To create realistic travel plans</li>
                        <li>• To estimate costs accurately</li>
                        <li>• To improve our recommendations</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Data Protection */}
                <section>
                  <div className="flex items-start gap-4 mb-4">
                    <EyeOff className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Your Information is Safe With Us</h3>
                      <p className="text-muted-foreground mb-3">
                        We take your privacy seriously. We don&apos;t sell your personal information to third parties, 
                        and we use industry-standard measures to protect your data.
                      </p>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Important:</span> We&apos;re a travel planning platform, not a booking site. 
                          We help you discover and plan trips, but we don&apos;t handle your bookings or payment information.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Cookies */}
                <section>
                  <h3 className="text-xl font-semibold mb-3">Cookies & Tracking</h3>
                  <p className="text-muted-foreground">
                    We use cookies to make the site work better for you - like remembering your preferences and 
                    improving our recommendations. You can control cookies through your browser settings.
                  </p>
                </section>

                {/* Children */}
                <section>
                  <h3 className="text-xl font-semibold mb-3">For Families</h3>
                  <p className="text-muted-foreground">
                    Our service is designed for travelers of all ages, but we don&apos;t knowingly collect information 
                    from children under 13 without parental consent.
                  </p>
                </section>

                {/* Contact */}
                <section>
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Questions About Privacy?</h3>
                      <p className="text-muted-foreground mb-3">
                        If you have any questions about how we handle your information, or if you want to know what 
                        information we have about you, just reach out.
                      </p>
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> info@yatramaker.com<br />
                          {/* <span className="font-medium">Address:</span> R: 175, Sri Ram Kunj, Phase 3, Nawadih, Dhanbad, Jharkhand - 828130 */}
                        </p>
                      </div>
                    </div>
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
              </a> to discover destinations that fit your budget and travel style
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;