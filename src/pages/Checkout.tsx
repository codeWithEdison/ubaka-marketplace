// src/pages/Checkout.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  Wallet, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ChevronRight,
  ExternalLink,
  Check
} from 'lucide-react';
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
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import * as PaymentServiceTypes from '@/services/PaymentService';
import { createOrder, finalizeOrderPayment } from '@/services/OrderService';
import { initiatePayment, PaymentDetails } from '@/services/PaymentService';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  saveInfo: boolean;
  // Card details
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  // Mobile Money details
  momoNumber: string;
  momoProvider: 'mtn' | 'airtel' | 'tigo';
  // Crypto details
  ethAddress: string;
}

interface CardErrors {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentServiceTypes.PaymentMethod>('credit_card');
  const [formData, setFormData] = useState<FormData>({
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
    momoProvider: 'mtn',
    // Crypto details
    ethAddress: '',
  });
  
  const [isPaymentProcessing, setIsPaymentProcessing] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | null>(null);
  const [paymentError, setPaymentError] = useState<string>('');
  const [orderReference, setOrderReference] = useState<string>('');
  
  const [cardErrors, setCardErrors] = useState<CardErrors>({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  
  const [momoVerificationCode, setMomoVerificationCode] = useState<string>('');
  const [momoVerificationSent, setMomoVerificationSent] = useState<boolean>(false);
  const [momoVerifying, setMomoVerifying] = useState<boolean>(false);
  
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [cryptoTransactionHash, setCryptoTransactionHash] = useState<string>('');
  const [ethNetwork, setEthNetwork] = useState<string | null>(null);
  const [cryptoPaymentStatus, setCryptoPaymentStatus] = useState<'success' | 'error' | null>(null);
  
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    
    return v;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      setFormData(prev => ({ ...prev, [name]: formatCardNumber(value) }));
    } else if (name === 'cardExpiry') {
      setFormData(prev => ({ ...prev, [name]: formatExpiryDate(value) }));
    } else if (name === 'cardCvc') {
      const cvcValue = value.replace(/[^0-9]/g, '').slice(0, 3);
      setFormData(prev => ({ ...prev, [name]: cvcValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Check for cancellation on load
  useEffect(() => {
    if (location.state?.paymentCancelled) {
      setPaymentError('Payment was cancelled.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);
  
  // Effect for checking MetaMask
  useEffect(() => {
    const checkMetaMask = async () => {
      setIsMetaMaskInstalled(typeof window.ethereum !== 'undefined');
      
      if (typeof window.ethereum !== 'undefined') {
         PaymentServiceTypes.default.getConnectedAccounts().then(walletInfo => {
          if (walletInfo.isConnected && walletInfo.address) {
            setIsConnected(true);
            setWalletAddress(walletInfo.address);
            if (walletInfo.network) {
              setEthNetwork(walletInfo.network);
            }
          }
         });
      }
    };
    
    checkMetaMask();
  }, []);
  
  // Effect for MetaMask event listeners
  useEffect(() => {
    if (!isMetaMaskInstalled) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } else {
        setIsConnected(false);
        setWalletAddress('');
      }
    };
    
    const handleChainChanged = async (chainId: string) => {
      const networkName = await PaymentServiceTypes.default.getConnectedAccounts();
      if (networkName.network) {
        setEthNetwork(networkName.network);
      }
    };
    
    const cleanup = PaymentServiceTypes.default.registerMetaMaskEvents(
      handleAccountsChanged,
      handleChainChanged
    );
    
    return cleanup;
  }, [isMetaMaskInstalled]);
  
  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      toast({
        title: "MetaMask is not installed",
        description: "Please install MetaMask browser extension to continue.",
        variant: "destructive"
      });
      return;
    }
    
    try {
       const result = await PaymentServiceTypes.default.connectMetaMaskWallet(); // Use PaymentServiceTypes.default

      if (result.success && result.address) {
        setWalletAddress(result.address);
        setIsConnected(true);
        
        if (result.network) {
          setEthNetwork(result.network);
        }
        
        toast({
          title: "Wallet connected",
          description: "Your MetaMask wallet has been connected successfully."
        });
      } else {
        throw new Error(result.error || "Failed to connect wallet");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect to MetaMask. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getOrderDetails = (): PaymentServiceTypes.OrderDetails => {
    const totalPrice = getTotalPrice();
    const shipping = totalPrice > 0 ? 4.99 : 0;
    
    return {
      totalAmount: totalPrice,
      shipping: shipping,
      items: items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.discount
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price
      })),
      customerInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      }
    };
  };
  
  const handleFiatPayment = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required contact and shipping details.",
        variant: "destructive"
      });
      return;
    }

    setIsPaymentProcessing(true);
    setPaymentError(null);

    try {
      const orderDetails = getOrderDetails();

      // Create the order in pending state before initiating payment
      const createdOrder = await createOrder(
        items,
        {
          fullName: `${formData.firstName} ${formData.lastName}`,
          addressLine1: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          country: formData.country,
          phone: formData.phoneNumber,
        },
        'flutterwave'
      );

      const tx_ref = `TX-${Date.now()}-${createdOrder.id}`;

      // Prepare the PaymentDetails object required by initiatePayment
      const paymentDetails: PaymentDetails = {
        amount: orderDetails.totalAmount,
        currency: 'RWF',
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        payment_type: 'card', // Default to card, but Flutterwave will show all options
        phone_number: formData.phoneNumber,
        tx_ref,
      };

      // Initiate Flutterwave payment
      await initiatePayment(paymentDetails);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while preparing payment.';
      setPaymentError(errorMessage);
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleCryptoPayment = async () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required contact and shipping details.",
        variant: "destructive"
      });
      return;
    }

    if (!isMetaMaskInstalled) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask browser extension to pay with cryptocurrency.",
        variant: "destructive"
      });
      return;
    }

    if (!isConnected || !walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your MetaMask wallet first.",
        variant: "destructive"
      });
      return;
    }

    if (!ethNetwork) {
      toast({
        title: "Network Error",
        description: "Unable to detect Ethereum network. Please check your MetaMask connection.",
        variant: "destructive"
      });
      return;
    }

    setIsPaymentProcessing(true);
    setCryptoPaymentStatus(null);
    setPaymentError('');

    try {
      const orderDetails = getOrderDetails();

      // Create the order in pending state before initiating payment
      const createdOrder = await createOrder(
        items,
        {
          fullName: `${formData.firstName} ${formData.lastName}`,
          addressLine1: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          country: formData.country,
          phone: formData.phoneNumber,
        },
        'crypto'
      );

      const result = await PaymentServiceTypes.default.processCryptoPayment(walletAddress, orderDetails);

      if (result.success) {
        setCryptoTransactionHash(result.transactionId || '');
        setCryptoPaymentStatus('success');
        setOrderReference(result.orderReference || '');

        toast({
          title: "Payment sent!",
          description: `Transaction has been submitted: ${result.transactionId?.slice(0, 10)}...${result.transactionId?.slice(-8)}`,
        });

        // Finalize the order payment on backend
        try {
          await finalizeOrderPayment(
            createdOrder.id,
            'crypto',
            undefined,
            result.transactionId
          );

          // Clear cart and navigate after successful finalization
          clearCart();
          navigate('/order-confirmation', {
            state: {
              orderId: createdOrder.id,
              paymentMethod: 'crypto',
              transactionHash: result.transactionId,
              orderReference: result.orderReference
            }
          });

        } catch (finalizeError) {
          console.error('Error finalizing crypto order on backend:', finalizeError);
          setCryptoPaymentStatus('error');
          setPaymentError(finalizeError instanceof Error ? finalizeError.message : 'An error occurred while finalizing your crypto order.');
          
          toast({
            title: "Order Update Failed",
            description: "Payment was sent but we couldn't update your order. Please contact support with your transaction hash.",
            variant: "destructive"
          });
        }

      } else {
        setCryptoPaymentStatus('error');
        setPaymentError(result.error || "Transaction failed. Please try again.");

        toast({
          title: "Payment failed",
          description: result.error || "Transaction failed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending payment:", error);
      setCryptoPaymentStatus('error');
      setPaymentError(error instanceof Error ? error.message : "An unexpected error occurred");

      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Transaction failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPaymentProcessing(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission is now handled by the Proceed to Payment button
  };
  
  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 0 ? 4.99 : 0;
  const orderTotal = totalPrice + shipping;
  
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
                    
                    <div className="space-y-4">
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertTitle>Choose Payment Method</AlertTitle>
                        <AlertDescription className="space-y-2">
                          <p>Select your preferred payment method:</p>
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Flutterwave Payment Option */}
  <div 
    className="group relative border-2 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
    onClick={handleFiatPayment}
  >
    <div className="flex items-start space-x-4">
      {/* Icon Container */}
      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <CreditCard className="h-6 w-6 text-primary" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">
          Pay with Card/Mobile Money
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Secure payment with your preferred method
        </p>
        
        {/* Payment Methods Logos */}
        <div className="flex items-center space-x-4">
          {/* Visa Logo */}
          <div className="flex items-center space-x-1">
            <img 
              src="https://cdn.worldvectorlogo.com/logos/visa-2.svg" 
              alt="Visa" 
              className="h-12  w-auto"
            />
          </div>
          
          {/* Mastercard Logo */}
          <div className="flex items-center space-x-1">
            <img 
              src="https://cdn.worldvectorlogo.com/logos/mastercard-6.svg" 
              alt="Mastercard" 
              className="h-12  w-auto"
            />
          </div>
          
          {/* MTN Mobile Money Logo */}
          <div className="flex items-center space-x-1">
            <img 
              src="https://images.seeklogo.com/logo-png/55/1/mtn-momo-mobile-money-uganda-logo-png_seeklogo-556395.png" 
              alt="MTN Mobile Money" 
              className="h-12  w-auto"
            />
            {/* <span className="text-xs text-gray-600 font-medium">MoMo</span> */}
          </div>
        </div>
      </div>
      
      {/* Arrow Indicator */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="h-5 w-5 text-primary" />
      </div>
    </div>
    
    {/* Hover Effect Overlay */}
    <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
  </div>

  {/* Crypto Payment Option */}
  <div 
    className={`group relative border-2 rounded-xl p-6 transition-all duration-300 bg-white ${
      !isMetaMaskInstalled 
        ? 'opacity-50 cursor-not-allowed border-gray-200' 
        : 'hover:border-primary hover:shadow-lg cursor-pointer'
    }`}
    onClick={!isMetaMaskInstalled ? undefined : !isConnected ? connectWallet : handleCryptoPayment}
  >
    <div className="flex items-start space-x-4">
      {/* Icon Container */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
        !isMetaMaskInstalled 
          ? 'bg-gray-100' 
          : isConnected 
            ? 'bg-green-100 group-hover:bg-green-200' 
            : 'bg-orange-100 group-hover:bg-orange-200'
      }`}>
        {!isMetaMaskInstalled ? (
          <Bitcoin className="h-6 w-6 text-gray-400" />
        ) : isConnected ? (
          <div className="relative">
            <Bitcoin className="h-6 w-6 text-green-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-2 w-2 text-white" />
            </div>
          </div>
        ) : (
          <Bitcoin className="h-6 w-6 text-orange-600" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-lg mb-1 ${
          !isMetaMaskInstalled ? 'text-gray-500' : 'text-gray-900'
        }`}>
          Pay with Crypto
        </h3>
        
        {/* Status Message */}
        <div className="mb-3">
          {!isMetaMaskInstalled ? (
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600 font-medium">MetaMask not installed</p>
            </div>
          ) : !isConnected ? (
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-orange-500" />
              <p className="text-sm text-orange-600 font-medium">Click to connect MetaMask</p>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-600 font-medium">Wallet Connected</p>
            </div>
          )}
        </div>
        
        {/* Wallet Address or Connection Info */}
        {isConnected ? (
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono text-gray-700">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        ) : !isMetaMaskInstalled ? (
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            <span>Install MetaMask</span>
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">
            Fast and secure blockchain payments
          </p>
        )}
      </div>
      
      {/* Arrow Indicator */}
      {isMetaMaskInstalled && (
        <div className={`flex-shrink-0 transition-opacity ${
          isConnected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <ChevronRight className="h-5 w-5 text-primary" />
        </div>
      )}
    </div>
    
    {/* Hover Effect Overlay */}
    {isMetaMaskInstalled && (
      <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    )}
  </div>
</div>
                      {paymentStatus === 'success' && (
                        <Alert className="bg-green-50 border-green-300">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-600">Payment Successful</AlertTitle>
                          <AlertDescription>
                            Payment processed successfully. Order reference: {orderReference}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {paymentStatus === 'error' && (
                        <Alert className="bg-red-50 border-red-300">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertTitle className="text-red-600">Payment Failed</AlertTitle>
                          <AlertDescription>
                            {paymentError || "There was an error processing your payment."}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Crypto Payment Status */}
                      {cryptoPaymentStatus === 'success' && (
                        <Alert className="bg-green-50 border-green-300">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-600">Transaction Sent</AlertTitle>
                          <AlertDescription>
                            <p>Transaction hash: {cryptoTransactionHash.slice(0, 10)}...{cryptoTransactionHash.slice(-8)}</p>
                            <p className="mt-1">Order reference: {orderReference}</p>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {cryptoPaymentStatus === 'error' && (
                        <Alert className="bg-red-50 border-red-300">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertTitle className="text-red-600">Transaction Failed</AlertTitle>
                          <AlertDescription>
                            {paymentError || "There was an error processing your transaction."}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
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
