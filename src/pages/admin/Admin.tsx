import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, List, ShoppingBag, Truck, ArrowUpRight, DollarSign, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/AdminSidebar';
import { fetchCategories } from '@/services/CategoryService';
import { fetchProducts } from '@/services/ProductService';

const salesData = [
  { name: 'Jan', total: 1234 },
  { name: 'Feb', total: 2342 },
  { name: 'Mar', total: 3463 },
  { name: 'Apr', total: 2878 },
  { name: 'May', total: 3904 },
  { name: 'Jun', total: 4532 },
  { name: 'Jul', total: 4332 },
  { name: 'Aug', total: 5214 },
  { name: 'Sep', total: 4685 },
  { name: 'Oct', total: 5120 },
  { name: 'Nov', total: 6543 },
  { name: 'Dec', total: 7654 },
];

const Admin = () => {
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [categories, productsData] = await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);
        
        setStats({
          products: productsData.count,
          categories: categories.length,
          loading: false,
          error: null
        });
      } catch (err) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load stats'
        }));
      }
    };

    loadStats();
  }, []);

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <AdminSidebar />
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-2 lg:col-span-3 space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                        <h3 className="text-2xl font-bold mt-1">$45,231.89</h3>
                        <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Products</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {stats.loading ? '...' : stats.products}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Total products</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Categories</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {stats.loading ? '...' : stats.categories}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Total categories</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <List className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                        <h3 className="text-2xl font-bold mt-1">573</h3>
                        <p className="text-xs text-muted-foreground mt-1">+201 since last week</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sales Overview</CardTitle>
                      <CardDescription>Daily sales revenue for the current year</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant={dateRange === 'day' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setDateRange('day')}
                      >
                        Day
                      </Button>
                      <Button 
                        variant={dateRange === 'week' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setDateRange('week')}
                      >
                        Week
                      </Button>
                      <Button 
                        variant={dateRange === 'month' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setDateRange('month')}
                      >
                        Month
                      </Button>
                      <Button 
                        variant={dateRange === 'year' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setDateRange('year')}
                      >
                        Year
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis 
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Revenue']}
                        />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <Link to="/admin/products">
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-4">
                            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-medium">Manage Products</h3>
                            <p className="text-sm text-muted-foreground">Add, edit or remove products</p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/admin/categories">
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full mr-4">
                            <List className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-medium">Manage Categories</h3>
                            <p className="text-sm text-muted-foreground">Organize your product categories</p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/admin/orders">
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full mr-4">
                            <ShoppingBag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h3 className="font-medium">Orders</h3>
                            <p className="text-sm text-muted-foreground">Track and manage customer orders</p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/admin/supply-chain">
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full mr-4">
                            <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-medium">Supply Chain</h3>
                            <p className="text-sm text-muted-foreground">Manage inventory and suppliers</p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Admin;
