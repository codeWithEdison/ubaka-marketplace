import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Package, ArrowLeft, ArrowLeftRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderTracker, { Order } from '@/components/OrderTracker';
import ReturnItemForm from '@/components/order/ReturnItemForm';
import { mockOrders, formatCurrency } from '@/lib/utils';
import { canReturnOrder, getReturnRequestsForOrder, ReturnRequest } from '@/lib/returnUtils';

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [canReturn, setCanReturn] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const foundOrder = mockOrders.find(order => order.id === orderId);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (foundOrder) {
          setOrder(foundOrder);
          
          setCanReturn(canReturnOrder(foundOrder.status, foundOrder.date));
          
          setReturnRequests(getReturnRequestsForOrder(foundOrder.id));
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleReturnSuccess = () => {
    setShowReturnForm(false);
    
    if (order) {
      setReturnRequests(getReturnRequestsForOrder(order.id));
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link to="/account" className="inline-flex items-center text-primary hover:underline mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Link>
            
            <Card className="p-6 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
              <p className="text-muted-foreground mb-6">
                We couldn't find the order you're looking for.
              </p>
              <Link to="/account">
                <Button>Return to Your Account</Button>
              </Link>
            </Card>
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
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <Link to="/account" className="inline-flex items-center text-primary hover:underline mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Account
              </Link>
              <h1 className="text-3xl font-bold">Order #{order.id}</h1>
              <p className="text-muted-foreground">Placed on {order.date}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="text-xl font-medium">
                Total: {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          <OrderTracker order={order} />
          
          {showReturnForm ? (
            <div className="mb-6">
              <ReturnItemForm 
                order={order} 
                onSuccess={handleReturnSuccess}
                onCancel={() => setShowReturnForm(false)}
              />
            </div>
          ) : canReturn && (
            <div className="mb-6 p-4 bg-muted rounded-xl text-center">
              <p className="mb-2">
                Not satisfied with your purchase? You can return items within 30 days of delivery.
              </p>
              <Button onClick={() => setShowReturnForm(true)}>
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Request a Return
              </Button>
            </div>
          )}
          
          {returnRequests.length > 0 && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Return Requests</h2>
              <div className="space-y-4">
                {returnRequests.map(request => {
                  const item = order.items.find(item => item.id === request.productId);
                  
                  return (
                    <div key={request.id} className="p-4 border rounded-md">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{item?.name || 'Product'}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {request.quantity} • 
                            Reason: {request.reason.replace('_', ' ')}
                          </p>
                          {request.description && (
                            <p className="text-sm mt-1">{request.description}</p>
                          )}
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            Requested: {request.requestDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            
            <div className="space-y-4">
              {order.trackingNumber && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Tracking Information</h3>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="font-medium">Tracking Number: <span className="font-normal">{order.trackingNumber}</span></p>
                    {order.estimatedDelivery && (
                      <p className="font-medium mt-1">Estimated Delivery: <span className="font-normal">{order.estimatedDelivery}</span></p>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-sm mb-2">Items</h3>
                <div className="bg-muted p-4 rounded-md">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <p>{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-1">
                      <span>Total</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="flex justify-center">
            <Link to="/products">
              <Button>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderDetail;
