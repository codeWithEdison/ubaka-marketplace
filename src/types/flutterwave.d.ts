declare module '@flutterwave/flutterwave-js-v3' {
    interface FlutterwaveConfig {
        tx_ref: string;
        amount: number;
        currency: string;
        payment_options?: string;
        redirect_url: string;
        customer: {
            email: string;
            phone_number?: string;
            name: string;
        };
        customizations: {
            title: string;
            description: string;
            logo: string;
        };
    }

    class Flutterwave {
        constructor(publicKey: string, config: FlutterwaveConfig);
        initializePayment(): Promise<any>;
    }

    export default Flutterwave;
} 