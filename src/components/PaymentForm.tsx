import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { initiatePayment, FlutterwaveResponse } from '@/services/PaymentService';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const paymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  payment_type: z.enum(['card', 'mobilemoney']),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PaymentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 1000,
      email: '',
      name: '',
      payment_type: 'card',
      phone_number: '',
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      const tx_ref = `TX-${Date.now()}`;
      
      const response = await initiatePayment({
        amount: data.amount,
        currency: 'RWF',
        email: data.email,
        name: data.name,
        payment_type: data.payment_type,
        phone_number: data.phone_number,
        tx_ref,
      });

      if (response.status === 'success' && response.data.link) {
        // Store payment reference in session storage
        sessionStorage.setItem('payment_reference', tx_ref);
        // Redirect to Flutterwave payment page
        window.location.href = response.data.link;
      } else {
        throw new Error(response.message || 'Failed to initiate payment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your payment.';
      setError(errorMessage);
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (for mobile money)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., +2348012345678" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="mobilemoney">Mobile Money (MTN)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Processing...' : 'Pay Now'}
        </Button>
      </form>
    </Form>
  );
} 