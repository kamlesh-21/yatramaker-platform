// // client/vite-project/src/components/User/UserOnboarding.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Globe,
  DollarSign,
  MapPin,
  Users,
  Mountain,
  Building,
  Bed,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 1,
      title: "Welcome to YatraMaker!",
      description: "Your budget-first travel companion",
      icon: <Globe className="h-12 w-12" />,
      content: "We're excited to help you discover amazing destinations that perfectly fit your budget.",
      features: ["Budget-first planning", "Complete cost breakdown", "No hidden fees"]
    },
    {
      id: 2,
      title: "Set Your Budget",
      description: "Start with what you can spend",
      icon: <DollarSign className="h-12 w-12" />,
      content: "Tell us your budget and we'll show you what's possible. No surprises, just transparent pricing.",
      features: ["Enter any budget", "See complete costs", "Adjust anytime"]
    },
    {
      id: 3,
      title: "Choose Your Location",
      description: "Where are you starting from?",
      icon: <MapPin className="h-12 w-12" />,
      content: "Select your current location to get accurate travel times and costs.",
      features: ["Search any city", "Nearest airports", "Travel time estimates"]
    },
    {
      id: 4,
      title: "Travel Party",
      description: "How many are traveling?",
      icon: <Users className="h-12 w-12" />,
      content: "Specify adults, children, and infants for accurate accommodation and pricing.",
      features: ["Adult travelers", "Children (2-17)", "Infants (0-2)"]
    },
    {
      id: 5,
      title: "Trip Preferences",
      description: "What type of trip do you want?",
      icon: <Mountain className="h-12 w-12" />,
      content: "Choose your preferred destinations and travel style.",
      features: ["Mountains", "Beaches", "Cities", "Heritage", "Wildlife"]
    },
    {
      id: 6,
      title: "Accommodation Style",
      description: "Where do you want to stay?",
      icon: <Bed className="h-12 w-12" />,
      content: "Select your preferred level of comfort and amenities.",
      features: ["Budget friendly", "Comfort hotels", "Luxury resorts"]
    },
    {
      id: 7,
      title: "Trip Duration",
      description: "How long do you want to travel?",
      icon: <Calendar className="h-12 w-12" />,
      content: "Set your travel duration for complete itinerary planning.",
      features: ["Short getaways", "Week trips", "Extended vacations"]
    }
  ];

  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = () => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Get Started</span>
          </div>
          <h1 className="text-4xl font-bold">Plan Your Perfect Trip</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow these simple steps to discover destinations within your budget
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                {steps[step].icon}
              </div>
            </div>
            <CardTitle className="text-2xl">{steps[step].title}</CardTitle>
            <CardDescription className="text-lg">{steps[step].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground text-lg">
              {steps[step].content}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {steps[step].features.map((feature, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1">
                  {feature}
                </Badge>
              ))}
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 pt-6">
              {steps.map((s, idx) => (
                <div
                  key={s.id}
                  className={`h-2 w-8 rounded-full transition-all ${
                    idx <= step 
                      ? completedSteps.includes(idx) 
                        ? 'bg-green-500' 
                        : 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} disabled={step === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tour
              </Button>
            </div>
            
            <Button onClick={handleNext} size="lg">
              {step < steps.length - 1 ? (
                <>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Start Planning
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">₹20K+</div>
              <p className="text-muted-foreground">Average trip budget</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">200+</div>
              <p className="text-muted-foreground">Destinations in India</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">98%</div>
              <p className="text-muted-foreground">Happy travelers</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;