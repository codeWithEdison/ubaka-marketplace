
import React, { useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, Package, Truck, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatCurrency } from '@/lib/utils';

interface OrderConfirmationState {
  orderReference: string;
  paymentMethod: 'credit_card' | 'mobile_money' | 'crypto' | 'stripe';
  transactionId?: string;
  transactionHash?: string;
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount?: number;
  shipping?: number;
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const OrderConfirmation = () => {
  const location = useLocation();
  const state = location.state as OrderConfirmationState | null;
  
  // If no order reference is provided, redirect to home
  if (!state || !state.orderReference) {
    return <Navigate to="/" replace />;
  }
  
  const { 
    orderReference, 
    paymentMethod, 
    transactionId, 
    transactionHash,
    items = [],
    totalAmount = 0,
    shipping = 0,
    customerInfo
  } = state;
  
  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'mobile_money':
        return 'Mobile Money';
      case 'crypto':
        return 'Cryptocurrency (ETH)';
      case 'stripe':
        return 'Stripe';
      default:
        return method;
    }
  };
  
  // Determine icon based on payment method
  const PaymentIcon = () => {
    switch (paymentMethod) {
      case 'credit_card':
      case 'stripe':
        return <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>;
      case 'mobile_money':
        return <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-blue-600" />
        </div>;
      case 'crypto':
        return <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <Clock className="h-6 w-6 text-purple-600" />
        </div>;
      default:
        return <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>;
    }
  };
  
  // Get status message based on payment method
  const getStatusMessage = () => {
    switch (paymentMethod) {
      case 'credit_card':
      case 'mobile_money':
      case 'stripe':
        return 'Payment confirmed';
      case 'crypto':
        return 'Transaction sent - awaiting blockchain confirmation';
      default:
        return 'Order received';
    }
  };
  
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-8">
            <PaymentIcon />
            <h1 className="text-3xl font-bold mt-4 mb-2">Thank You for Your Order!</h1>
            <p className="text-muted-foreground">
              {getStatusMessage()} • Order #{orderReference}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Order Status</h3>
                <div className="flex items-center text-green-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Processing</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <p>{formatPaymentMethod(paymentMethod)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Expected Delivery</h3>
                <p>2-5 business days</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Transaction Information</h3>
                  <div className="bg-muted p-4 rounded-md text-sm">
                    <p><span className="font-medium">Order Reference:</span> {orderReference}</p>
                    {transactionId && (
                      <p className="mt-1">
                        <span className="font-medium">Transaction ID:</span> {transactionId}
                      </p>
                    )}
                    {transactionHash && (
                      <p className="mt-1">
                        <span className="font-medium">Transaction Hash:</span> 
                        <span className="font-mono text-xs ml-1">
                          {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                
                {items && items.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Items</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <div className="space-y-2">
                        {items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                            </div>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>{formatCurrency(shipping)}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2">
                          <span>Total</span>
                          <span>{formatCurrency(totalAmount + shipping)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {customerInfo && (
                  <div>
                    <h3 className="font-medium mb-2">Customer Information</h3>
                    <div className="bg-muted p-4 rounded-md text-sm">
                      <p><span className="font-medium">Name:</span> {customerInfo.firstName} {customerInfo.lastName}</p>
                      <p className="mt-1"><span className="font-medium">Email:</span> {customerInfo.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Order Processing</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      We're preparing your items for shipping. You'll receive an email once your order is on its way.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Shipping</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Your order will be delivered within 2-5 business days. We'll provide tracking information via email.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button variant="outline" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
            <Link to="/account">
              <Button className="w-full sm:w-auto">
                Track Order
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default OrderConfirmation;
