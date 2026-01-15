import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdPurpose, AdSpend } from '../types';
import { Megaphone, PieChart, Edit2, Trash2, X } from 'lucide-react';

export const Ads: React.FC = () => {
  const { ads, addAdSpend, updateAdSpend, deleteAdSpend } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [platform, setPlatform] = useState<AdSpend['platform']>('Facebook');
  const [purpose, setPurpose] = useState<AdPurpose>(AdPurpose.SCALING);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
        const existingAd = ads.find(a => a.id === editingId);
        if (existingAd) {
            updateAdSpend({
                ...existingAd,
                platform,
                amount: Number(amount),
                purpose,
            });
        }
        setEditingId(null);
    } else {
        addAdSpend({
            platform,
            amount: Number(amount),
            purpose,
            date: new Date().toISOString().split('T')[0],
        });
    }
    setAmount('');
    setPurpose(AdPurpose.SCALING);
    setPlatform('Facebook');
  };

  const handleEdit = (ad: AdSpend) => {
    setEditingId(ad.id);
    setAmount(ad.amount.toString());
    setPlatform(ad.platform);
    setPurpose(ad.purpose);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this ad spend record?')) {
        deleteAdSpend(id);
        if (editingId === id) handleCancel();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setAmount('');
    setPurpose(AdPurpose.SCALING);
    setPlatform('Facebook');
  };

  const inputClass = "w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-slate-900 placeholder-slate-400";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Ad Spend Tracker</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h3 className="font-semibold mb-4 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                   <Megaphone className="w-4 h-4" /> {editingId ? 'Edit Ad Spend' : 'Record Daily Spend'}
                </span>
                {editingId && (
                    <button onClick={handleCancel} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                        <X className="w-3 h-3" /> Cancel
                    </button>
                )}
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
                <button className={`w-full py-2 text-white rounded-md transition ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                    {editingId ? 'Update Spend' : 'Record Spend'}
                </button>
            </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-medium text-slate-500 flex justify-between">
                <span>Recent Spend</span>
                <PieChart className="w-5 h-5" />
            </div>
            <div className="overflow-y-auto max-h-[400px]">
                {ads.slice().reverse().map(ad => (
                    <div key={ad.id} className={`p-4 border-b border-slate-50 flex justify-between items-center transition ${editingId === ad.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                        <div>
                            <div className="font-medium text-slate-800">{ad.platform}</div>
                            <div className="text-xs text-slate-500">{ad.date} • <span className={ad.purpose === AdPurpose.SCALING ? 'text-indigo-600' : 'text-amber-600'}>{ad.purpose}</span></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-rose-600">-{ad.amount} MAD</span>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => handleEdit(ad)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-transparent hover:border-slate-200"
                                >
                                    <Edit2 className="w-3 h-3" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(ad.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded border border-transparent hover:border-slate-200"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {ads.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">No ad spend recorded.</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};