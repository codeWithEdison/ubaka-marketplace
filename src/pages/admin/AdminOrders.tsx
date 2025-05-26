import { useState } from 'react';
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
import { fetchAllOrders, updateOrderStatus } from '@/services/OrderService';
import { toast } from 'sonner';
import { OrderStatus, Order as DatabaseOrder, OrderItem as DatabaseOrderItem, Payment } from '@/types/database';

interface OrderItem extends Omit<DatabaseOrderItem, 'order' | 'product'> {
  products: {
    id: string;
    name: string;
  };
}

interface Order {
  id: string;
  user_id: string;
  total: number;
  total_amount: number;
  status: OrderStatus;
  shipping_address: string;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
    };
  }[];
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  payment: {
    id: string;
    payment_method: string;
    status: string;
  };
}

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const { data: orders, isLoading, refetch } = useApiQuery<Order[]>(
    ['admin-orders'],
    () => fetchAllOrders()
  );
  
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.user.first_name} ${order.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      refetch(); // Refresh the orders list
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
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
    return `$${amount.toFixed(2)}`;
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
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
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <div>{`${order.user.first_name} ${order.user.last_name}`}</div>
                              <div className="text-sm text-muted-foreground">{order.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog open={isViewDialogOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                                setIsViewDialogOpen(open);
                                if (open) setSelectedOrder(order);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Order Details - {order.id}</DialogTitle>
                                  </DialogHeader>
                                  
                                  {selectedOrder && (
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
                                          <p>{selectedOrder.shipping_address}</p>
                                        </div>
                                        
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Method</h3>
                                          <p>{selectedOrder.payment.payment_method}</p>
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
                                              {selectedOrder.order_items.map((item) => (
                                                <TableRow key={item.id}>
                                                  <TableCell>{item.products.name}</TableCell>
                                                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                                  <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                                                </TableRow>
                                              ))}
                                              <TableRow>
                                                <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(selectedOrder.total_amount)}</TableCell>
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
                                            onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.PENDING)}
                                          >
                                            <Clock className="mr-2 h-4 w-4" />
                                            Pending
                                          </Button>
                                          <Button 
                                            variant={selectedOrder.status === OrderStatus.PROCESSING ? 'default' : 'outline'} 
                                            size="sm"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.PROCESSING)}
                                          >
                                            <PackageOpen className="mr-2 h-4 w-4" />
                                            Processing
                                          </Button>
                                          <Button 
                                            variant={selectedOrder.status === OrderStatus.SHIPPED ? 'default' : 'outline'} 
                                            size="sm"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.SHIPPED)}
                                          >
                                            <Truck className="mr-2 h-4 w-4" />
                                            Shipped
                                          </Button>
                                          <Button 
                                            variant={selectedOrder.status === OrderStatus.DELIVERED ? 'default' : 'outline'} 
                                            size="sm"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.DELIVERED)}
                                          >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Delivered
                                          </Button>
                                          <Button 
                                            variant={selectedOrder.status === OrderStatus.CANCELLED ? 'destructive' : 'outline'} 
                                            size="sm"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.CANCELLED)}
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
                                  )}
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
