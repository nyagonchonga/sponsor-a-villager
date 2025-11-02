import { useEffect, useState } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/navigation";
import { ArrowLeft, Heart, CreditCard, Check } from "lucide-react";
import type { Villager } from "@shared/schema";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ villager, sponsorshipType, componentType, amount }: {
  villager: Villager;
  sponsorshipType: string;
  componentType?: string | null;
  amount: number;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/sponsor-portal`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: `Thank you for sponsoring ${villager.name}!`,
      });
      navigate("/sponsor-portal");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-payment">
      <PaymentElement data-testid="payment-element" />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full bg-kenya-red hover:bg-red-700" 
        size="lg"
        data-testid="button-complete-payment"
      >
        {isProcessing ? (
          <div className="flex items-center">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing...
          </div>
        ) : (
          <div className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Complete Payment - KSh {amount.toLocaleString()}
          </div>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const villagerId = urlParams.get('villager');
  const sponsorshipType = urlParams.get('type') || 'full';
  const componentType = urlParams.get('component');
  const customAmount = urlParams.get('amount');

  const { data: villager, isLoading: villagerLoading } = useQuery<Villager>({
    queryKey: ["/api/villagers", villagerId],
    enabled: !!villagerId,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to sponsor a villager.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Calculate amount based on sponsorship type
  const getAmount = () => {
    if (customAmount) return parseInt(customAmount);
    
    if (sponsorshipType === 'full') return 48000;
    
    if (sponsorshipType === 'partial' && componentType) {
      const componentPrices = {
        training: 8000,
        transport: 2000,
        housing: 8000,
        bike: 30000,
      };
      return componentPrices[componentType as keyof typeof componentPrices] || 8000;
    }
    
    return 8000; // Default partial amount
  };

  const amount = getAmount();

  useEffect(() => {
    if (!villagerId || !villager || !isAuthenticated) return;

    // Create PaymentIntent as soon as we have all required data
    apiRequest("POST", "/api/create-payment-intent", {
      amount,
      villagerId,
      sponsorshipType,
      componentType: componentType || 'full'
    })
    .then((res) => res.json())
    .then((data) => {
      setClientSecret(data.clientSecret);
    })
    .catch((error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    });
  }, [villagerId, villager, amount, sponsorshipType, componentType, isAuthenticated, toast]);

  if (authLoading || villagerLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!villager || !villagerId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Request</h1>
              <p className="text-gray-600 mb-4">Please select a villager to sponsor.</p>
              <Button onClick={() => navigate("/")} data-testid="button-go-back">
                Browse Villagers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Preparing your sponsorship...</p>
          </div>
        </div>
      </div>
    );
  }

  const getSponsorshipTitle = () => {
    if (sponsorshipType === 'full') return 'Full Sponsorship';
    if (sponsorshipType === 'group') return 'Group Sponsorship';
    if (componentType) {
      const titles = {
        training: 'Training & Licensing',
        transport: 'Transport Support',
        housing: 'Housing Support',
        bike: 'Bike Deposit',
      };
      return titles[componentType as keyof typeof titles] || 'Partial Sponsorship';
    }
    return 'Partial Sponsorship';
  };

  const getSponsorshipDescription = () => {
    if (sponsorshipType === 'full') {
      return 'Complete support for the entire program including training, housing, transport, and bike deposit.';
    }
    if (componentType) {
      const descriptions = {
        training: 'NTSA motorcycle training and licensing fees.',
        transport: 'Transportation costs from rural area to Nairobi.',
        housing: 'Shared housing accommodation for 2 months in Nairobi.',
        bike: 'Electric bike deposit and orientation costs.',
      };
      return descriptions[componentType as keyof typeof descriptions] || 'Partial program support.';
    }
    return 'Partial support for specific aspects of the program.';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/villager/${villagerId}`)} 
          className="mb-6"
          data-testid="button-back-to-villager"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {villager.name}
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Villager Summary */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-kenya-red" />
                  Sponsoring {villager.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={villager.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                    alt={villager.name}
                    className="w-16 h-16 object-cover rounded-full"
                    data-testid="img-villager-avatar"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900" data-testid="text-villager-name">
                      {villager.name}
                    </h3>
                    <p className="text-gray-600" data-testid="text-villager-info">
                      {villager.age} years old • {villager.location}
                    </p>
                    <Badge variant="secondary" data-testid="badge-villager-status">
                      {villager.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-700" data-testid="text-villager-story">
                  {villager.story}
                </p>
              </CardContent>
            </Card>

            {/* Program Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-kenya-green rounded-full flex items-center justify-center mr-3">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm">Sustainable livelihood creation</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-kenya-green rounded-full flex items-center justify-center mr-3">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm">Clean mobility promotion</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-kenya-green rounded-full flex items-center justify-center mr-3">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm">Rural poverty reduction</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-kenya-green rounded-full flex items-center justify-center mr-3">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm">Community empowerment</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Sponsorship</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid="text-sponsorship-title">
                    {getSponsorshipTitle()}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4" data-testid="text-sponsorship-description">
                    {getSponsorshipDescription()}
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Sponsorship Amount</span>
                      <span className="text-2xl font-bold text-kenya-red" data-testid="text-amount">
                        KSh {amount.toLocaleString()}
                      </span>
                    </div>
                    
                    {sponsorshipType === 'full' && (
                      <div className="text-xs text-gray-500 space-y-1 mt-3">
                        <div className="flex justify-between">
                          <span>Training & Licensing:</span>
                          <span>KSh 8,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transport:</span>
                          <span>KSh 2,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Housing (2 months):</span>
                          <span>KSh 8,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bike Deposit:</span>
                          <span>KSh 30,000</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="mb-6" />

                {/* Payment Form */}
                {stripePromise ? (
                  <>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm 
                        villager={villager} 
                        sponsorshipType={sponsorshipType}
                        componentType={componentType}
                        amount={amount}
                      />
                    </Elements>

                    <div className="mt-6 text-center">
                      <p className="text-xs text-gray-500">
                        Payments are processed securely by Stripe. You will receive updates on {villager.name}'s progress.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8" data-testid="stripe-not-configured">
                    <p className="text-gray-600 mb-4">
                      Payment processing is currently not configured.
                    </p>
                    <p className="text-sm text-gray-500">
                      Please contact the administrator to set up Stripe payments.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
