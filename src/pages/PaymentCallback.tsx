import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '@/services/PaymentService';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

export function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { removeItem } = useCart();

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        const transactionId = searchParams.get('transaction_id');
        const status = searchParams.get('status');

        if (status === 'successful') {
          removeItem('all');
          toast({
            title: 'Payment Successful',
            description: 'Your payment was successful. Redirecting to your orders...',
          });
          setIsVerifying(false);
          setVerificationStatus('success');
          setTimeout(() => {
            navigate('/account?tab=orders', { replace: true });
          }, 2000);
        } else if (status === 'cancelled') {
          navigate('/checkout', { state: { paymentCancelled: true } });
          return;
        }

        if (!transactionId) {
          throw new Error('No transaction ID found');
        }

        const response = await verifyPayment(transactionId);

        if (response.status === 'success') {
          setVerificationStatus('success');
          toast({
            title: 'Payment Successful',
            description: 'Your payment has been processed successfully.',
          });
          setTimeout(() => {
            navigate('/order-confirmation', {
              state: {
                transactionId,
                status: 'success'
              }
            });
          }, 2000);
        } else {
          throw new Error(response.message || 'Payment verification failed');
        }
      } catch (error) {
        setVerificationStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'There was an error verifying your payment.');
        toast({
          title: 'Payment Error',
          description: error instanceof Error ? error.message : 'There was an error verifying your payment.',
          variant: 'destructive',
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyTransaction();
  }, [searchParams, navigate, toast, removeItem]);

  if (isVerifying) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Verifying Payment</h2>
              <p>Please wait while we verify your payment...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center py-12">
            {verificationStatus === 'success' ? (
              <Alert className="bg-green-50 border-green-300 mb-6">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Payment Successful</AlertTitle>
                <AlertDescription>
                  Your payment has been processed successfully. Redirecting to order confirmation...
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert className="bg-red-50 border-red-300 mb-6">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-600">Payment Error</AlertTitle>
                  <AlertDescription>
                    {errorMessage}
                  </AlertDescription>
                </Alert>
                <div className="space-x-4">
                  <Button onClick={() => navigate('/checkout')}>
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Return Home
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 