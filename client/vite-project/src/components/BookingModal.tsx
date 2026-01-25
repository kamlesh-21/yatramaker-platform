// src/components/BookingModal.tsx - ENHANCED VERSION
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, Mail, Phone, MessageSquare, FileText, Check, CreditCard, QrCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";
// import UPI from "@assets/images/upi.jpeg"; // Placeholder UPI QR code image
// import UPI2 from "@assets/images/upi2.png"; // Placeholder UPI QR code image

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingData: any) => Promise<void>;
  packageDetails: {
    destination: string;
    totalCost: number;
    breakdown: any;
    travelMode: string;
  };
  userData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export function BookingModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  packageDetails,
  userData 
}: BookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    preferredContact: "whatsapp" as "whatsapp" | "email"
  });
  const [travelDates, setTravelDates] = useState({
    start: "",
    end: ""
  });
  
  // Commented out for Phase 1 - Enable in Phase 2
  const [paymentMethod, setPaymentMethod] = useState("later");
  const [showUPIQR, setShowUPIQR] = useState(false);
  
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    // Validate
    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all contact details",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const quoteData = {
        contactInfo,
        travelDates: travelDates.start && travelDates.end 
          ? { start: travelDates.start, end: travelDates.end }
          : undefined,
        // Commented for Phase 1
        paymentMethod,
        notes,
        ...packageDetails,
        type: "quote_request"
      };
      
      await onConfirm(quoteData);
      setIsSubmitted(true);
      
    } catch (error) {
      console.error("Quote request error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openWhatsApp = () => {
    const message = `Hi! I want a quote for ${packageDetails.destination} package for ₹${packageDetails.totalCost.toLocaleString()}. 
Priority: ${packageDetails.travelMode}
Name: ${contactInfo.name}
Email: ${contactInfo.email}
Phone: ${contactInfo.phone}
${travelDates.start ? `Dates: ${travelDates.start} - ${travelDates.end}` : 'Dates: Flexible'}
${notes ? `Notes: ${notes}` : ''}`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/YOUR_WHATSAPP_NUMBER?text=${encoded}`, '_blank');
    onClose();
  };

  // Commented for Phase 2 - UPI Payment Integration

  const initiateUPIPayment = () => {
    // This would open UPI payment
    setShowUPIQR(true);
    toast({
      title: "UPI QR Code",
      description: "Scan to pay ₹30 for custom package creation",
    });
  };


  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">✅ Quote Request Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              We've received your request for {packageDetails.destination}. 
              Our team will contact you within 24 hours.
            </p>
            <div className="space-y-3">
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const message = `Hi! I just requested a quote for ${packageDetails.destination}`;
                  window.open(`https://wa.me/YOUR_WHATSAPP_NUMBER?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="w-full"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Connect on WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="pr-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Get Your Custom Quote
            </DialogTitle>
            <DialogDescription>
              Complete details for {packageDetails.destination}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Package Summary */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-blue-800">Package Summary</h3>
                  <p className="text-sm text-blue-600 mt-1">
                    {packageDetails.destination} • ₹{packageDetails.totalCost.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-700">₹{packageDetails.totalCost.toLocaleString()}</div>
                  <p className="text-xs text-blue-600">Estimated Cost</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Contact Information *</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Preferred Contact Method</Label>
                <RadioGroup 
                  value={contactInfo.preferredContact}
                  onValueChange={(value: "whatsapp" | "email") => 
                    setContactInfo({...contactInfo, preferredContact: value})}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                    <Label htmlFor="whatsapp" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp (Fastest)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Travel Dates */}
            <div className="space-y-4">
              <h3 className="font-medium">Travel Dates (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">From</Label>
                  <Input 
                    id="start-date"
                    type="date"
                    value={travelDates.start}
                    onChange={(e) => setTravelDates({...travelDates, start: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">To</Label>
                  <Input 
                    id="end-date"
                    type="date"
                    value={travelDates.end}
                    onChange={(e) => setTravelDates({...travelDates, end: e.target.value})}
                    min={travelDates.start || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* PHASE 2 - UPI Payment Section (Commented) */}

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">✨ Optional: Get Custom Package for ₹30</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-amber-800 mb-1">Premium Package Creation</h4>
                    <p className="text-sm text-amber-700 mb-2">
                      Pay ₹30 to get a fully customized itinerary with exact prices, hotel options, and day-by-day schedule.
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 text-green-600" />
                        <span>Exact flight/train quotes</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 text-green-600" />
                        <span>3 hotel options with photos</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 text-green-600" />
                        <span>Day-by-day activity schedule</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {showUPIQR ? (
                  <div className="mt-4 text-center">
                    <div className="bg-white p-4 rounded-lg inline-block border">
                      <div className="w-48 h-48 bg-gray-100 flex items-center justify-center mb-2 mx-auto">
                        <QrCode className="h-32 w-32 text-gray-400" />
                        {/* Actual UPI QR would go here */}
                          <img
                            src="/assets/images/upi2.png"
                            alt="UPI QR"
                          />
                      </div>
                      <p className="text-sm font-medium">Scan to pay ₹30</p>
                      <p className="text-xs text-muted-foreground">9646562880-5@ybl</p>
                      {/* <p className="text-xs text-amber-700 mt-2">
                        After payment, share screenshot on WhatsApp 
                      </p> */}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={initiateUPIPayment}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      UPI QR Code
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: "Razorpay integration in progress",
                        });
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Online Payment
                    </Button>
                  </div>
                )}
              </div>
            </div>


            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Special Requests / Notes</Label>
              <textarea
                id="notes"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Any special requirements, dietary restrictions, room preferences, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={openWhatsApp}
              className="bg-green-50 text-green-700 hover:bg-green-100 border-green-300"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              WhatsApp Only
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !contactInfo.name || !contactInfo.email || !contactInfo.phone}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Sending..." : "Get Free Quote"}
            </Button>
          </DialogFooter>

          <div className="text-xs text-center text-muted-foreground pt-4 border-t">
            <p>✓ No payment required • Get exact quote • Best price guarantee</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}