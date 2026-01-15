"use client";

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Orders } from './components/Orders';
import { Ads } from './components/Ads';
import { Products } from './components/Products';
import { LayoutDashboard, Package, ShoppingBag, Megaphone, Wallet, Tag } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INVENTORY' | 'ORDERS' | 'ADS' | 'PRODUCTS'>('DASHBOARD');

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD': return <Dashboard />;
      case 'INVENTORY': return <Inventory />;
      case 'ORDERS': return <Orders />;
      case 'ADS': return <Ads />;
      case 'PRODUCTS': return <Products />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center justify-between">
         <div className="flex items-center gap-2 font-bold text-slate-800">
            <Wallet className="w-6 h-6 text-indigo-600" />
            <span>Altaj Leather</span>
         </div>
      </div>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
                <Wallet className="w-6 h-6 text-indigo-600" />
                <span>Altaj Leather</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">For Moroccan Makers</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              isActive={activeTab === 'DASHBOARD'} 
              onClick={() => setActiveTab('DASHBOARD')} 
            />
            <SidebarItem 
              icon={ShoppingBag} 
              label="Orders (COD)" 
              isActive={activeTab === 'ORDERS'} 
              onClick={() => setActiveTab('ORDERS')} 
            />
            <SidebarItem 
              icon={Tag} 
              label="Products" 
              isActive={activeTab === 'PRODUCTS'} 
              onClick={() => setActiveTab('PRODUCTS')} 
            />
            <SidebarItem 
              icon={Package} 
              label="Materials" 
              isActive={activeTab === 'INVENTORY'} 
              onClick={() => setActiveTab('INVENTORY')} 
            />
            <SidebarItem 
              icon={Megaphone} 
              label="Ad Spend" 
              isActive={activeTab === 'ADS'} 
              onClick={() => setActiveTab('ADS')} 
            />
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded text-xs text-slate-500">
              <p>v1.0.0 • Morocco</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-50 safe-area-bottom">
        <MobileNavItem 
          icon={LayoutDashboard} 
          label="Home" 
          isActive={activeTab === 'DASHBOARD'} 
          onClick={() => setActiveTab('DASHBOARD')} 
        />
        <MobileNavItem 
          icon={ShoppingBag} 
          label="Orders" 
          isActive={activeTab === 'ORDERS'} 
          onClick={() => setActiveTab('ORDERS')} 
        />
        <MobileNavItem 
          icon={Tag} 
          label="Items" 
          isActive={activeTab === 'PRODUCTS'} 
          onClick={() => setActiveTab('PRODUCTS')} 
        />
        <MobileNavItem 
          icon={Package} 
          label="Stock" 
          isActive={activeTab === 'INVENTORY'} 
          onClick={() => setActiveTab('INVENTORY')} 
        />
        <MobileNavItem 
          icon={Megaphone} 
          label="Ads" 
          isActive={activeTab === 'ADS'} 
          onClick={() => setActiveTab('ADS')} 
        />
      </div>
    </div>
  );
};

// UI Helpers
const SidebarItem = ({ icon: Icon, label, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
      ? 'bg-indigo-50 text-indigo-700 font-medium' 
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
    {label}
  </button>
);

const MobileNavItem = ({ icon: Icon, label, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full ${
      isActive ? 'text-indigo-600' : 'text-slate-400'
    }`}
  >
    <Icon className="w-6 h-6 mb-1" />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;