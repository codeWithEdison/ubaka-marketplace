// src/pages/Checkout.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  Wallet, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ChevronRight
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
import paymentService, { 
  PaymentMethod, 
  CreditCardData, 
  MobileMoneyData,
  OrderDetails
} from '@/services/PaymentService';

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
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
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
  
  // Payment processing states
  const [isPaymentProcessing, setIsPaymentProcessing] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | null>(null);
  const [paymentError, setPaymentError] = useState<string>('');
  const [orderReference, setOrderReference] = useState<string>('');
  
  // Credit card validation states
  const [cardErrors, setCardErrors] = useState<CardErrors>({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  
  // Mobile money states
  const [momoVerificationCode, setMomoVerificationCode] = useState<string>('');
  const [momoVerificationSent, setMomoVerificationSent] = useState<boolean>(false);
  const [momoVerifying, setMomoVerifying] = useState<boolean>(false);
  
  // MetaMask states
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [cryptoTransactionHash, setCryptoTransactionHash] = useState<string>('');
  const [ethNetwork, setEthNetwork] = useState<string | null>(null);
  
  // Format card number with spaces
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
  
  // Format card expiry date
  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    
    return v;
  };
  
  // Handle input change with formatting for card fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      setFormData(prev => ({ ...prev, [name]: formatCardNumber(value) }));
    } else if (name === 'cardExpiry') {
      setFormData(prev => ({ ...prev, [name]: formatExpiryDate(value) }));
    } else if (name === 'cardCvc') {
      // Only allow numbers and max 3 digits
      const cvcValue = value.replace(/[^0-9]/g, '').slice(0, 3);
      setFormData(prev => ({ ...prev, [name]: cvcValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Check if MetaMask is installed on page load
  useEffect(() => {
    const checkMetaMask = async () => {
      setIsMetaMaskInstalled(typeof window.ethereum !== 'undefined');
      
      if (typeof window.ethereum !== 'undefined') {
        const walletInfo = await paymentService.getConnectedAccounts();
        
        if (walletInfo.isConnected && walletInfo.address) {
          setIsConnected(true);
          setWalletAddress(walletInfo.address);
          if (walletInfo.network) {
            setEthNetwork(walletInfo.network);
          }
        }
      }
    };
    
    checkMetaMask();
  }, []);
  
  // Set up MetaMask event listeners
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
      const networkName = await paymentService.getConnectedAccounts();
      if (networkName.network) {
        setEthNetwork(networkName.network);
      }
    };
    
    // Register events and get cleanup function
    const cleanup = paymentService.registerMetaMaskEvents(
      handleAccountsChanged,
      handleChainChanged
    );
    
    return cleanup;
  }, [isMetaMaskInstalled]);
  
  // Connect to MetaMask
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
      const result = await paymentService.connectMetaMaskWallet();
      
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
  
  // Get order details for payment processing
  const getOrderDetails = (): OrderDetails => {
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
  
  // Process credit card payment
  const processCreditCardPayment = async () => {
    // Validate fields manually (as a backup to the PaymentService validation)
    const cardNumberCleaned = formData.cardNumber.replace(/\s+/g, '');
    const errors = {
      cardNumber: !cardNumberCleaned || !/^\d{16}$/.test(cardNumberCleaned) ? 'Card number must be 16 digits' : '',
      cardExpiry: !formData.cardExpiry || !/^\d{2}\/\d{2}$/.test(formData.cardExpiry) ? 'Expiry must be in MM/YY format' : '',
      cardCvc: !formData.cardCvc || !/^\d{3}$/.test(formData.cardCvc) ? 'CVC must be 3 digits' : '',
    };
    
    setCardErrors(errors);
    
    if (errors.cardNumber || errors.cardExpiry || errors.cardCvc) {
      return;
    }
    
    setIsPaymentProcessing(true);
    setPaymentStatus(null);
    
    try {
      const cardData: CreditCardData = {
        cardNumber: formData.cardNumber,
        cardExpiry: formData.cardExpiry,
        cardCvc: formData.cardCvc
      };
      
      const orderDetails = getOrderDetails();
      const result = await paymentService.processCardPayment(cardData, orderDetails);
      
      if (result.success) {
        setOrderReference(result.orderReference);
        setPaymentStatus('success');
        
        // Clear cart and redirect after a short delay
        setTimeout(() => {
          clearCart();
          navigate('/order-confirmation', { 
            state: { 
              orderReference: result.orderReference,
              paymentMethod: 'credit_card',
              transactionId: result.transactionId
            } 
          });
        }, 1500);
      } else {
        setPaymentStatus('error');
        setPaymentError(result.error || 'Transaction failed. Please try a different payment method.');
      }
    } catch (error) {
      setPaymentStatus('error');
      setPaymentError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsPaymentProcessing(false);
    }
  };
  
  // Process mobile money payment
  const processMobileMoneyPayment = async () => {
    if (!formData.momoNumber) {
      toast({
        title: "Mobile number required",
        description: "Please enter your mobile money number",
        variant: "destructive"
      });
      return;
    }
    
    setIsPaymentProcessing(true);
    
    try {
      const mobileData: MobileMoneyData = {
        momoNumber: formData.momoNumber,
        momoProvider: formData.momoProvider
      };
      
      const orderDetails = getOrderDetails();
      const result = await paymentService.sendMobileMoneyVerification(mobileData, orderDetails);
      
      if (result.success) {
        setMomoVerificationSent(true);
        
        toast({
          title: "Verification code sent",
          description: `A verification code has been sent to ${formData.momoNumber}`,
        });
      } else {
        toast({
          title: "Failed to send code",
          description: result.error || "Unable to send verification code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to send code",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsPaymentProcessing(false);
    }
  };
  
  // Verify mobile money code
  const verifyMomoCode = async () => {
    if (!momoVerificationCode) {
      toast({
        title: "Verification code required",
        description: "Please enter the verification code sent to your phone",
        variant: "destructive"
      });
      return;
    }
    
    setMomoVerifying(true);
    
    try {
      const mobileData: MobileMoneyData = {
        momoNumber: formData.momoNumber,
        momoProvider: formData.momoProvider
      };
      
      const orderDetails = getOrderDetails();
      const result = await paymentService.verifyMobileMoneyPayment(
        momoVerificationCode,
        mobileData,
        orderDetails
      );
      
      if (result.success) {
        setOrderReference(result.orderReference);
        setPaymentStatus('success');
        
        // Clear cart and redirect after a short delay
        setTimeout(() => {
          clearCart();
          navigate('/order-confirmation', { 
            state: { 
              orderReference: result.orderReference,
              paymentMethod: 'mobile_money',
              transactionId: result.transactionId
            } 
          });
        }, 1500);
      } else {
        setPaymentStatus('error');
        setPaymentError(result.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setPaymentStatus('error');
      setPaymentError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setMomoVerifying(false);
    }
  };
  
  // Send ETH payment via MetaMask
  const sendCryptoPayment = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your MetaMask wallet first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsPaymentProcessing(true);
    setPaymentStatus(null);
    
    try {
      const orderDetails = getOrderDetails();
      const result = await paymentService.processCryptoPayment(walletAddress, orderDetails);
      
      if (result.success) {
        setOrderReference(result.orderReference);
        setCryptoTransactionHash(result.transactionId || '');
        setPaymentStatus('success');
        
        toast({
          title: "Payment sent!",
          description: `Transaction has been submitted: ${result.transactionId?.slice(0, 10)}...${result.transactionId?.slice(-8)}`,
        });
        
        // Handle successful order after a short delay
        setTimeout(() => {
          clearCart();
          navigate('/order-confirmation', { 
            state: { 
              orderReference: result.orderReference,
              paymentMethod: 'crypto',
              transactionHash: result.transactionId
            } 
          });
        }, 1500);
      } else {
        setPaymentStatus('error');
        setPaymentError(result.error || "Transaction failed. Please try again.");
        
        toast({
          title: "Payment failed",
          description: result.error || "Transaction failed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending payment:", error);
      setPaymentStatus('error');
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
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process payment based on selected method
    switch (paymentMethod) {
      case 'credit_card':
        processCreditCardPayment();
        break;
        
      case 'mobile_money':
        if (!momoVerificationSent) {
          processMobileMoneyPayment();
        } else {
          verifyMomoCode();
        }
        break;
        
      case 'crypto':
        if (isMetaMaskInstalled && isConnected) {
          sendCryptoPayment();
        } else if (isMetaMaskInstalled) {
          // If MetaMask is installed but not connected
          connectWallet();
        } else {
          // Handle manual crypto payment (show instructions)
          toast({
            title: "MetaMask not installed",
            description: "Please install MetaMask browser extension to pay with Ethereum.",
            variant: "destructive"
          });
        }
        break;
        
      default:
        toast({
          title: "Payment method not supported",
          description: "Please select a different payment method",
          variant: "destructive"
        });
    }
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
                    
                    <Tabs defaultValue="credit_card" onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} className="w-full">
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
                              className={cardErrors.cardNumber ? "border-red-500" : ""}
                            />
                            {cardErrors.cardNumber && (
                              <p className="text-sm text-red-500 mt-1">{cardErrors.cardNumber}</p>
                            )}
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
                                className={cardErrors.cardExpiry ? "border-red-500" : ""} 
                              />
                              {cardErrors.cardExpiry && (
                                <p className="text-sm text-red-500 mt-1">{cardErrors.cardExpiry}</p>
                              )}
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
                                className={cardErrors.cardCvc ? "border-red-500" : ""} 
                              />
                              {cardErrors.cardCvc && (
                                <p className="text-sm text-red-500 mt-1">{cardErrors.cardCvc}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Payment status messages */}
                          {paymentMethod === 'credit_card' && paymentStatus === 'success' && (
                            <Alert className="bg-green-50 border-green-300">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <AlertTitle className="text-green-600">Payment Successful</AlertTitle>
                              <AlertDescription>
                                Payment processed successfully. Order reference: {orderReference}
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {paymentMethod === 'credit_card' && paymentStatus === 'error' && (
                            <Alert className="bg-red-50 border-red-300">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <AlertTitle className="text-red-600">Payment Failed</AlertTitle>
                              <AlertDescription>
                                {paymentError || "There was an error processing your payment."}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="mobile_money" className="pt-4">
                        <div className="space-y-4">
                          {!momoVerificationSent ? (
                            <>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                <Label htmlFor="momoProvider">Provider</Label>
                                  <Select
                                    value={formData.momoProvider}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, momoProvider: value as 'mtn' | 'airtel' | 'tigo' }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                                      <SelectItem value="airtel">Airtel Money</SelectItem>
                                      <SelectItem value="tigo">Tigo Cash</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
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
                                  You will receive a verification code on your mobile number.
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Alert className="bg-blue-50 border-blue-200">
                                <AlertTitle>Verification Code Sent</AlertTitle>
                                <AlertDescription>
                                  A verification code has been sent to {formData.momoNumber}
                                </AlertDescription>
                              </Alert>
                              
                              <div className="space-y-2 mt-4">
                                <Label htmlFor="verificationCode">Verification Code</Label>
                                <Input 
                                  id="verificationCode" 
                                  value={momoVerificationCode}
                                  onChange={(e) => setMomoVerificationCode(e.target.value)}
                                  placeholder="Enter code" 
                                  required
                                />
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  onClick={() => setMomoVerificationSent(false)}
                                >
                                  Change Number
                                </Button>
                                
                                <Button 
                                  type="button"
                                  onClick={verifyMomoCode}
                                  disabled={momoVerifying || !momoVerificationCode}
                                >
                                  {momoVerifying ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    'Verify & Pay'
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                          
                          {/* Payment status messages */}
                          {paymentMethod === 'mobile_money' && paymentStatus === 'success' && (
                            <Alert className="bg-green-50 border-green-300 mt-4">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <AlertTitle className="text-green-600">Payment Successful</AlertTitle>
                              <AlertDescription>
                                Payment processed successfully. Order reference: {orderReference}
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {paymentMethod === 'mobile_money' && paymentStatus === 'error' && (
                            <Alert className="bg-red-50 border-red-300 mt-4">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <AlertTitle className="text-red-600">Payment Failed</AlertTitle>
                              <AlertDescription>
                                {paymentError || "There was an error processing your payment."}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="crypto" className="pt-4">
                        <div className="space-y-4">
                          {isMetaMaskInstalled ? (
                            <div className="space-y-4">
                              {!isConnected ? (
                                <>
                                  <div className="p-4 rounded-md bg-muted">
                                    <p className="font-medium mb-2">Connect your MetaMask wallet to pay with Ethereum</p>
                                    <p className="text-sm text-muted-foreground mb-3">
                                      Pay directly from your wallet with a single click after connecting
                                    </p>
                                    <Button 
                                      type="button" 
                                      onClick={connectWallet}
                                      className="w-full"
                                    >
                                      <Wallet className="mr-2 h-4 w-4" />
                                      Connect MetaMask
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="p-4 rounded-md bg-muted">
                                    <div className="flex justify-between items-center mb-2">
                                      <p className="font-medium">Connected Wallet</p>
                                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                        Connected
                                      </span>
                                    </div>
                                    <p className="text-xs break-all font-mono mb-2">
                                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                    </p>
                                    {ethNetwork && (
                                      <p className="text-xs text-muted-foreground mb-2">
                                        Network: {ethNetwork}
                                      </p>
                                    )}
                                    <Separator className="my-3" />
                                    <p className="font-medium mb-2">Payment Details:</p>
                                    <p className="text-sm mb-1">Amount: {formatCurrency(orderTotal)}</p>
                                    <p className="text-sm mb-3">ETH: {(orderTotal / 3500000).toFixed(6)} ETH</p>
                                    <p className="text-xs text-muted-foreground mb-4">
                                      You'll be prompted to confirm this transaction in MetaMask
                                    </p>
                                    
                                    {paymentStatus === 'success' && (
                                      <Alert className="bg-green-50 border-green-300 mb-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <AlertTitle className="text-green-600">Transaction Sent</AlertTitle>
                                        <AlertDescription>
                                          <p>Transaction hash: {cryptoTransactionHash.slice(0, 10)}...{cryptoTransactionHash.slice(-8)}</p>
                                          <p className="mt-1">Order reference: {orderReference}</p>
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                    
                                    {paymentStatus === 'error' && (
                                      <Alert className="bg-red-50 border-red-300 mb-2">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <AlertTitle className="text-red-600">Transaction Failed</AlertTitle>
                                        <AlertDescription>
                                          {paymentError || "There was an error processing your transaction."}
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <>
                              <div className="p-4 rounded-md bg-muted">
                                <p className="font-medium mb-2">MetaMask not detected</p>
                                <p className="text-sm text-muted-foreground mb-3">
                                  To pay with Ethereum, please install the MetaMask browser extension
                                </p>
                                <a 
                                  href="https://metamask.io/download/" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-block"
                                >
                                  <Button type="button" variant="outline">
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Install MetaMask
                                  </Button>
                                </a>
                                <Separator className="my-4" />
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
                                <div className="mt-3">
                                  <p className="font-medium mb-2">Manual Payment:</p>
                                  <p className="text-xs break-all font-mono">0x742d35Cc6634C0532925a3b844Bc454e4438f44e</p>
                                  <p className="text-sm mt-2">Amount: {(orderTotal / 3500000).toFixed(6)} ETH</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={
                    isPaymentProcessing || 
                    (paymentMethod === 'crypto' && isMetaMaskInstalled && !isConnected) || 
                    (paymentMethod === 'mobile_money' && momoVerificationSent && !momoVerificationCode)
                  }
                >
                  {isPaymentProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'credit_card' && <CreditCard className="mr-2 h-4 w-4" />}
                      {paymentMethod === 'mobile_money' && <Smartphone className="mr-2 h-4 w-4" />}
                      {paymentMethod === 'crypto' && <Bitcoin className="mr-2 h-4 w-4" />}
                      {paymentMethod === 'mobile_money' && momoVerificationSent ? 'Verify & Pay' : 'Place Order'}
                    </>
                  )}
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