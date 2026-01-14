import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus, AdPurpose, Product, Material } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Info,
  Activity,
  Trash2,
  RefreshCcw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { orders, products, materials, ads, startFresh } = useApp();
  const [viewMode, setViewMode] = useState<'CASHFLOW' | 'UNIT_ECONOMICS'>('CASHFLOW');

  // --- CORE LOGIC START ---

  // Helper: Calculate Material Cost Per Unit for a product
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
    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
    const shippedOrders = orders.filter(o => o.status === OrderStatus.SHIPPED || o.status === OrderStatus.DELIVERED || o.status === OrderStatus.RETURNED);
    const returnedOrders = orders.filter(o => o.status === OrderStatus.RETURNED);
    const totalOrders = orders.length;

    // 1. REVENUE
    const totalRevenue = deliveredOrders.reduce((acc, order) => {
      // Use order specific final price if available, else product price
      if (order.finalPrice !== undefined) return acc + order.finalPrice;
      const prod = products.find(p => p.id === order.productId);
      return acc + (prod ? prod.price : 0);
    }, 0);

    // 2. CASH FLOW VIEW CALCULATIONS (Real Bank Account)
    // Money Out Today: Total bulk material buys + Total Ad Spend + Shipping fees for shipped orders
    const totalMaterialSpend = materials.reduce((acc, m) => acc + m.cost, 0);
    const totalAdSpend = ads.reduce((acc, a) => acc + a.amount, 0);
    // Shipping is paid when status is SHIPPED, DELIVERED, or RETURNED
    const totalShippingPaid = shippedOrders.reduce((acc, order) => {
      // Use order specific shipping cost if available, else product default
      if (order.manualShippingCost !== undefined) return acc + order.manualShippingCost;
      const prod = products.find(p => p.id === order.productId);
      return acc + (prod ? prod.shippingCost : 0);
    }, 0);
    
    const cashBalance = totalRevenue - (totalMaterialSpend + totalAdSpend + totalShippingPaid);


    // 3. UNIT ECONOMICS VIEW CALCULATIONS (Profitability)
    // Only count costs for DELIVERED items to see if the business model works.
    
    // Logic:
    // Profit = Revenue - (COGS of Delivered) - (Scaling Ads) - (Losses from Returns)
    
    const scalingAdSpend = ads.filter(a => a.purpose === AdPurpose.SCALING).reduce((acc, a) => acc + a.amount, 0);
    
    // Calculate cost of goods sold for ONLY delivered items
    let cogsDelivered = 0;
    deliveredOrders.forEach(order => {
      const prod = products.find(p => p.id === order.productId);
      if (prod) {
        const matCost = getProductMaterialCost(prod);
        // Use order specific shipping
        const shipping = order.manualShippingCost !== undefined ? order.manualShippingCost : prod.shippingCost;
        cogsDelivered += matCost + prod.laborCost + prod.packagingCost + shipping;
      }
    });

    // Calculate losses from returns (Shipping + Packaging wasted)
    let returnLosses = 0;
    returnedOrders.forEach(order => {
        const prod = products.find(p => p.id === order.productId);
        if(prod) {
            const shipping = order.manualShippingCost !== undefined ? order.manualShippingCost : prod.shippingCost;
            returnLosses += shipping + prod.packagingCost; // Material is usually salvaged, but packaging/shipping is gone
        }
    });

    // Unit Economics Profit
    // We treat Scaling Ads as part of the acquisition cost for the delivered units.
    const unitEconomicsProfit = totalRevenue - cogsDelivered - scalingAdSpend - returnLosses;
    
    // Per Wallet Metrics
    const deliveredCount = deliveredOrders.length;
    const profitPerWallet = deliveredCount > 0 ? (unitEconomicsProfit / deliveredCount) : 0;

    // Delivery Rate
    const attemptedDeliveries = deliveredOrders.length + returnedOrders.length;
    const deliveryRate = attemptedDeliveries > 0 
      ? Math.round((deliveredOrders.length / attemptedDeliveries) * 100) 
      : 0;

    // Break Even CPA
    // Avg Gross Margin = Price - (Material + Labor + Pack + Ship + Buffer)
    // Simply: How much is left for ads?
    const avgProduct = products[0]; // Simplified for single product demo
    const avgMaterialCost = avgProduct ? getProductMaterialCost(avgProduct) : 0;
    const avgGrossMargin = avgProduct 
      ? avgProduct.price - (avgMaterialCost + avgProduct.laborCost + avgProduct.packagingCost + avgProduct.shippingCost + avgProduct.failBuffer)
      : 0;

    const currentCPA = deliveredCount > 0 ? (scalingAdSpend / deliveredCount) : 0;

    return {
      cashBalance,
      unitEconomicsProfit,
      profitPerWallet,
      deliveryRate,
      breakEvenCPA: avgGrossMargin,
      currentCPA,
      deliveredCount,
      totalRevenue,
      warnings: {
        lowDelivery: deliveryRate > 0 && deliveryRate < 70,
        highCPA: currentCPA > avgGrossMargin,
        negativeCash: cashBalance < 0 && unitEconomicsProfit > 0,
      }
    };
  }, [orders, products, materials, ads]);

  // --- MOCK CHART DATA ---
  const chartData = [
    { name: 'Week 1', cash: 500, profit: 200 },
    { name: 'Week 2', cash: -200, profit: 450 },
    { name: 'Week 3', cash: 150, profit: 800 },
    { name: 'Week 4', cash: metrics.cashBalance, profit: metrics.unitEconomicsProfit },
  ];
type StatCardType = 'neutral' | 'success' | 'danger' | 'warning';
  // --- RENDER HELPERS ---
  interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  type?: StatCardType;
}

const StatCard = ({ title, value, subtext, icon: Icon, type = 'neutral' }: StatCardProps) => {

    const colors: Record<StatCardType, string> = {
  neutral: 'bg-white border-slate-200 text-slate-900',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  danger: 'bg-rose-50 border-rose-200 text-rose-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
};


    return (
      <div className={`p-5 rounded-xl border shadow-sm ${colors[type]}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium opacity-70">{title}</h3>
          <Icon className="w-5 h-5 opacity-50" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && <div className="text-xs mt-1 opacity-70">{subtext}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back, Artisan.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
             onClick={startFresh}
             className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1 shadow-sm"
             title="Delete all transactions to start fresh"
          >
             <RefreshCcw className="w-3 h-3" /> Reset Business Data
          </button>
          
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex">
            <button 
              onClick={() => setViewMode('CASHFLOW')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'CASHFLOW' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Cash Flow View
            </button>
            <button 
              onClick={() => setViewMode('UNIT_ECONOMICS')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'UNIT_ECONOMICS' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Unit Profit View
            </button>
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 text-sm text-indigo-900 rounded-r-md flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">
            {viewMode === 'CASHFLOW' ? "Real Bank Reality (Cash Basis)" : "True Business Health (Accrual Basis)"}
          </p>
          <p className="opacity-90">
            {viewMode === 'CASHFLOW' 
              ? "Shows exact money entering and leaving your pocket today. Bulk material purchases appear as huge expenses immediately."
              : "Shows profit per wallet. Material costs are split across units. Shows if your business model actually works, ignoring timing of bulk buys."}
          </p>
        </div>
      </div>

      {/* Warnings */}
      {metrics.warnings.negativeCash && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-3 text-amber-800 animate-pulse">
          <Activity className="w-5 h-5" />
          <span className="font-medium">Cash is low, but you are Profitable! You just need to survive the cash crunch.</span>
        </div>
      )}
      {metrics.warnings.lowDelivery && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg flex items-center gap-3 text-rose-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Delivery Rate is below 70%. Check your courier or confirmation process.</span>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {viewMode === 'CASHFLOW' ? (
           <StatCard 
             title="Cash Balance" 
             value={`${metrics.cashBalance.toFixed(0)} MAD`} 
             subtext="Real money in bank"
             icon={DollarSign}
             type={metrics.cashBalance >= 0 ? 'neutral' : 'danger'}
           />
        ) : (
           <StatCard 
             title="Total Net Profit" 
             value={`${metrics.unitEconomicsProfit.toFixed(0)} MAD`} 
             subtext="Revenue - True Costs"
             icon={TrendingUp}
             type={metrics.unitEconomicsProfit >= 0 ? 'success' : 'danger'}
           />
        )}

        <StatCard 
          title="Profit Per Wallet" 
          value={`${metrics.profitPerWallet.toFixed(0)} MAD`} 
          subtext="After all costs & scaling ads"
          icon={Package}
          type={metrics.profitPerWallet > 0 ? 'success' : 'warning'}
        />

        <StatCard 
          title="Delivered Orders" 
          value={metrics.deliveredCount} 
          subtext={`${metrics.deliveryRate}% Success Rate`}
          icon={Activity}
          type={metrics.deliveryRate < 70 ? 'danger' : 'neutral'}
        />

        <StatCard 
          title="Ad Efficiency (CPA)" 
          value={`${metrics.currentCPA.toFixed(0)} MAD`} 
          subtext={`Max allowed: ${metrics.breakEvenCPA.toFixed(0)} MAD`}
          icon={TrendingDown}
          type={metrics.warnings.highCPA ? 'danger' : 'neutral'}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Financial Trend (Last 4 Weeks)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <Tooltip 
              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            />
            <Area 
              type="monotone" 
              dataKey={viewMode === 'CASHFLOW' ? 'cash' : 'profit'} 
              stroke="#4f46e5" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              name={viewMode === 'CASHFLOW' ? 'Cash Flow' : 'Net Profit'}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default Dashboard;
