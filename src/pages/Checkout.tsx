
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ChevronsUpDown, Check, Smartphone, Bitcoin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'RW',
    saveInfo: true,
    // Card details
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    // Mobile Money details
    momoNumber: '',
    // Crypto details
    ethAddress: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you'd handle payment processing here
    
    // Show success message
    toast({
      title: "Order placed successfully!",
      description: "Your order has been placed and will be shipped soon.",
    });
    
    // Clear cart
    clearCart();
    
    // Redirect to home page
    navigate('/');
  };
  
  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 0 ? 4.99 : 0;
  const orderTotal = totalPrice + shipping;
  
  // Check if cart is empty and redirect to cart page if it is
  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
              <p className="mb-6 text-muted-foreground">Add some items to your cart before checking out.</p>
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
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
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <Link to="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="bg-card rounded-xl shadow-sm overflow-hidden mb-6">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          name="firstName" 
                          value={formData.firstName} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          name="lastName" 
                          value={formData.lastName} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input 
                          id="phoneNumber" 
                          name="phoneNumber" 
                          type="tel" 
                          value={formData.phoneNumber} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl shadow-sm overflow-hidden mb-6">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input 
                          id="address" 
                          name="address" 
                          value={formData.address} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city" 
                            name="city" 
                            value={formData.city} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="state">Province</Label>
                          <Input 
                            id="state" 
                            name="state" 
                            value={formData.state} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Postal Code</Label>
                          <Input 
                            id="zipCode" 
                            name="zipCode" 
                            value={formData.zipCode} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select
                            value={formData.country}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="RW">Rwanda</SelectItem>
                              <SelectItem value="UG">Uganda</SelectItem>
                              <SelectItem value="KE">Kenya</SelectItem>
                              <SelectItem value="TZ">Tanzania</SelectItem>
                              <SelectItem value="CD">DR Congo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="saveInfo" 
                          checked={formData.saveInfo} 
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, saveInfo: checked === true }))
                          } 
                        />
                        <label 
                          htmlFor="saveInfo" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Save this information for next time
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl shadow-sm overflow-hidden mb-6">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                    
                    <Tabs defaultValue="credit_card" onValueChange={setPaymentMethod} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="credit_card" className="flex items-center">
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Credit Card</span>
                          <span className="sm:hidden">Card</span>
                        </TabsTrigger>
                        <TabsTrigger value="mobile_money" className="flex items-center">
                          <Smartphone className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Mobile Money</span>
                          <span className="sm:hidden">MoMo</span>
                        </TabsTrigger>
                        <TabsTrigger value="crypto" className="flex items-center">
                          <Bitcoin className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Ethereum</span>
                          <span className="sm:hidden">ETH</span>
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="credit_card" className="pt-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input 
                              id="cardNumber" 
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              placeholder="1234 5678 9012 3456" 
                              required={paymentMethod === 'credit_card'} 
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cardExpiry">Expiry Date</Label>
                              <Input 
                                id="cardExpiry" 
                                name="cardExpiry"
                                value={formData.cardExpiry}
                                onChange={handleInputChange}
                                placeholder="MM/YY" 
                                required={paymentMethod === 'credit_card'} 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="cardCvc">CVC</Label>
                              <Input 
                                id="cardCvc" 
                                name="cardCvc"
                                value={formData.cardCvc}
                                onChange={handleInputChange}
                                placeholder="123" 
                                required={paymentMethod === 'credit_card'} 
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="mobile_money" className="pt-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="momoNumber">Mobile Money Number</Label>
                            <Input 
                              id="momoNumber" 
                              name="momoNumber"
                              value={formData.momoNumber}
                              onChange={handleInputChange}
                              placeholder="078XXXXXXX" 
                              required={paymentMethod === 'mobile_money'} 
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            You will receive a payment prompt on your MTN Mobile Money number.
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="crypto" className="pt-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="ethAddress">Your Ethereum Address (Optional)</Label>
                            <Input 
                              id="ethAddress" 
                              name="ethAddress"
                              value={formData.ethAddress}
                              onChange={handleInputChange}
                              placeholder="0x..." 
                            />
                          </div>
                          <div className="p-4 rounded-md bg-muted">
                            <p className="font-medium mb-2">Send ETH payment to:</p>
                            <p className="text-xs break-all font-mono">0x742d35Cc6634C0532925a3b844Bc454e4438f44e</p>
                            <p className="text-sm mt-2">Amount: {(orderTotal / 3500000).toFixed(6)} ETH</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Please use the order number as reference in your transaction.
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                
                <Button type="submit" className="w-full md:w-auto">
                  {paymentMethod === 'credit_card' && <CreditCard className="mr-2 h-4 w-4" />}
                  {paymentMethod === 'mobile_money' && <Smartphone className="mr-2 h-4 w-4" />}
                  {paymentMethod === 'crypto' && <Bitcoin className="mr-2 h-4 w-4" />}
                  Place Order
                </Button>
              </form>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl shadow-sm overflow-hidden sticky top-24">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    {items.map((item) => {
                      const { product, quantity } = item;
                      const price = product.discount
                        ? product.price * (1 - product.discount / 100)
                        : product.price;
                      
                      return (
                        <div key={product.id} className="flex justify-between">
                          <div className="flex items-center">
                            <span className="font-medium text-sm">
                              {product.name} 
                              <span className="text-muted-foreground ml-1">x{quantity}</span>
                            </span>
                          </div>
                          <span className="text-sm">{formatCurrency(price * quantity)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatCurrency(shipping)}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(orderTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Checkout;
