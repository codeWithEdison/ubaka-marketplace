
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    products: [
      { name: 'Building Materials', href: '/categories/c1' },
      { name: 'Structural Components', href: '/categories/c2' },
      { name: 'Flooring', href: '/categories/c3' },
      { name: 'Insulation', href: '/categories/c4' },
      { name: 'Windows & Doors', href: '/categories/c5' },
    ],
    services: [
      { name: 'Delivery', href: '/services/delivery' },
      { name: 'Installation', href: '/services/installation' },
      { name: 'Consultation', href: '/services/consultation' },
      { name: 'Project Management', href: '/services/project-management' },
      { name: 'Material Estimation', href: '/services/material-estimation' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' },
      { name: 'Partners', href: '/partners' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Shipping Policy', href: '/shipping' },
      { name: 'Return Policy', href: '/returns' },
      { name: 'FAQ', href: '/faq' },
    ],
  };
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Subscription logic would go here
  };

  return (
    <footer className="bg-ubaka-50 dark:bg-ubaka-900 border-t border-border">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="inline-block mb-6">
              <span className="font-bold text-2xl text-ubaka-900 dark:text-white">UBAKA</span>
            </Link>
            
            <p className="text-muted-foreground mb-6 max-w-xs">
              Premium construction materials and supplies for professionals and DIY enthusiasts.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@ubaka.com</span>
              </div>
              
              <div className="flex items-center space-x-3 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>123 Construction Ave, Building City, BC 10101</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Products</h3>
              <ul className="space-y-2">
                {footerLinks.products.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Services</h3>
              <ul className="space-y-2">
                {footerLinks.services.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* More Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Subscribe to our newsletter</h3>
            <p className="text-muted-foreground mb-4">
              Get the latest news and special offers.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex items-center">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
                <Button 
                  type="submit"
                  className="rounded-l-none"
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                By subscribing, you agree to our Privacy Policy and consent to receive marketing communications.
              </p>
            </form>
            
            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-3">Follow us</h3>
              <div className="flex space-x-4">
                <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Youtube className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Ubaka Inc. All rights reserved.
            </p>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Link 
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link 
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link 
                to="/cookies"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
