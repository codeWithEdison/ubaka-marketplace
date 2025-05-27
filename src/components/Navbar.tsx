import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogIn, LogOut, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotalItems } = useCart();
  const { user, signOut, profile, isAdmin } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Search initiated",
      description: `Searching for: ${searchQuery}`,
    });
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    });
  };
  
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Categories", path: "/categories" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Calculate cart item count
  const cartItemCount = getTotalItems ? getTotalItems() : 0;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-ubaka-950/80 shadow-subtle backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <span className="font-bold text-2xl text-ubaka-900 dark:text-white">
              UBAKA
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={`text-ubaka-700 dark:text-white/80 hover:text-ubaka-900 dark:hover:text-white transition-all ${
                  location.pathname === link.path ? 'font-medium' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Search, Cart, and User (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-40 lg:w-56 pr-8 h-9 bg-secondary border-none transition-all focus:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'My Account'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="w-full cursor-pointer">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account?tab=orders" className="w-full cursor-pointer">Orders</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth/sign-in">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <ShoppingCart className="h-5 w-5" />
                {items && items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <ShoppingCart className="h-5 w-5" />
                {items && items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <Button
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="rounded-full"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-[400px] opacity-100 visible' 
            : 'max-h-0 opacity-0 invisible'
        }`}
      >
        <div className="container mx-auto px-4 py-4 bg-background dark:bg-ubaka-900 shadow-md">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pr-8 h-9 bg-secondary border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>
          
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={`px-2 py-1.5 rounded-md transition-colors ${
                  location.pathname === link.path 
                    ? 'bg-secondary text-ubaka-900 dark:text-white font-medium' 
                    : 'text-ubaka-700 dark:text-white/80 hover:bg-secondary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link
                  to="/account"
                  className="px-2 py-1.5 rounded-md transition-colors flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>My Account</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-2 py-1.5 rounded-md transition-colors flex items-center space-x-2 w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
                {/* Show Admin link if user has admin role */}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="px-2 py-1.5 rounded-md transition-colors text-ubaka-700 dark:text-white/80 hover:bg-secondary"
                  >
                    Administration
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/auth/sign-in"
                className="px-2 py-1.5 rounded-md transition-colors flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
