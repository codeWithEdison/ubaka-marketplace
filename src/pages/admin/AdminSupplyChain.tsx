import { useState, useEffect } from 'react';
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
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/AdminSidebar';
import {
  fetchSuppliers,
  fetchShipments,
  fetchInventory,
  Supplier,
  Shipment,
  InventoryItem
} from '@/services/SupplyChainService';

const AdminSupplyChain = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [suppliersData, shipmentsData, inventoryData] = await Promise.all([
        fetchSuppliers(),
        fetchShipments(),
        fetchInventory()
      ]);
      setSuppliers(suppliersData);
      setShipments(shipmentsData);
      setInventory(inventoryData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load supply chain data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
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

  const activeShipments = shipments.filter(s => s.status === 'in-transit' || s.status === 'pending');
  const lowStockItems = inventory.filter(item => item.stock <= item.threshold);
  const avgLeadTime = suppliers.reduce((acc, curr) => acc + curr.lead_time, 0) / suppliers.length;

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
                    <div className="text-2xl font-bold">{suppliers.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Active suppliers</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Shipments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeShipments.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {shipments.filter(s => s.status === 'pending').length} pending, {shipments.filter(s => s.status === 'in-transit').length} in transit
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Lead Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(avgLeadTime)} days</div>
                    <p className="text-xs text-muted-foreground mt-1">Average supplier lead time</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-500">{lowStockItems.length}</div>
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
                      {loading ? (
                        <div className="text-center py-8">Loading suppliers...</div>
                      ) : (
                        <div className="space-y-4">
                          {suppliers.map((supplier) => (
                            <div key={supplier.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-medium">{supplier.name}</h3>
                                  <span className={`text-sm ${getStatusColor(supplier.status)}`}>
                                    {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
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
                                    <span className="text-sm">{supplier.lead_time} days</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">On-Time Delivery</p>
                                  <div className="flex items-center">
                                    <Progress value={supplier.on_time_delivery} className="h-2 mr-2" />
                                    <span className="text-sm">{supplier.on_time_delivery}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                      {loading ? (
                        <div className="text-center py-8">Loading shipments...</div>
                      ) : (
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
                              {shipments.map((shipment) => (
                                <tr key={shipment.id} className="border-b">
                                  <td className="py-3 px-2">{shipment.id}</td>
                                  <td className="py-3 px-2">{shipment.supplier_name}</td>
                                  <td className="py-3 px-2">{shipment.items_count}</td>
                                  <td className="py-3 px-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(shipment.status)}`}>
                                      {shipment.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2">{new Date(shipment.expected_date).toLocaleDateString()}</td>
                                  <td className="py-3 px-2">
                                    <Button variant="ghost" size="sm">Details</Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
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
                      {loading ? (
                        <div className="text-center py-8">Loading inventory...</div>
                      ) : (
                        <div className="space-y-4">
                          {inventory.map((item) => {
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
                      )}
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
