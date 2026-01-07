// client/vite-project/src/pages/AboutUs.tsx
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Target, 
  MapPin, 
  Wallet, 
  Clock, 
  Users, 
  Sparkles,
  CheckCircle,
  Route,
  Compass
} from "lucide-react";
import BaseSEO from '@/components/BaseSEO';

const AboutUs = () => {
  return (
    <>
      <BaseSEO
        title="About YatraMaker - Intelligent Travel Planning"
        description="YatraMaker helps you discover real trips that actually work for your budget and time. We're not just another travel site - we're your intelligent travel planning partner."
        canonicalUrl="https://yatramaker.com/about"
        ogImage="https://yatramaker.com/assets/ogimage4.jpg"
        schemaType="AboutPage"
        keywords="travel planning, budget travel, trip discovery, intelligent travel, travel recommendations"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-30 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Easy Travel Planning for all
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We help travelers discover meaningful trips that actually work within their budget, time, and preferences.
            </p>
          </div>

          {/* Core Philosophy */}
          <Card className="mb-12 border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Our Travel Philosophy</h2>
                <p className="text-lg text-muted-foreground">
                  We believe travel planning should be about discovery, not frustration
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-lg bg-background border">
                  <Compass className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Feasibility First</h3>
                  <p className="text-muted-foreground">
                    Every recommendation must work in the real world, not just look good on paper
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-lg bg-background border">
                  <Wallet className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Budget Clarity</h3>
                  <p className="text-muted-foreground">
                    Start with what you can spend, not with unrealistic destinations
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-lg bg-background border">
                  <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Meaningful Travel</h3>
                  <p className="text-muted-foreground">
                    Focus on experiences that matter, not just checking boxes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Makes Us Different */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-10">Why Travelers Choose YatraMaker</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Problem Solving */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-primary" />
                    Solving Real Travel Problems
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-medium">&quot;I don't know where I can actually go&quot;</span>
                        <p className="text-sm text-muted-foreground mt-1">We show you realistic options based on your exact situation</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-medium">&quot;Online itineraries never work in reality&quot;</span>
                        <p className="text-sm text-muted-foreground mt-1">Our plans are built with real-world travel constraints in mind</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-medium">&quot;Multi-city trips are impossible to plan&quot;</span>
                        <p className="text-sm text-muted-foreground mt-1">We handle the routing, timing, and budgeting for complex trips</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Right Column - Trip Types */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <Route className="h-6 w-6 text-primary" />
                    Two Ways to Travel
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                      <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        Single-Destination Trips
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Perfect when you want to deeply explore one amazing place. We optimize for immersion and meaningful experiences.
                      </p>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Ideal for: Relaxed holidays • First-time visitors • Short to medium trips
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-500" />
                        Multi-Destination Trips
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        When you want to cover multiple places efficiently. We handle the routing, timing, and logistics between destinations.
                      </p>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Ideal for: Regional exploration • Repeat travelers • Longer vacations
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How It Works - Simplified */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">How YatraMaker Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Tell Us About You", desc: "Your budget, time, and preferences" },
                { step: "2", title: "We Find Real Options", desc: "Destinations that actually work for you" },
                { step: "3", title: "Get Complete Plans", desc: "Travel, stay, activities - all in one" },
                { step: "4", title: "Travel with Confidence", desc: "Everything planned, nothing overlooked" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust & Transparency */}
          <Card className="mb-12 border-2">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Transparency You Can Trust</h3>
                  <p className="text-muted-foreground mb-4">
                    We show you exactly how your budget is allocated - travel, accommodation, activities, and local expenses. No hidden costs, no unrealistic promises.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-black-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Real cost breakdowns</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-black-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Only feasible recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-black-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>No pressure to book</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <div className="mb-6">
              <p className="text-lg text-muted-foreground mb-4">
                Ready to discover trips that actually work for you?
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80">
                <Link to="/">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Your Travel Discovery
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              <a href="https://yatramaker.com" className="hover:text-primary transition-colors">
                YatraMaker
              </a>: Intelligent travel planning for real-world travelers
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;