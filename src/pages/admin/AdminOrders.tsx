
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
  XCircle
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

// Mock data for orders
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@example.com',
    date: '2023-05-15',
    status: 'delivered',
    total: 234.56,
    items: [
      { productId: 'p1', name: 'Premium Cement', price: 14.99, quantity: 10 },
      { productId: 'p3', name: 'Ceramic Floor Tiles', price: 2.49, quantity: 35 }
    ],
    shippingAddress: '123 Main St, City, State, 12345',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Doe',
    customerEmail: 'jane.doe@example.com',
    date: '2023-05-18',
    status: 'shipped',
    total: 89.95,
    items: [
      { productId: 'p2', name: 'Structural Steel Beams', price: 89.95, quantity: 1 }
    ],
    shippingAddress: '456 Oak Ave, Town, State, 67890',
    paymentMethod: 'PayPal'
  },
  {
    id: 'ORD-003',
    customerName: 'Robert Johnson',
    customerEmail: 'robert.j@example.com',
    date: '2023-05-20',
    status: 'processing',
    total: 165.92,
    items: [
      { productId: 'p4', name: 'Insulation Panels', price: 32.99, quantity: 5 }
    ],
    shippingAddress: '789 Pine St, Village, State, 13579',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'ORD-004',
    customerName: 'Emily Wilson',
    customerEmail: 'emily.w@example.com',
    date: '2023-05-21',
    status: 'pending',
    total: 75.50,
    items: [
      { productId: 'p5', name: 'Architectural Glass', price: 75.50, quantity: 1 }
    ],
    shippingAddress: '101 Cedar Rd, City, State, 24680',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ORD-005',
    customerName: 'Michael Brown',
    customerEmail: 'michael.b@example.com',
    date: '2023-05-19',
    status: 'cancelled',
    total: 129.99,
    items: [
      { productId: 'p8', name: 'Electrical Wiring Bundle', price: 129.99, quantity: 1 }
    ],
    shippingAddress: '202 Elm St, Town, State, 97531',
    paymentMethod: 'PayPal'
  }
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleUpdateStatus = (orderId: string, newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      )
    );
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'processing':
        return <PackageOpen className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">{getStatusIcon(status)} Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">{getStatusIcon(status)} Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">{getStatusIcon(status)} Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{getStatusIcon(status)} Delivered</Badge>;
      case 'cancelled':
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
                      {orders.filter(o => o.status === 'pending').length}
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
                      {orders.filter(o => o.status === 'processing').length}
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
                      {orders.filter(o => o.status === 'shipped').length}
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
                      {orders.filter(o => o.status === 'delivered').length}
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                              <div>{order.customerName}</div>
                              <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(order.date)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{formatCurrency(order.total)}</TableCell>
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
                                          <p className="font-medium">{selectedOrder.customerName}</p>
                                          <p>{selectedOrder.customerEmail}</p>
                                        </div>
                                        
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Order Info</h3>
                                          <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.date)}</p>
                                          <p><span className="font-medium">Status:</span> {getStatusBadge(selectedOrder.status)}</p>
                                        </div>
                                        
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Shipping Address</h3>
                                          <p>{selectedOrder.shippingAddress}</p>
                                        </div>
                                        
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Method</h3>
                                          <p>{selectedOrder.paymentMethod}</p>
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
                                              {selectedOrder.items.map((item) => (
                                                <TableRow key={item.productId}>
                                                  <TableCell>{item.name}</TableCell>
                                                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                                  <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                                                </TableRow>
                                              ))}
                                              <TableRow>
                                                <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(selectedOrder.total)}</TableCell>
                                              </TableRow>
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Update Status</h3>
                                        <div className="flex flex-wrap gap-2">
                                          <Button 
                                            variant={selectedOrder.status === 'pending' ? 'default' : 'outline'} 
                                            size="sm"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'pending')}
                                          >
                                            <Clock className="mr-2 h-4 w-4" />
                                            Pending
                                          </Button>
                                          <Button 
                                            variant={selectedOrder.status === 'processing' ? 'default' : 'outline'} 
                                            size="sm"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                                          >
                                            <PackageOpen className="mr-2 h-4 w-4" />
                                            Processing
                                          </Button>
                                          <Button 
                                            variant={selectedOrder.status === 'shipped' ? 'default' : 'outline'} 
                                            size="sm"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                                          >
                                            <Truck className="mr-2 h-4 w-4" />
                                            Shipped
                                          </Button>
                                          <Button 
                                            variant={selectedOrder.status === 'delivered' ? 'default' : 'outline'} 
                                            size="sm"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                                          >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Delivered
                                          </Button>
                                          <Button 
                                            variant={selectedOrder.status === 'cancelled' ? 'destructive' : 'outline'} 
                                            size="sm"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
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
