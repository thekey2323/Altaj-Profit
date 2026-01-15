// Domain Models

export enum OrderStatus {
  PENDING = 'Pending',             // Order received, no action yet
  CONFIRMED = 'Confirmed',         // Customer confirmed via phone
  SHIPPED = 'Shipped',             // Handed to courier
  DELIVERED = 'Delivered',         // Cash Received
  RETURNED_FREE = 'Returned (Free)', // Refused, no shipping fee charged (Deal with courier)
  RETURNED_PAID = 'Returned (Paid)', // Refused, shipping fee paid
  LOST_DAMAGED = 'Lost/Damaged',   // Total loss of product
}

export enum AdPurpose {
  TESTING = 'Testing',       // R&D Expense (OpEx)
  SCALING = 'Scaling',       // Customer Acquisition Cost (COGS context)
  AWARENESS = 'Awareness',   // Long term brand (OpEx)
}

export interface Material {
  id: string;
  name: string;
  cost: number;        // Total cost of bulk buy (e.g., 300 MAD)
  yield: number;       // How many units it makes (e.g., 15 wallets)
  date: string;
  remainingUnits: number; // Inventory tracking
}

export interface Product {
  id: string;
  name: string;
  price: number;            // Selling price (e.g., 400 MAD)
  materialIds: string[];    // Linked materials
  laborCost: number;        // Owner's time value
  packagingCost: number;
  shippingCost: number;     // Avg cost to ship
}

export interface Order {
  id: string;
  customerName: string;
  city: string;                // Customer City
  productId: string;
  quantity: number;            // Number of units
  status: OrderStatus;
  date: string;
  lastUpdated: string;
  // Overrides for financial accuracy per order
  finalPrice?: number;         // Actual revenue collected (overrides Product price)
  manualShippingCost?: number; // Actual shipping paid (overrides Product default)
}

export interface AdSpend {
  id: string;
  platform: 'Facebook' | 'Instagram' | 'TikTok';
  amount: number;
  purpose: AdPurpose;
  date: string;
}