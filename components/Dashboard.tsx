import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus, AdPurpose, Product } from '../types';
import {
  TrendingUp,
  Wallet,
  Package,
  Activity,
  RefreshCcw,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Lightbulb,
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { orders, products, materials, ads, startFresh } = useApp();
  const [viewMode, setViewMode] = useState<'PERFORMANCE' | 'CASHFLOW'>('PERFORMANCE');
  const [showProfitModal, setShowProfitModal] = useState(false);

  const getProductMaterialCost = (product: Product) => {
    let cost = 0;
    product.materialIds.forEach(id => {
      const mat = materials.find(m => m.id === id);
      if (mat && mat.yield > 0) cost += mat.cost / mat.yield;
    });
    return cost;
  };

  const metrics = useMemo(() => {
    const delivered = orders.filter(o => o.status === OrderStatus.DELIVERED);
    const returned = orders.filter(o =>
      o.status === OrderStatus.RETURNED_FREE ||
      o.status === OrderStatus.RETURNED_PAID ||
      o.status === OrderStatus.LOST_DAMAGED
    );

    const revenue = delivered.reduce((a, o) => a + (o.finalPrice || 0), 0);
    const adSpend = ads.reduce((a, ad) => a + ad.amount, 0);

    let cogs = 0;
    delivered.forEach(o => {
      const p = products.find(p => p.id === o.productId);
      if (!p) return;
      const qty = o.quantity || 1;
      cogs += (getProductMaterialCost(p) + p.laborCost + p.packagingCost) * qty;
      cogs += o.manualShippingCost ?? p.shippingCost;
    });

    const profit = revenue - cogs - adSpend;
    const deliveredQty = delivered.reduce((a, o) => a + (o.quantity || 1), 0);

    return {
      revenue,
      profit,
      profitPerUnit: deliveredQty ? profit / deliveredQty : 0,
      deliveryRate: orders.length
        ? Math.round((delivered.length / orders.length) * 100)
        : 0
    };
  }, [orders, products, materials, ads]);

  const StatCard = ({ title, value }: { title: string; value: string }) => (
    <div className="p-5 rounded-xl border bg-white shadow-sm">
      <h3 className="text-sm opacity-70">{title}</h3>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Business Pulse</h1>
        <button
          onClick={startFresh}
          className="px-3 py-2 text-sm border rounded-lg"
        >
          <RefreshCcw className="w-4 h-4 inline mr-1" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Revenue" value={`${metrics.revenue.toFixed(0)} MAD`} />
        <StatCard title="Campaign Profit" value={`${metrics.profit.toFixed(0)} MAD`} />
        <StatCard title="Profit / Wallet" value={`${metrics.profitPerUnit.toFixed(0)} MAD`} />
      </div>
    </div>
  );
};
