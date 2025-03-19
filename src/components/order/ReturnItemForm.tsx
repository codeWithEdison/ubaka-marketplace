
import React, { useState } from 'react';
import { Package, ArrowLeftRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Order } from '@/components/OrderTracker';
import { createReturnRequest, returnReasons } from '@/lib/returnUtils';

interface ReturnItemFormProps {
  order: Order;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReturnItemForm: React.FC<ReturnItemFormProps> = ({ order, onSuccess, onCancel }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) {
      toast({
        title: "Error",
        description: "Please select an item to return",
        variant: "destructive",
      });
      return;
    }
    
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason for the return",
        variant: "destructive",
      });
      return;
    }
    
    const item = order.items.find(item => item.id === selectedItem);
    if (!item) return;
    
    // Create the return request
    createReturnRequest({
      orderId: order.id,
      productId: selectedItem,
      quantity,
      reason: reason as any,
      description: description.trim() || undefined
    });
    
    toast({
      title: "Return Request Submitted",
      description: "Your return request has been received and is being processed.",
    });
    
    onSuccess();
  };
  
  // Find the maximum quantity for the selected item
  const maxQuantity = selectedItem 
    ? order.items.find(item => item.id === selectedItem)?.quantity || 1
    : 1;
  
  // Adjust quantity if it exceeds the max when item changes
  React.useEffect(() => {
    if (quantity > maxQuantity) {
      setQuantity(maxQuantity);
    }
  }, [selectedItem, maxQuantity]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowLeftRight className="h-5 w-5 mr-2" />
          Return Items from Order #{order.id}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Select Item to Return</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3 border rounded-md cursor-pointer ${
                    selectedItem === item.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setSelectedItem(item.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      className="mr-2"
                      checked={selectedItem === item.id}
                      onChange={() => setSelectedItem(item.id)}
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedItem && (
            <>
              <div>
                <Label htmlFor="quantity">Return Quantity</Label>
                <div className="flex items-center mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
                    className="h-10 w-10"
                  >
                    -
                  </Button>
                  <span className="w-10 text-center">{quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(prev => (prev < maxQuantity ? prev + 1 : maxQuantity))}
                    className="h-10 w-10"
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Reason for Return</Label>
                <RadioGroup className="mt-2" onValueChange={setReason} value={reason || undefined}>
                  {returnReasons.map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`reason-${value}`} />
                      <Label htmlFor={`reason-${value}`}>{label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="description">Additional Details (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide more details about your return"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="mt-2"
                />
              </div>
            </>
          )}
          
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedItem || !reason}>
              Submit Return Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReturnItemForm;
