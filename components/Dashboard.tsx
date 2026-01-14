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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { orders, products, materials, ads, startFresh } = useApp();
  const [viewMode, setViewMode] = useState<'PERFORMANCE' | 'CASHFLOW'>('PERFORMANCE');
  const [showProfitModal, setShowProfitModal] = useState(false);

  const getProductMaterialCost = (product: Product) => {
    let cost = 0;
    product.materialIds.forEach(mId => {
      const mat = materials.find(m => m.id === mId);
      if (mat && mat.yield > 0) {
        cost += (mat.cost / mat.yield);
      }
    });
    return cost;
  };

  const metrics = useMemo(() => {
    // Group Orders
    const delivered = orders.filter(o => o.status === OrderStatus.DELIVERED);
    const returnedFree = orders.filter(o => o.status === OrderStatus.RETURNED_FREE);
    const returnedPaid = orders.filter(o => o.status === OrderStatus.RETURNED_PAID);
    const lost = orders.filter(o => o.status === OrderStatus.LOST_DAMAGED);
    
    // --- CASH FLOW (REALITY) ---
    // 1. Revenue (Cash In)
    const totalRevenue = delivered.reduce((acc, order) => {
      return acc + (order.finalPrice || 0);
    }, 0);

    // 2. Expenses (Cash Out)
    const totalMaterialSpend = materials.reduce((acc, m) => acc + m.cost, 0);
    const totalAdSpend = ads.reduce((acc, a) => acc + a.amount, 0);
    const totalShippingPaid = orders.reduce((acc, order) => {
      if (order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED) return acc;
      const val = order.manualShippingCost !== undefined ? order.manualShippingCost : 0;
      return acc + val;
    }, 0);
    
    const totalExpenses = totalMaterialSpend + totalAdSpend + totalShippingPaid;
    const cashBalance = totalRevenue - totalExpenses;

    // 3. Asset Value (Inventory)
    const inventoryValue = materials.reduce((acc, m) => {
      if (m.yield <= 0) return acc;
      const unitCost = m.cost / m.yield;
      return acc + (unitCost * m.remainingUnits);
    }, 0);

    // --- UNIT ECONOMICS (PERFORMANCE) ---
    const scalingAdSpend = ads.filter(a => a.purpose === AdPurpose.SCALING).reduce((acc, a) => acc + a.amount, 0);

    let totalCOGS = 0; // Material + Labor + Packaging for DELIVERED items
    let totalLosses = 0; // Costs sunk into returns/lost items

    // Calculate COGS for Delivered
    delivered.forEach(order => {
      const prod = products.find(p => p.id === order.productId);
      if (prod) {
        const qty = order.quantity || 1;
        const matCost = getProductMaterialCost(prod);
        const unitCosts = (matCost + prod.laborCost + prod.packagingCost) * qty;
        const ship = order.manualShippingCost !== undefined ? order.manualShippingCost : prod.shippingCost;
        totalCOGS += unitCosts + ship;
      }
    });

    // Calculate Losses (Returns)
    returnedFree.forEach(order => {
       const prod = products.find(p => p.id === order.productId);
       if (prod) {
           const qty = order.quantity || 1;
           totalLosses += prod.packagingCost * qty;
       }
    });

    returnedPaid.forEach(order => {
       const prod = products.find(p => p.id === order.productId);
       if (prod) {
         const qty = order.quantity || 1;
         const ship = order.manualShippingCost !== undefined ? order.manualShippingCost : prod.shippingCost;
         totalLosses += (prod.packagingCost * qty) + ship;
       }
    });

    lost.forEach(order => {
       const prod = products.find(p => p.id === order.productId);
       if (prod) {
         const qty = order.quantity || 1;
         const matCost = getProductMaterialCost(prod);
         const unitLoss = (matCost + prod.laborCost + prod.packagingCost) * qty;
         const ship = order.manualShippingCost !== undefined ? order.manualShippingCost : prod.shippingCost;
         totalLosses += unitLoss + ship;
       }
    });

    const campaignProfit = totalRevenue - totalCOGS - totalLosses - scalingAdSpend;
    
    const deliveredCount = delivered.reduce((acc, o) => acc + (o.quantity || 1), 0);
    const profitPerWallet = deliveredCount > 0 ? (campaignProfit / deliveredCount) : 0;
    const totalOrdersCount = orders.length;

    // Delivery Rate & Break Even
    const attemptedDeliveries = delivered.length + returnedFree.length + returnedPaid.length + lost.length;
    const deliveryRate = attemptedDeliveries > 0 
      ? Math.round((delivered.length / attemptedDeliveries) * 100) 
      : 0;

    const avgProduct = products[0];
    let breakEvenDeliveryRate = 0;
    
    if (avgProduct) {
        const mat = getProductMaterialCost(avgProduct);
        const revenue = avgProduct.price;
        const successCost = mat + avgProduct.laborCost + avgProduct.packagingCost + avgProduct.shippingCost;
        const avgFailCost = avgProduct.shippingCost + avgProduct.packagingCost; 
        breakEvenDeliveryRate = (avgFailCost / (revenue - successCost + avgFailCost)) * 100;
    }

    return {
      cashBalance,
      totalRevenue,
      totalExpenses,
      inventoryValue,
      campaignProfit,
      profitPerWallet,
      deliveryRate,
      breakEvenDeliveryRate,
      cpa: totalOrdersCount > 0 ? (scalingAdSpend / totalOrdersCount) : 0,
      cpd: deliveredCount > 0 ? (scalingAdSpend / deliveredCount) : 0,
      deliveredCount,
      scalingAdSpend,
      breakdown: {
        revenue: totalRevenue,
        cogs: totalCOGS,
        losses: totalLosses,
        marketing: scalingAdSpend
      }
    };
  }, [orders, products, materials, ads]);

  // --- AUTOMATED INSIGHT ---
  const getInsight = () => {
    if (metrics.deliveredCount === 0 && orders.length === 0) 
        return { type: 'neutral', text: "Ready to start? Add your first order to see business insights." };
    
    if (metrics.deliveryRate > 0 && metrics.deliveryRate < metrics.breakEvenDeliveryRate + 5) {
        return { type: 'danger', text: `📉 Action Needed: Your delivery rate (${metrics.deliveryRate}%) is critically low. Call customers to confirm orders before shipping.` };
    }
    
    if (metrics.profitPerWallet < 0) {
        return { type: 'warning', text: "🛑 Profit Warning: You are losing money on every delivered wallet. Review your ad spend or increase pricing." };
    }

    if (metrics.cashBalance < 0 && metrics.inventoryValue > Math.abs(metrics.cashBalance)) {
        return { type: 'info', text: "💡 Cash Notice: Your cash flow is negative, but your business is healthy. Your money is currently sitting in Inventory." };
    }
    
    if (metrics.profitPerWallet > 50 && metrics.deliveryRate > 60) {
        return { type: 'success', text: "🚀 Scaling Opportunity: You are making solid profit per wallet. It is safe to increase ad budget." };
    }
    
    return { type: 'neutral', text: "📊 Keep tracking. Improving delivery rate is the fastest way to increase profit." };
  };

  const insight = getInsight();

  // --- MOCK CHART DATA ---
  const chartData = [
    { name: 'Week 1', cash: 500, profit: 200 },
    { name: 'Week 2', cash: -200, profit: 450 },
    { name: 'Week 3', cash: 150, profit: 800 },
    { name: 'Week 4', cash: metrics.cashBalance, profit: metrics.campaignProfit },
  ];

  const StatCard = ({ title, value, subtext, icon: Icon, variant = 'neutral', onClick, highlightValue = false }: any) => {
    const variants = {
      neutral: 'bg-white border-slate-200 text-slate-900',
      success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      danger: 'bg-rose-50 border-rose-200 text-rose-900', // Used sparingly
      warning: 'bg-amber-50 border-amber-200 text-amber-900',
      info: 'bg-blue-50 border-blue-200 text-blue-900', // For Cash
      gray: 'bg-slate-50 border-slate-200 text-slate-600', // For Negative Cash (No panic)
    };

    return (
      <div 
        onClick={onClick}
        className={`p-5 rounded-xl border shadow-sm ${variants[variant]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]' : ''}`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium opacity-80">{title}</h3>
          <Icon className="w-5 h-5 opacity-50" />
        </div>
        <div className={`text-2xl font-bold ${highlightValue ? 'text-3xl' : ''}`}>{value}</div>
        {subtext && <div className="text-xs mt-1 opacity-70 font-medium">{subtext}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Business Pulse</h1>
          <p className="text-slate-500 text-sm">Making decisions based on data, not feelings.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex">
                <button 
                  onClick={() => setViewMode('PERFORMANCE')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    viewMode === 'PERFORMANCE' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Activity className="w-4 h-4" /> Performance
                </button>
                <button 
                  onClick={() => setViewMode('CASHFLOW')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    viewMode === 'CASHFLOW' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Wallet className="w-4 h-4" /> Cash Flow
                </button>
            </div>

            <button 
                onClick={startFresh}
                className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1 shadow-sm justify-center"
            >
                <RefreshCcw className="w-3 h-3" /> Reset
            </button>
        </div>
      </div>

      {/* The Coach Banner */}
      <div className={`p-4 rounded-lg border flex items-start gap-3 shadow-sm ${
          insight.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-900' :
          insight.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
          insight.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
          'bg-indigo-50 border-indigo-200 text-indigo-900'
      }`}>
         <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
         <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
         
         {/* --- PERFORMANCE VIEW (DECISION MAKING) --- */}
         {viewMode === 'PERFORMANCE' && (
            <>
                <StatCard 
                    title="Campaign Profit" 
                    value={`${metrics.campaignProfit.toFixed(0)} MAD`} 
                    subtext="After ads & returns"
                    icon={TrendingUp}
                    variant={metrics.campaignProfit >= 0 ? 'success' : 'warning'}
                    onClick={() => setShowProfitModal(true)}
                />

                <StatCard 
                    title="Real Profit per Wallet" 
                    value={`${metrics.profitPerWallet.toFixed(0)} MAD`} 
                    subtext="Based on delivered items only"
                    icon={Package}
                    variant={metrics.profitPerWallet > 0 ? 'success' : 'warning'}
                />

                {/* MODIFIED: CPA is Big, Total Spend is Small */}
                <StatCard 
                    title="Ad Spend (Scaling)" 
                    value={`${metrics.cpa.toFixed(0)} MAD`} 
                    subtext={`Total Spent: ${metrics.scalingAdSpend.toFixed(0)} MAD`}
                    icon={Megaphone}
                    variant="neutral"
                    highlightValue={true} // Emphasize CPA
                />

                <StatCard 
                    title="Delivery Rate" 
                    value={`${metrics.deliveryRate}%`} 
                    subtext={`Break-even: ${metrics.breakEvenDeliveryRate.toFixed(0)}%`}
                    icon={Activity}
                    variant={metrics.deliveryRate < metrics.breakEvenDeliveryRate ? 'danger' : 'neutral'}
                />
            </>
         )}

         {/* --- CASHFLOW VIEW (REALITY CHECK) --- */}
         {viewMode === 'CASHFLOW' && (
            <>
                <StatCard 
                    title="Net Cash Flow" 
                    value={`${metrics.cashBalance.toFixed(0)} MAD`} 
                    subtext="Real money In - Out"
                    icon={Wallet}
                    // Use 'gray' for negative cash to avoid panic, 'info' for positive
                    variant={metrics.cashBalance >= 0 ? 'info' : 'gray'}
                />

                <StatCard 
                    title="Stock Value" 
                    value={`${metrics.inventoryValue.toFixed(0)} MAD`} 
                    subtext="Materials on shelf (Asset)"
                    icon={Layers}
                    variant="neutral"
                />

                <StatCard 
                    title="Total Revenue" 
                    value={`${metrics.totalRevenue.toFixed(0)} MAD`} 
                    subtext="Cash Collected"
                    icon={ArrowUpRight}
                    variant="success"
                />

                <StatCard 
                    title="Total Expenses" 
                    value={`${metrics.totalExpenses.toFixed(0)} MAD`} 
                    subtext="Materials + Ads + Ship"
                    icon={ArrowDownRight}
                    variant="neutral"
                />
            </>
         )}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
                {viewMode === 'CASHFLOW' ? 'Cash Flow Trajectory' : 'Profit Trajectory'}
            </h3>
            <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded">Last 30 Days</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={viewMode === 'CASHFLOW' ? "#0ea5e9" : "#4f46e5"} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={viewMode === 'CASHFLOW' ? "#0ea5e9" : "#4f46e5"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
            <Area 
              type="monotone" 
              dataKey={viewMode === 'CASHFLOW' ? 'cash' : 'profit'} 
              stroke={viewMode === 'CASHFLOW' ? "#0ea5e9" : "#4f46e5"} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              name={viewMode === 'CASHFLOW' ? 'Net Cash' : 'Net Profit'}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Breakdown Modal */}
      {showProfitModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800">Campaign Profit Breakdown</h3>
                    <button onClick={() => setShowProfitModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-700">Total Revenue</span>
                        <span className="font-bold text-slate-900">{metrics.breakdown.revenue.toFixed(0)} MAD</span>
                    </div>
                    <div className="border-t border-slate-100 my-2"></div>
                    <div className="flex justify-between items-center text-sm text-slate-500">
                        <span>Direct Costs (COGS)</span>
                        <span className="text-rose-600">-{metrics.breakdown.cogs.toFixed(0)} MAD</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-500">
                        <span>Returns & Losses</span>
                        <span className="text-rose-600">-{metrics.breakdown.losses.toFixed(0)} MAD</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-500">
                        <span>Marketing (Scaling)</span>
                        <span className="text-rose-600">-{metrics.breakdown.marketing.toFixed(0)} MAD</span>
                    </div>
                    <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center">
                        <span className="font-bold text-slate-800">Net Campaign Profit</span>
                        <span className={`font-bold text-lg ${metrics.campaignProfit >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {metrics.campaignProfit.toFixed(0)} MAD
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 text-center pt-2">
                        This is your "Real Business Health". It accounts for all costs including ads and returns.
                    </p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};