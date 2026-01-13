// Domain Models

export enum OrderStatus {
  PENDING = 'Pending',       // Order received, no action yet
  CONFIRMED = 'Confirmed',   // Customer confirmed via phone
  SHIPPED = 'Shipped',       // Handed to courier (Cost incurred)
  DELIVERED = 'Delivered',   // Money received (Revenue recognized)
  RETURNED = 'Returned',     // Failed delivery (Loss realized)
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
  laborCost: number;        // Manual input
  packagingCost: number;
  shippingCost: number;     // Avg cost to ship
  failBuffer: number;       // Avg loss per unit due to returns (e.g. 10 MAD)
}

export interface Order {
  id: string;
  customerName: string;
  productId: string;
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

export interface FinancialSnapshot {
  revenue: number;
  cogs: number;
  shippingSpend: number;
  adSpend: number;
  netProfit: number;
  cashBalance: number;
  deliveredCount: number;
  totalOrders: number;
  deliveryRate: number;
  breakEvenCPA: number;
  avgProfitPerWallet: number;
}