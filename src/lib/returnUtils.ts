
import { OrderStatus } from './utils';

export interface ReturnRequest {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  reason: ReturnReason;
  description?: string;
  status: ReturnStatus;
  requestDate: string;
  decisionDate?: string;
}

export type ReturnReason = 
  | "damaged"
  | "wrong_item"
  | "not_as_described"
  | "changed_mind"
  | "defective"
  | "other";

export type ReturnStatus = 
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

// Mock return requests
export const mockReturns: ReturnRequest[] = [
  {
    id: "ret1",
    orderId: "ORD-2023-001",
    productId: "p1",
    quantity: 1,
    reason: "damaged",
    description: "Package arrived with significant damage to the cement bags",
    status: "approved",
    requestDate: "2023-11-20",
    decisionDate: "2023-11-22"
  },
  {
    id: "ret2",
    orderId: "ORD-2023-003",
    productId: "p3",
    quantity: 2,
    reason: "wrong_item",
    description: "I ordered blue tiles but received beige ones",
    status: "pending",
    requestDate: "2023-12-05"
  }
];

export const returnReasons = [
  { value: "damaged", label: "Item arrived damaged" },
  { value: "wrong_item", label: "Received wrong item" },
  { value: "not_as_described", label: "Item not as described" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "defective", label: "Item is defective" },
  { value: "other", label: "Other reason" }
];

export function getReturnRequestsForOrder(orderId: string): ReturnRequest[] {
  return mockReturns.filter(request => request.orderId === orderId);
}

export function canReturnOrder(status: OrderStatus, orderDate: string): boolean {
  // Only delivered orders can be returned
  if (status !== "delivered") return false;
  
  // Check if within 30-day return window
  const deliveryDate = new Date(orderDate);
  const today = new Date();
  const daysDifference = Math.floor((today.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDifference <= 30;
}

export function createReturnRequest(data: Omit<ReturnRequest, 'id' | 'status' | 'requestDate'>): ReturnRequest {
  const newRequest: ReturnRequest = {
    ...data,
    id: `ret${Date.now()}`,
    status: "pending",
    requestDate: new Date().toISOString().split('T')[0]
  };
  
  mockReturns.push(newRequest);
  return newRequest;
}
