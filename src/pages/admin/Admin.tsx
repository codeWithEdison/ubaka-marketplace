import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, List, ShoppingBag, Truck, ArrowUpRight, DollarSign, Users, Loader2 } from 'lucide-react';
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
import { fetchAdminStats, AdminStats } from '@/services/AdminService';
import { formatCurrency } from '@/lib/utils';

const Admin = () => {
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Filter sales data based on date range
  const getFilteredSalesData = () => {
    if (!stats?.salesByMonth) return [];

    const now = new Date();
    const months = stats.salesByMonth;

    switch (dateRange) {
      case 'day':
        // Show last 7 days
        return months.slice(-7);
      case 'week':
        // Show last 4 weeks
        return months.slice(-4);
      case 'month':
        // Show last 6 months
        return months.slice(-6);
      case 'year':
        // Show all months
        return months;
      default:
        return months;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-center h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
              <p className="text-muted-foreground">{error}</p>
              <Button
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
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
                        <h3 className="text-2xl font-bold mt-1">
                          {formatCurrency(stats?.totalRevenue || 0)}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          From {stats?.totalOrders || 0} orders
                        </p>
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
                          {stats?.totalProducts || 0}
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
                          {stats?.totalCategories || 0}
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
                        <p className="text-sm font-medium text-muted-foreground">Users</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {stats?.totalUsers || 0}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Total registered users</p>
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
                      <CardDescription>Sales revenue for the selected period</CardDescription>
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
                      <BarChart data={getFilteredSalesData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                          formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                        />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest 5 orders from your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.total)}</p>
                          <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                        </div>
                      </div>
                    ))}
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
