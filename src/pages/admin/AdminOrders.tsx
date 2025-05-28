import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Eye,
  Download,
  Search,
  CheckCircle,
  Clock,
  Truck,
  PackageOpen,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/AdminSidebar';
import { useApiQuery } from '@/hooks/useApi';
import { fetchAllOrders, updateOrderStatus, fetchOrderById } from '@/services/OrderService';
import { toast } from 'sonner';
import { Order } from '@/lib/utils';
import { OrderStatus } from '@/types/database';
import { format } from 'date-fns';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isOrderDetailsLoading, setIsOrderDetailsLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchAllOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(
        orderId,
        newStatus,
        newStatus === 'shipped' ? trackingNumber : undefined
      );
      setOrders(orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ));
      setTrackingNumber('');
      toast.success('Order status updated successfully');

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="h-4 w-4 text-amber-500" />;
      case OrderStatus.PROCESSING:
        return <PackageOpen className="h-4 w-4 text-blue-500" />;
      case OrderStatus.SHIPPED:
        return <Truck className="h-4 w-4 text-indigo-500" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">{getStatusIcon(status)} Pending</Badge>;
      case OrderStatus.PROCESSING:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">{getStatusIcon(status)} Processing</Badge>;
      case OrderStatus.SHIPPED:
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">{getStatusIcon(status)} Shipped</Badge>;
      case OrderStatus.DELIVERED:
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{getStatusIcon(status)} Delivered</Badge>;
      case OrderStatus.CANCELLED:
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">{getStatusIcon(status)} Cancelled</Badge>;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return `RWF ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-center h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading orders...</span>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-center h-[50vh]">
              <span className="text-destructive">Error: {error}</span>
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
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Order Management</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 lg:col-span-3 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {orders?.filter(o => o.status === OrderStatus.PENDING).length || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <PackageOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Processing</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {orders?.filter(o => o.status === OrderStatus.PROCESSING).length || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-medium">Shipped</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {orders?.filter(o => o.status === OrderStatus.SHIPPED).length || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Delivered</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {orders?.filter(o => o.status === OrderStatus.DELIVERED).length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                    <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
                    <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                    <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orders Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <div>{`${order.user?.first_name || ''} ${order.user?.last_name || ''}`}</div>
                              <div className="text-sm text-muted-foreground">{order.user?.email || ''}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{typeof order.total_amount === 'number' && isFinite(order.total_amount) ? formatCurrency(order.total_amount) : 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog open={isViewDialogOpen && selectedOrder?.id === order.id} onOpenChange={async (open) => {
                                setIsViewDialogOpen(open);
                                if (open) {
                                  setSelectedOrder(null);
                                  setIsOrderDetailsLoading(true);
                                  try {
                                    const orderDetails = await fetchOrderById(order.id);
                                    setSelectedOrder(orderDetails);
                                  } catch (error) {
                                    console.error('Failed to fetch order details:', error);
                                    toast.error('Failed to load order details');
                                    setSelectedOrder(order);
                                  } finally {
                                    setIsOrderDetailsLoading(false);
                                  }
                                } else {
                                  setSelectedOrder(null);
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Order Details - {selectedOrder?.id || 'Loading...'}</DialogTitle>
                                  </DialogHeader>

                                  {isOrderDetailsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                      <span>Loading order details...</span>
                                    </div>
                                  ) : selectedOrder ? (
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer Details</h3>
                                          <p className="font-medium">{`${selectedOrder.user.first_name} ${selectedOrder.user.last_name}`}</p>
                                          <p>{selectedOrder.user.email}</p>
                                        </div>

                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Order Info</h3>
                                          <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.created_at)}</p>
                                          <p><span className="font-medium">Status:</span> {getStatusBadge(selectedOrder.status)}</p>
                                        </div>

                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Shipping Address</h3>
                                          {
                                            typeof selectedOrder.shipping_address === 'object' && selectedOrder.shipping_address !== null ? (
                                              <address className="not-italic">
                                                {(selectedOrder.shipping_address as any).fullName}<br />
                                                {(selectedOrder.shipping_address as any).addressLine1}<br />
                                                {(selectedOrder.shipping_address as any).addressLine2 && (<>{(selectedOrder.shipping_address as any).addressLine2}<br /></>)}
                                                {(selectedOrder.shipping_address as any).city}, {(selectedOrder.shipping_address as any).state} {(selectedOrder.shipping_address as any).postalCode}<br />
                                                {(selectedOrder.shipping_address as any).country}<br />
                                                Phone: {(selectedOrder.shipping_address as any).phone}
                                              </address>
                                            ) : (
                                              <p>{String(selectedOrder.shipping_address)}</p>
                                            )
                                          }
                                        </div>

                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Method</h3>
                                          <p>{selectedOrder.payment?.payment_method}</p>
                                        </div>
                                      </div>

                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h3>
                                        <div className="border rounded-md overflow-hidden">
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-right">Price</TableHead>
                                                <TableHead className="text-right">Quantity</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {selectedOrder.order_items && selectedOrder.order_items.map((item) => (
                                                <TableRow key={item.id}>
                                                  <TableCell>{item.products.name}</TableCell>
                                                  <TableCell className="text-right">{formatCurrency(item.price ?? 0)}</TableCell>
                                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                                  <TableCell className="text-right">{formatCurrency((item.price ?? 0) * item.quantity)}</TableCell>
                                                </TableRow>
                                              ))}
                                              <TableRow>
                                                <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                                                <TableCell className="text-right font-medium">{typeof selectedOrder?.total_amount === 'number' && isFinite(selectedOrder.total_amount) ? formatCurrency(selectedOrder.total_amount) : 'N/A'}</TableCell>
                                              </TableRow>
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </div>

                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Update Status</h3>
                                        <div className="flex flex-wrap gap-2">
                                          <Button
                                            variant={selectedOrder.status === OrderStatus.PENDING ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.PENDING)}
                                          >
                                            <Clock className="mr-2 h-4 w-4" />
                                            Pending
                                          </Button>
                                          <Button
                                            variant={selectedOrder.status === OrderStatus.PROCESSING ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.PROCESSING)}
                                          >
                                            <PackageOpen className="mr-2 h-4 w-4" />
                                            Processing
                                          </Button>
                                          <Button
                                            variant={selectedOrder.status === OrderStatus.SHIPPED ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.SHIPPED)}
                                          >
                                            <Truck className="mr-2 h-4 w-4" />
                                            Shipped
                                          </Button>
                                          <Button
                                            variant={selectedOrder.status === OrderStatus.DELIVERED ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.DELIVERED)}
                                          >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Delivered
                                          </Button>
                                          <Button
                                            variant={selectedOrder.status === OrderStatus.CANCELLED ? 'destructive' : 'outline'}
                                            size="sm"
                                            onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.CANCELLED)}
                                          >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Cancelled
                                          </Button>
                                        </div>
                                      </div>

                                      <div className="flex justify-between">
                                        <Button variant="outline">
                                          <Download className="mr-2 h-4 w-4" />
                                          Download Invoice
                                        </Button>
                                        <Button onClick={() => setIsViewDialogOpen(false)}>
                                          Close
                                        </Button>
                                      </div>
                                    </div>
                                  ) : null}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AdminOrders;
