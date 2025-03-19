
import React, { useState } from 'react';
import { Ticket, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Coupon, validateCoupon } from '@/lib/couponUtils';

interface CouponFormProps {
  onApplyCoupon: (coupon: Coupon) => void;
  onRemoveCoupon: () => void;
  appliedCoupon: Coupon | null;
  subtotal: number;
}

const CouponForm: React.FC<CouponFormProps> = ({ 
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  subtotal
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApplyCoupon = () => {
    setError(null);
    
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    const coupon = validateCoupon(couponCode);
    
    if (!coupon) {
      setError("Invalid or expired coupon code");
      return;
    }
    
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      setError(`This coupon requires a minimum order of $${coupon.minOrderValue.toFixed(2)}`);
      return;
    }
    
    onApplyCoupon(coupon);
    setCouponCode('');
    
    toast({
      title: "Coupon Applied",
      description: `${coupon.discount}% discount has been applied to your order.`,
    });
  };

  const handleRemoveCoupon = () => {
    onRemoveCoupon();
    
    toast({
      title: "Coupon Removed",
      description: "The coupon has been removed from your order.",
    });
  };

  if (appliedCoupon) {
    return (
      <Alert className="bg-primary/10 border-primary mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-primary" />
            <AlertDescription className="text-sm">
              <span className="font-medium">{appliedCoupon.code}</span>: {appliedCoupon.discount}% discount applied
            </AlertDescription>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0" 
            onClick={handleRemoveCoupon}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove coupon</span>
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleApplyCoupon}
          disabled={!couponCode.trim()}
        >
          <Ticket className="h-4 w-4 mr-2" />
          Apply
        </Button>
      </div>
      
      {error && (
        <p className="text-destructive text-sm mt-2">{error}</p>
      )}
      
      <div className="text-xs text-muted-foreground mt-2">
        Try <span className="font-mono font-medium">WELCOME10</span> for 10% off your first order
      </div>
    </div>
  );
};

export default CouponForm;
