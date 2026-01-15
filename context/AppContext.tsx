import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Material, Product, Order, AdSpend, OrderStatus, AdPurpose } from '../types';

interface AppContextType {
  materials: Material[];
  products: Product[];
  orders: Order[];
  ads: AdSpend[];
  addMaterial: (m: Omit<Material, 'id' | 'remainingUnits'>) => void;
  updateMaterial: (m: Material) => void;
  deleteMaterial: (id: string) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addOrder: (o: Omit<Order, 'id' | 'lastUpdated'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  addAdSpend: (a: Omit<AdSpend, 'id'>) => void;
  updateAdSpend: (a: AdSpend) => void;
  deleteAdSpend: (id: string) => void;
  resetData: () => void;
  clearAllData: () => void;
  startFresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'craftledger_data_v1';

// Initial Mock Data
const INITIAL_MATERIALS: Material[] = [
  { id: 'm1', name: 'Premium Cowhide (Brown)', cost: 1500, yield: 30, date: '2023-10-01', remainingUnits: 15 },
  { id: 'm2', name: 'Waxed Thread (Roll)', cost: 100, yield: 50, date: '2023-10-01', remainingUnits: 30 },
];

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    name: 'Classic Bifold Wallet', 
    price: 350, 
    materialIds: ['m1', 'm2'], 
    laborCost: 40, 
    packagingCost: 15, 
    shippingCost: 35
  }
];

const INITIAL_ADS: AdSpend[] = [
  { id: 'a1', platform: 'Facebook', amount: 200, purpose: AdPurpose.TESTING, date: '2023-10-05' },
  { id: 'a2', platform: 'Instagram', amount: 500, purpose: AdPurpose.SCALING, date: '2023-10-10' },
];

const INITIAL_ORDERS: Order[] = [
  { id: 'o1', customerName: 'Ahmed B.', city: 'Casablanca', productId: 'p1', quantity: 1, status: OrderStatus.DELIVERED, date: '2023-10-12', lastUpdated: '2023-10-14', finalPrice: 350, manualShippingCost: 35 },
  { id: 'o2', customerName: 'Sara K.', city: 'Rabat', productId: 'p1', quantity: 1, status: OrderStatus.DELIVERED, date: '2023-10-12', lastUpdated: '2023-10-14', finalPrice: 350, manualShippingCost: 35 },
  { id: 'o3', customerName: 'Omar L.', city: 'Marrakech', productId: 'p1', quantity: 1, status: OrderStatus.SHIPPED, date: '2023-10-13', lastUpdated: '2023-10-13', finalPrice: 350, manualShippingCost: 35 },
  { id: 'o4', customerName: 'Yassine M.', city: 'Tangier', productId: 'p1', quantity: 1, status: OrderStatus.RETURNED_PAID, date: '2023-10-11', lastUpdated: '2023-10-15', finalPrice: 350, manualShippingCost: 35 },
  { id: 'o5', customerName: 'Fatima Z.', city: 'Fes', productId: 'p1', quantity: 2, status: OrderStatus.PENDING, date: '2023-10-15', lastUpdated: '2023-10-15', finalPrice: 700, manualShippingCost: 35 },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ads, setAds] = useState<AdSpend[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMaterials(parsed.materials || []);
        setProducts(parsed.products || []);
        setOrders(parsed.orders || []);
        setAds(parsed.ads || []);
      } catch (e) {
        console.error("Failed to parse data", e);
        setMaterials(INITIAL_MATERIALS);
        setProducts(INITIAL_PRODUCTS);
        setOrders(INITIAL_ORDERS);
        setAds(INITIAL_ADS);
      }
    } else {
      // Seed initial data if nothing exists
      setMaterials(INITIAL_MATERIALS);
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      setAds(INITIAL_ADS);
    }
    setDataLoaded(true);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!dataLoaded) return;
    const data = { materials, products, orders, ads };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [materials, products, orders, ads, dataLoaded]);

  const addMaterial = (m: Omit<Material, 'id' | 'remainingUnits'>) => {
    const newMaterial: Material = {
      ...m,
      id: Math.random().toString(36).substr(2, 9),
      remainingUnits: m.yield, 
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const updateMaterial = (updatedMaterial: Material) => {
    setMaterials(prev => prev.map(m => m.id === updatedMaterial.id ? updatedMaterial : m));
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...p, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addOrder = (o: Omit<Order, 'id' | 'lastUpdated'>) => {
    setOrders(prev => [...prev, { 
      ...o, 
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString()
    }]);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, lastUpdated: new Date().toISOString() } : o));
  };

  const updateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => 
      o.id === updatedOrder.id 
        ? { ...updatedOrder, lastUpdated: new Date().toISOString() } 
        : o
    ));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const addAdSpend = (a: Omit<AdSpend, 'id'>) => {
    setAds(prev => [...prev, { ...a, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const updateAdSpend = (updatedAd: AdSpend) => {
    setAds(prev => prev.map(a => a.id === updatedAd.id ? updatedAd : a));
  };

  const deleteAdSpend = (id: string) => {
    setAds(prev => prev.filter(a => a.id !== id));
  };

  const resetData = () => {
    if (window.confirm("This will reset all data to the initial demo state. Are you sure?")) {
      setMaterials(INITIAL_MATERIALS);
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      setAds(INITIAL_ADS);
    }
  };

  const clearAllData = () => {
    if (window.confirm("Warning: This will DELETE ALL DATA (including Products). This action cannot be undone.")) {
      setMaterials([]);
      setProducts([]);
      setOrders([]);
      setAds([]);
    }
  };

  const startFresh = () => {
    if (window.confirm("⚠️ RESET BUSINESS DATA?\n\nThis will DELETE:\n• All Orders\n• All Ad Spend records\n• All Material Inventory\n\nIt will KEEP:\n• Your Product Definitions\n\nThis action cannot be undone. Are you sure you want to start fresh?")) {
      setOrders([]);
      setAds([]);
      setMaterials([]);
      // Unlink materials from products since materials are gone
      setProducts(prev => prev.map(p => ({ ...p, materialIds: [] })));
    }
  };

  return (
    <AppContext.Provider value={{
      materials, products, orders, ads,
      addMaterial, updateMaterial, deleteMaterial,
      addProduct, updateProduct, deleteProduct, addOrder, updateOrderStatus, updateOrder, deleteOrder, 
      addAdSpend, updateAdSpend, deleteAdSpend,
      resetData, clearAllData, startFresh
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};