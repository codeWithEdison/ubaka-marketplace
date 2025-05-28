/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/PaymentService.ts

import { toast } from '@/hooks/use-toast';

// Payment types
export type PaymentMethod = 'credit_card' | 'mobile_money' | 'crypto';

// Credit card data
export interface CreditCardData {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

// Mobile Money data
export interface MobileMoneyData {
  momoNumber: string;
  momoProvider: 'mtn' | 'airtel' | 'tigo';
}

// Crypto data
export interface CryptoData {
  walletAddress: string;
  network?: string;
}

// Transaction result
export interface TransactionResult {
  success: boolean;
  orderReference: string;
  transactionId?: string;
  error?: string;
}

// Order details
export interface OrderDetails {
  totalAmount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  shipping: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  email: string;
  phone_number?: string;
  name: string;
  tx_ref: string;
  payment_type: 'card' | 'mobilemoney';
  payment_options?: string;
}

export interface FlutterwaveResponse {
  status: string;
  message: string;
  data: {
    link: string;
    status: string;
    transaction_id?: string;
  };
}

class PaymentService {
  private apiBaseUrl: string = '/api/payments'; // Replace with your API URL in production

  /**
   * Process a credit card payment
   * @param cardData Credit card information
   * @param orderDetails Order details
   * @returns Transaction result
   */
  public async processCardPayment(
    cardData: CreditCardData,
    orderDetails: OrderDetails
  ): Promise<TransactionResult> {
    try {
      // In a real app, you would make an API call to your payment processor
      // For demo purposes, we'll simulate the API call

      // Validate card information
      if (!this.validateCardNumber(cardData.cardNumber)) {
        throw new Error('Invalid card number');
      }

      if (!this.validateCardExpiry(cardData.cardExpiry)) {
        throw new Error('Invalid expiry date');
      }

      if (!this.validateCardCVC(cardData.cardCvc)) {
        throw new Error('Invalid CVC');
      }

      // Simulate API call
      await this.simulateApiCall();

      // Generate a reference number and transaction ID
      const orderReference = this.generateOrderReference();
      const transactionId = this.generateTransactionId();

      // Return successful transaction
      return {
        success: true,
        orderReference,
        transactionId
      };
    } catch (error) {
      console.error('Credit card payment error:', error);
      return {
        success: false,
        orderReference: '',
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Process a mobile money payment
   * @param mobileData Mobile money information
   * @param orderDetails Order details
   * @returns Transaction result with verification info
   */
  public async sendMobileMoneyVerification(
    mobileData: MobileMoneyData,
    orderDetails: OrderDetails
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate mobile number format
      if (!this.validateMobileNumber(mobileData.momoNumber)) {
        throw new Error('Invalid mobile number format');
      }

      // Simulate API call to send verification code
      await this.simulateApiCall();

      // In a real app, your backend would send the actual verification code via SMS

      return { success: true };
    } catch (error) {
      console.error('Mobile money verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send verification code'
      };
    }
  }

  /**
   * Verify mobile money payment code
   * @param verificationCode Code received by the user
   * @param mobileData Mobile money information
   * @param orderDetails Order details
   * @returns Transaction result
   */
  public async verifyMobileMoneyPayment(
    verificationCode: string,
    mobileData: MobileMoneyData,
    orderDetails: OrderDetails
  ): Promise<TransactionResult> {
    try {
      if (!verificationCode || verificationCode.length < 4) {
        throw new Error('Invalid verification code');
      }

      // Simulate API call to verify the code
      await this.simulateApiCall();

      // Generate a reference number and transaction ID
      const orderReference = this.generateOrderReference();
      const transactionId = this.generateTransactionId();

      // Return successful transaction
      return {
        success: true,
        orderReference,
        transactionId
      };
    } catch (error) {
      console.error('Mobile money verification error:', error);
      return {
        success: false,
        orderReference: '',
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Prepare crypto payment data
   * @param orderDetails Order details
   * @returns Payment data for crypto transaction
   */
  public prepareCryptoPayment(orderDetails: OrderDetails): {
    receiverAddress: string;
    amountInEth: number;
    amountInWei: string;
  } {
    const totalAmount = orderDetails.totalAmount + orderDetails.shipping;

    // Convert to ETH (this is a simplified conversion)
    // In production, use an actual exchange rate API
    const ethAmount = totalAmount / 3500000;

    // Convert ETH to Wei (1 ETH = 10^18 Wei)
    const weiAmount = BigInt(Math.round(ethAmount * 1e18)).toString(16);

    // This should be your company's ethereum wallet address
    const receiverAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

    return {
      receiverAddress,
      amountInEth: parseFloat(ethAmount.toFixed(6)),
      amountInWei: '0x' + weiAmount
    };
  }

  /**
   * Process crypto payment via MetaMask
   * @param cryptoData Wallet information
   * @param orderDetails Order details
   * @returns Transaction result
   */
  public async processCryptoPayment(
    walletAddress: string,
    orderDetails: OrderDetails
  ): Promise<TransactionResult> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      if (!walletAddress) {
        throw new Error('Wallet is not connected');
      }

      // Prepare payment data
      const paymentData = this.prepareCryptoPayment(orderDetails);

      // Prepare transaction parameters
      const transactionParameters = {
        to: paymentData.receiverAddress,
        from: walletAddress,
        value: paymentData.amountInWei,
      };

      // Send the transaction via MetaMask
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      // Generate order reference
      const orderReference = this.generateOrderReference();

      return {
        success: true,
        orderReference,
        transactionId: txHash
      };
    } catch (error) {
      console.error('Crypto payment error:', error);
      return {
        success: false,
        orderReference: '',
        error: error instanceof Error ? error.message : 'Crypto payment failed'
      };
    }
  }

  /**
   * Connect to MetaMask wallet
   * @returns Connected wallet address or error
   */
  public async connectMetaMaskWallet(): Promise<{
    success: boolean;
    address?: string;
    network?: string;
    error?: string;
  }> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get the current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const network = this.getNetworkName(chainId);

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      return {
        success: true,
        address: accounts[0],
        network
      };
    } catch (error) {
      console.error('MetaMask connection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
      };
    }
  }

  /**
   * Get current connected MetaMask accounts
   * @returns Connected accounts or null
   */
  public async getConnectedAccounts(): Promise<{
    address?: string;
    network?: string;
    isConnected: boolean;
  }> {
    try {
      if (!window.ethereum) {
        return { isConnected: false };
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      if (accounts.length === 0) {
        return { isConnected: false };
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const network = this.getNetworkName(chainId);

      return {
        address: accounts[0],
        network,
        isConnected: true
      };
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      return { isConnected: false };
    }
  }

  /**
   * Register MetaMask event listeners
   * @param onAccountsChanged Callback when accounts change
   * @param onChainChanged Callback when network changes
   * @returns Cleanup function
   */
  public registerMetaMaskEvents(
    onAccountsChanged: (accounts: string[]) => void,
    onChainChanged: (chainId: string) => void
  ): () => void {
    if (!window.ethereum) return () => { };

    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', onChainChanged);

    // Return cleanup function
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', onAccountsChanged);
        window.ethereum.removeListener('chainChanged', onChainChanged);
      }
    };
  }

  // UTILITY METHODS

  /**
   * Validate credit card number
   * @param cardNumber Card number to validate
   * @returns Whether the card number is valid
   */
  private validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s+/g, '');
    return /^\d{16}$/.test(cleaned);
  }

  /**
   * Validate card expiry date
   * @param expiry Expiry date in MM/YY format
   * @returns Whether the expiry date is valid
   */
  private validateCardExpiry(expiry: string): boolean {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return false;
    }

    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(year, 10);

    // Check if month is valid
    if (expiryMonth < 1 || expiryMonth > 12) {
      return false;
    }

    // Check if date is in the past
    if (expiryYear < currentYear ||
      (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return false;
    }

    return true;
  }

  /**
   * Validate card CVC
   * @param cvc CVC code to validate
   * @returns Whether the CVC is valid
   */
  private validateCardCVC(cvc: string): boolean {
    return /^\d{3}$/.test(cvc);
  }

  /**
   * Validate mobile number
   * @param mobileNumber Mobile number to validate
   * @returns Whether the mobile number is valid
   */
  private validateMobileNumber(mobileNumber: string): boolean {
    // This is a simple validation for Rwandan numbers
    // Adjust for your target region
    return /^07\d{8}$/.test(mobileNumber);
  }

  /**
   * Generate order reference
   * @returns Unique order reference
   */
  private generateOrderReference(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `UBAKA-${timestamp}-${random}`;
  }

  /**
   * Generate transaction ID
   * @returns Unique transaction ID
   */
  private generateTransactionId(): string {
    return 'TR-' + Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get network name from chain ID
   * @param chainId Ethereum chain ID
   * @returns Network name
   */
  private getNetworkName(chainId: string): string {
    const networks: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Test Network',
      '0x4': 'Rinkeby Test Network',
      '0x5': 'Goerli Test Network',
      '0x2a': 'Kovan Test Network',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai Testnet'
    };

    return networks[chainId] || `Chain ID: ${chainId}`;
  }

  /**
   * Simulate API call with delay
   * @param ms Milliseconds to delay
   */
  private async simulateApiCall(ms = 1500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

// Create and export a singleton instance
const paymentService = new PaymentService();
export default paymentService;

export const initiatePayment = async (paymentDetails: PaymentDetails): Promise<FlutterwaveResponse> => {
  try {
    // Load Flutterwave script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    document.body.appendChild(script);

    return new Promise((resolve, reject) => {
      script.onload = () => {
        // Get the global Flutterwave object
        const FlutterwaveCheckout = (window as any).FlutterwaveCheckout;

        if (!FlutterwaveCheckout) {
          reject(new Error('Flutterwave failed to load'));
          return;
        }

        FlutterwaveCheckout({
          public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
          tx_ref: paymentDetails.tx_ref,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          payment_options: paymentDetails.payment_type === 'card' ? 'card' : 'mobilemoney',
          redirect_url: `${window.location.origin}/payment-callback`,
          customer: {
            email: paymentDetails.email,
            phone_number: paymentDetails.phone_number,
            name: paymentDetails.name,
          },
          customizations: {
            title: 'Ubaka Marketplace',
            description: 'Payment for your purchase',
            logo: '/logo.png',
          },
          onClose: () => {
            reject(new Error('Payment cancelled by user'));
          },
          callback: (response: any) => {
            if (response.status === 'successful') {
              resolve({
                status: 'success',
                message: 'Payment successful',
                data: {
                  link: response.data.link,
                  status: response.status,
                  transaction_id: response.transaction_id
                }
              });
            } else {
              reject(new Error(response.message || 'Payment failed'));
            }
          },
          callbackContext: this
        });
      };
      script.onerror = () => reject(new Error('Failed to load Flutterwave script'));
    });
  } catch (error) {
    console.error('Payment initiation failed:', error);
    throw error;
  }
};

export const verifyPayment = async (transactionId: string): Promise<FlutterwaveResponse> => {
  try {
    const secretKey = import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY;
    console.log('Using secret key for verification (first 4 chars):', secretKey ? secretKey.substring(0, 4) : 'Not set');

    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'success') {
      return {
        status: 'success',
        message: 'Payment verified successfully',
        data: {
          link: '',
          status: 'success',
          transaction_id: transactionId
        }
      };
    } else {
      throw new Error(data.message || 'Payment verification failed');
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
};
