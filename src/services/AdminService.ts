import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export interface AdminStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCategories: number;
    totalUsers: number;
    recentOrders: {
        id: string;
        total: number;
        status: Database['public']['Enums']['order_status'];
        created_at: string;
        user_id: string;
    }[];
    salesByMonth: {
        month: string;
        total: number;
    }[];
}

export const fetchAdminStats = async (): Promise<AdminStats> => {
    try {
        // Fetch total revenue and orders
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('total, created_at, status');

        if (ordersError) throw ordersError;

        // Calculate total revenue and orders
        const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = ordersData.length;

        // Fetch total products
        const { count: productsCount, error: productsError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        if (productsError) throw productsError;

        // Fetch total categories
        const { count: categoriesCount, error: categoriesError } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true });

        if (categoriesError) throw categoriesError;

        // Fetch total users (profiles)
        const { count: usersCount, error: usersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        // Fetch recent orders
        const { data: recentOrders, error: recentOrdersError } = await supabase
            .from('orders')
            .select('id, total, status, created_at, user_id')
            .order('created_at', { ascending: false })
            .limit(5);

        if (recentOrdersError) throw recentOrdersError;

        // Calculate sales by month
        const salesByMonth = ordersData.reduce((acc: { [key: string]: number }, order) => {
            const date = new Date(order.created_at);
            const monthKey = date.toLocaleString('default', { month: 'short' });
            acc[monthKey] = (acc[monthKey] || 0) + order.total;
            return acc;
        }, {});

        const salesByMonthArray = Object.entries(salesByMonth).map(([month, total]) => ({
            month,
            total
        }));

        return {
            totalRevenue,
            totalOrders,
            totalProducts: productsCount || 0,
            totalCategories: categoriesCount || 0,
            totalUsers: usersCount || 0,
            recentOrders: recentOrders || [],
            salesByMonth: salesByMonthArray
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        throw error;
    }
}; 