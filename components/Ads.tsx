import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdPurpose, AdSpend } from '../types';
import { Megaphone, PieChart } from 'lucide-react';

export const Ads: React.FC = () => {
  const { ads, addAdSpend } = useApp();
  const [amount, setAmount] = useState('');
  const [platform, setPlatform] = useState<AdSpend['platform']>('Facebook');
  const [purpose, setPurpose] = useState<AdPurpose>(AdPurpose.SCALING);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAdSpend({
      platform,
      amount: Number(amount),
      purpose,
      date: new Date().toISOString().split('T')[0],
    });
    setAmount('');
  };

  const inputClass = "w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-slate-900 placeholder-slate-400";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Ad Spend Tracker</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Megaphone className="w-4 h-4" /> Record Daily Spend
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                    <select 
                        value={platform} 
                        onChange={(e) => setPlatform(e.target.value as any)}
                        className={inputClass}
                    >
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (MAD)</label>
                    <input 
                        required
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className={inputClass}
                        placeholder="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setPurpose(AdPurpose.SCALING)}
                            className={`p-2 text-sm rounded border ${purpose === AdPurpose.SCALING ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'border-slate-200 hover:bg-slate-50'}`}
                        >
                            Scaling
                            <span className="block text-xs font-normal opacity-70">Counts to Unit Profit</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPurpose(AdPurpose.TESTING)}
                            className={`p-2 text-sm rounded border ${purpose === AdPurpose.TESTING ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold' : 'border-slate-200 hover:bg-slate-50'}`}
                        >
                            Testing
                            <span className="block text-xs font-normal opacity-70">Investment / OpEx</span>
                        </button>
                    </div>
                </div>
                <button className="w-full py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800">
                    Record Spend
                </button>
            </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-medium text-slate-500 flex justify-between">
                <span>Recent Spend</span>
                <PieChart className="w-5 h-5" />
            </div>
            <div className="overflow-y-auto max-h-[300px]">
                {ads.slice().reverse().map(ad => (
                    <div key={ad.id} className="p-4 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50">
                        <div>
                            <div className="font-medium text-slate-800">{ad.platform}</div>
                            <div className="text-xs text-slate-500">{ad.date} • <span className={ad.purpose === AdPurpose.SCALING ? 'text-indigo-600' : 'text-amber-600'}>{ad.purpose}</span></div>
                        </div>
                        <div className="font-bold text-rose-600">
                            -{ad.amount} MAD
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};