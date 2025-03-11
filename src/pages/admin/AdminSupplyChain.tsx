
import { useState } from 'react';
import { Truck, Package, BarChart, AlertTriangle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/AdminSidebar';

// Mock supply chain data
const supplierData = [
  { id: 1, name: "Tech Components Inc.", reliability: 92, leadTime: 14, onTimeDelivery: 95, status: "active" },
  { id: 2, name: "Global Electronics Ltd.", reliability: 88, leadTime: 21, onTimeDelivery: 87, status: "active" },
  { id: 3, name: "Premium Parts Co.", reliability: 76, leadTime: 30, onTimeDelivery: 82, status: "warning" },
  { id: 4, name: "Innovative Supplies", reliability: 94, leadTime: 10, onTimeDelivery: 96, status: "active" },
  { id: 5, name: "Quality Manufacturing", reliability: 65, leadTime: 45, onTimeDelivery: 71, status: "critical" }
];

const shipmentData = [
  { id: "SHP-001", supplier: "Tech Components Inc.", items: 32, status: "delivered", date: "2023-09-15" },
  { id: "SHP-002", supplier: "Global Electronics Ltd.", items: 18, status: "in-transit", date: "2023-09-22" },
  { id: "SHP-003", supplier: "Premium Parts Co.", items: 45, status: "pending", date: "2023-09-30" },
  { id: "SHP-004", supplier: "Innovative Supplies", items: 12, status: "delivered", date: "2023-09-10" },
  { id: "SHP-005", supplier: "Quality Manufacturing", items: 27, status: "delayed", date: "2023-09-05" }
];

const inventoryData = [
  { id: "INV-001", name: "Smartphone X", stock: 45, threshold: 20, supplier: "Tech Components Inc." },
  { id: "INV-002", name: "Laptop Pro", stock: 18, threshold: 15, supplier: "Global Electronics Ltd." },
  { id: "INV-003", name: "Wireless Headphones", stock: 8, threshold: 25, supplier: "Premium Parts Co." },
  { id: "INV-004", name: "Smart Watch", stock: 32, threshold: 10, supplier: "Innovative Supplies" },
  { id: "INV-005", name: "Bluetooth Speaker", stock: 22, threshold: 15, supplier: "Quality Manufacturing" }
];

const AdminSupplyChain = () => {
  const [timeframe, setTimeframe] = useState('month');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return 'text-green-500';
      case 'warning':
      case 'in-transit':
      case 'pending':
        return 'text-amber-500';
      case 'critical':
      case 'delayed':
        return 'text-red-500';
      default:
        return 'text-slate-500';
    }
  };
  
  const getInventoryStatus = (stock: number, threshold: number) => {
    const percentage = (stock / threshold) * 100;
    if (percentage <= 50) return { color: 'bg-red-500', text: 'Low Stock' };
    if (percentage <= 100) return { color: 'bg-amber-500', text: 'Reorder Soon' };
    return { color: 'bg-green-500', text: 'Good Stock' };
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Supply Chain Management</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <AdminSidebar />
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-2 lg:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-semibold">Supply Chain Overview</h2>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Suppliers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{supplierData.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">5% increase from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Shipments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground mt-1">2 pending, 1 in transit</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Lead Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">18 days</div>
                    <p className="text-xs text-muted-foreground mt-1">10% improvement</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-500">2</div>
                    <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tabs for different views */}
              <Tabs defaultValue="suppliers" className="mt-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                  <TabsTrigger value="shipments">Shipments</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                </TabsList>
                
                {/* Suppliers Tab */}
                <TabsContent value="suppliers" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Supplier Performance</CardTitle>
                      <CardDescription>Manage and monitor your suppliers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {supplierData.map((supplier) => (
                          <div key={supplier.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-medium">{supplier.name}</h3>
                                <span className={`text-sm ${getStatusColor(supplier.status)}`}>
                                  {supplier.status === 'active' && 'Active'}
                                  {supplier.status === 'warning' && 'Warning'}
                                  {supplier.status === 'critical' && 'Critical'}
                                </span>
                              </div>
                              <Button variant="outline" size="sm">View Details</Button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Reliability</p>
                                <div className="flex items-center">
                                  <Progress value={supplier.reliability} className="h-2 mr-2" />
                                  <span className="text-sm">{supplier.reliability}%</span>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Lead Time</p>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span className="text-sm">{supplier.leadTime} days</span>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">On-Time Delivery</p>
                                <div className="flex items-center">
                                  <Progress value={supplier.onTimeDelivery} className="h-2 mr-2" />
                                  <span className="text-sm">{supplier.onTimeDelivery}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full sm:w-auto">
                        Add New Supplier
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Shipments Tab */}
                <TabsContent value="shipments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipment Tracking</CardTitle>
                      <CardDescription>Monitor incoming and outgoing shipments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-2">ID</th>
                              <th className="text-left py-3 px-2">Supplier</th>
                              <th className="text-left py-3 px-2">Items</th>
                              <th className="text-left py-3 px-2">Status</th>
                              <th className="text-left py-3 px-2">Expected Date</th>
                              <th className="text-left py-3 px-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shipmentData.map((shipment) => (
                              <tr key={shipment.id} className="border-b">
                                <td className="py-3 px-2">{shipment.id}</td>
                                <td className="py-3 px-2">{shipment.supplier}</td>
                                <td className="py-3 px-2">{shipment.items}</td>
                                <td className="py-3 px-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(shipment.status)}`}>
                                    {shipment.status}
                                  </span>
                                </td>
                                <td className="py-3 px-2">{shipment.date}</td>
                                <td className="py-3 px-2">
                                  <Button variant="ghost" size="sm">Details</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full sm:w-auto">
                        Create New Shipment
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Inventory Management</CardTitle>
                      <CardDescription>Track stock levels and reorder points</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {inventoryData.map((item) => {
                          const status = getInventoryStatus(item.stock, item.threshold);
                          return (
                            <div key={item.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium">{item.name}</h3>
                                  <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                                </div>
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs text-white ${status.color}`}>
                                    {status.text}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Current Stock</p>
                                  <div className="flex items-center">
                                    <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span className="text-sm">{item.stock} units</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Reorder Threshold</p>
                                  <div className="flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span className="text-sm">{item.threshold} units</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-3">
                                <p className="text-sm text-muted-foreground mb-1">Stock Level</p>
                                <Progress 
                                  value={(item.stock / item.threshold) * 100} 
                                  className="h-2" 
                                />
                              </div>
                              
                              <div className="mt-4 flex justify-end space-x-2">
                                <Button variant="outline" size="sm">Update Stock</Button>
                                <Button size="sm">Order More</Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full sm:w-auto">
                        Add New Inventory Item
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default AdminSupplyChain;
