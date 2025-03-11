
import { Link, useLocation } from 'react-router-dom';
import { Package, List, ShoppingBag, Truck, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminSidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: BarChart 
    },
    { 
      name: 'Products', 
      path: '/admin/products', 
      icon: Package 
    },
    { 
      name: 'Categories', 
      path: '/admin/categories', 
      icon: List 
    },
    { 
      name: 'Orders', 
      path: '/admin/orders', 
      icon: ShoppingBag 
    },
    { 
      name: 'Supply Chain', 
      path: '/admin/supply-chain', 
      icon: Truck 
    }
  ];
  
  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-card rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
