
import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import paymentService, { OrderDetails } from '@/services/PaymentService';

interface StripePaymentProps {
  orderDetails: OrderDetails;
  onSuccess: (result: {
    success: boolean;
    orderReference: string;
    transactionId?: string;
  }) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

const StripePayment: React.FC<StripePaymentProps> = ({
  orderDetails,
  onSuccess,
  isProcessing,
  setIsProcessing
}) => {
  const { toast } = useToast();
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Initialize Stripe
  useEffect(() => {
    let mounted = true;
    
    const initStripe = async () => {
      try {
        setIsLoading(true);
        const { stripe, elements, cardElement } = await paymentService.initializeStripeElements();
        
        if (!mounted) return;
        
        setStripe(stripe);
        setElements(elements);
        setCardElement(cardElement);
        
        // Mount card element
        cardElement.mount('#stripe-card-element');
        
        // Listen to changes
        cardElement.on('change', (event: any) => {
          setCardComplete(event.complete);
          setError(event.error ? event.error.message : null);
        });
        
      } catch (error) {
        if (!mounted) return;
        console.error('Failed to initialize Stripe:', error);
        setError(error instanceof Error ? error.message : 'Failed to load payment form');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    initStripe();
    
    return () => {
      mounted = false;
      // Unmount card element if it exists
      if (cardElement) {
        cardElement.unmount();
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!stripe || !cardElement || !cardComplete) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = await paymentService.processStripePayment(stripe, cardElement, orderDetails);
      
      if (result.success) {
        onSuccess(result);
      } else {
        setError(result.error || 'Payment failed. Please try again.');
        
        toast({
          title: "Payment failed",
          description: result.error || "Your payment couldn't be processed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error && !cardElement ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading payment form</AlertTitle>
          <AlertDescription>
            {error}. Please refresh the page or try a different payment method.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="stripe-card-element">Card Details</Label>
            <div 
              id="stripe-card-element" 
              className="border border-input bg-background px-3 py-2 h-10 rounded-md"
            >
              {/* Stripe Card Element will be mounted here */}
            </div>
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
          
          <Button 
            type="button"
            className="w-full"
            disabled={isProcessing || !cardComplete}
            onClick={handleSubmit}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default StripePayment;
