// client/vite-project/src/pages/FAQ.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, HelpCircle, Wallet, MapPin, Users, Clock } from "lucide-react";
import BaseSEO from '@/components/BaseSEO';

const FAQ = () => {
  const faqs = [
    {
      question: "How do you find destinations that actually work for my budget?",
      answer: "We start with your exact budget and only show destinations where the total trip cost - including travel, accommodation, food, and activities - realistically fits. If we can't make it work within your budget, we won't suggest it.",
      icon: Wallet
    },
    {
      question: "Are your multi-city trip plans actually doable?",
      answer: "Yes. We don't just list cities - we create optimized routes with realistic travel times, balanced days at each destination, and cost-effective connections. Each multi-city plan is built to work in the real world.",
      icon: MapPin
    },
    {
      question: "How do you handle different types of travelers (families, solo, couples)?",
      answer: "Our system adjusts recommendations based on traveler composition. For families, we factor in child-friendly activities and accommodations. For solo travelers, we consider safety and social opportunities. All recommendations are tailored to who's traveling.",
      icon: Users
    },
    {
      question: "What if I'm not sure about my travel dates?",
      answer: "That's fine. You can start with flexible dates, and we'll show you options. Our system can even suggest the best times to travel based on your preferences and budget considerations.",
      icon: Clock
    },
    {
      question: "Do I have to book through your platform?",
      answer: "No, you're never required to book through us. We provide detailed plans and cost breakdowns - you can use this information to book however you prefer, or take your time to think about it.",
      icon: HelpCircle
    },
    {
      question: "How accurate are your cost estimates?",
      answer: "Our estimates are based on current average costs for each category (travel, accommodation, meals, activities). While actual prices may vary slightly, our estimates give you a realistic picture of what to expect. We're transparent about what's included.",
      icon: Wallet
    },
    {
      question: "What makes your single-destination trips different?",
      answer: "We focus on creating meaningful, immersive experiences rather than generic tourist checklists. Each single-destination plan is designed to help you truly experience a place, not just visit it.",
      icon: MapPin
    }
  ];

  return (
    <>
      <BaseSEO
        title="FAQ - YatraMaker | Frequently Asked Questions"
        description="Get answers to common questions about how YatraMaker helps you discover and plan trips that actually work for your budget and preferences."
        canonicalUrl="https://yatramaker.com/faq"
        ogImage="https://yatramaker.com/assets/ogimage3.jpg"
        ogType="website"
      />
      
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Common Questions</h1>
            <p className="text-xl text-muted-foreground">
              Answers to the questions travelers ask us most often
            </p>
          </div>

          {/* FAQ Accordion */}
          <Card className="mb-12 border-2">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => {
                  const Icon = faq.icon;
                  return (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="font-semibold">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pl-8">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="mb-12 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Still have questions?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Our team is here to help you with any questions about travel planning or using our platform.
              </p>
              <Button asChild variant="outline">
                <a href="mailto:info@yatramaker.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Footer CTA */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Ready to discover trips that actually work for you?
            </p>
            <Button asChild>
              <a href="https://yatramaker.com">
                Start Your Travel Discovery
              </a>
            </Button>
            <div className="mt-8 text-sm text-muted-foreground">
              <a href="https://yatramaker.com" className="hover:text-primary transition-colors">
                Visit YatraMaker
              </a> to find destinations that fit your budget and preferences
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;