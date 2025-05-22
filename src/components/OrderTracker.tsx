import React from "react";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/components/account/statusUtils";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface OrderTrackerProps {
  order: Order;
}

const getStatusPercentage = (status: OrderStatus): number => {
  switch (status) {
    case "pending":
      return 0;
    case "processing":
      return 25;
    case "shipped":
      return 50;
    case "delivered":
      return 100;
    case "cancelled":
      return 0;
    default:
      return 0;
  }
};

const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return "Unknown";
  }
};

const OrderTracker: React.FC<OrderTrackerProps> = ({ order }) => {
  const statusPercentage = getStatusPercentage(order.status);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <CardDescription>Placed on {order.date}</CardDescription>
          </div>
          <div className="mt-2 md:mt-0 text-sm">
            <span className="font-medium">Total: {formatCurrency(order.total)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Order Status Tracker */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Order Status</span>
              <span>{getStatusLabel(order.status)}</span>
            </div>
            <Progress value={statusPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>Pending</span>
              <span>Processing</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="text-sm space-y-1">
              <p className="font-medium">Tracking Number</p>
              <p className="font-mono">{order.trackingNumber}</p>
              {order.estimatedDelivery && (
                <p className="text-muted-foreground">
                  Estimated delivery: {order.estimatedDelivery}
                </p>
              )}
            </div>
          )}

          {/* Status Icons */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className={`flex flex-col items-center ${order.status === "pending" || statusPercentage >= 0 ? "text-primary" : "text-muted-foreground"}`}>
              <Clock className="mb-1 h-5 w-5" />
              <span>Pending</span>
            </div>
            <div className={`flex flex-col items-center ${order.status === "processing" || statusPercentage >= 25 ? "text-primary" : "text-muted-foreground"}`}>
              <Package className="mb-1 h-5 w-5" />
              <span>Processing</span>
            </div>
            <div className={`flex flex-col items-center ${order.status === "shipped" || statusPercentage >= 50 ? "text-primary" : "text-muted-foreground"}`}>
              <Truck className="mb-1 h-5 w-5" />
              <span>Shipped</span>
            </div>
            <div className={`flex flex-col items-center ${order.status === "delivered" || statusPercentage >= 100 ? "text-primary" : "text-muted-foreground"}`}>
              <CheckCircle className="mb-1 h-5 w-5" />
              <span>Delivered</span>
            </div>
          </div>

          {/* Order Items List */}
          <div className="space-y-2">
            <p className="font-medium text-sm">Items</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTracker;
