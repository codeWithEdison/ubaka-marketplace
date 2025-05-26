import React from 'react';
import { PaymentForm } from '@/components/PaymentForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function TestPayment() {
  const isTestMode = import.meta.env.VITE_PAYMENT_TEST_MODE === 'true';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Payment Test Page</h1>
      
      {isTestMode && (
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Test Mode Active</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p>You are currently in test mode. Use these test credentials:</p>
              <div className="text-sm">
                <p><strong>Test Cards:</strong></p>
                <ul className="list-disc pl-4">
                  <li>Visa: 5531 8866 5214 2950</li>
                  <li>Mastercard: 5399 8383 8383 8381</li>
                  <li>American Express: 3714 4963 5398 431</li>
                </ul>
                <p className="mt-2"><strong>Test MTN Numbers:</strong></p>
                <ul className="list-disc pl-4">
                  <li>08012345678</li>
                  <li>08023456789</li>
                </ul>
                <p className="mt-2">Use any future expiry date, any 3-digit CVV, and any 4-digit PIN.</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <PaymentForm />
      </div>
    </div>
  );
} 