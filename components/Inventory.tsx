import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { materials, addMaterial } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [yieldUnit, setYieldUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMaterial({
      name,
      cost: Number(cost),
      yield: Number(yieldUnit),
      date: new Date().toISOString().split('T')[0],
    });
    setIsOpen(false);
    setName('');
    setCost('');
    setYieldUnit('');
  };

  const inputClass = "w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-slate-900 placeholder-slate-400";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Materials & Stock</h2>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4" /> Add Bulk Purchase
        </button>
      </div>

      {isOpen && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold mb-4">Record New Material Purchase</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Material Name</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputClass}
                placeholder="e.g., Full Hide Leather"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Cost (MAD)</label>
                <input 
                  required
                  type="number" 
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  className={inputClass}
                  placeholder="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yield (Est. Wallets)</label>
                <input 
                  required
                  type="number" 
                  value={yieldUnit}
                  onChange={e => setYieldUnit(e.target.value)}
                  className={inputClass}
                  placeholder="15"
                />
              </div>
            </div>
            <div className="bg-indigo-50 p-3 rounded text-sm text-indigo-800">
              💡 Cost per wallet will be: <strong>{cost && yieldUnit ? (Number(cost) / Number(yieldUnit)).toFixed(2) : '0.00'} MAD</strong>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Material
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="p-4">Material</th>
              <th className="p-4">Bulk Cost</th>
              <th className="p-4">Est. Yield</th>
              <th className="p-4">Cost / Unit</th>
              <th className="p-4">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materials.map(m => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{m.name}</td>
                <td className="p-4 text-rose-600">-{m.cost} MAD</td>
                <td className="p-4">{m.yield} units</td>
                <td className="p-4 text-emerald-600 font-semibold">{(m.cost / m.yield).toFixed(2)} MAD</td>
                <td className="p-4">
                    {/* Mock calculation for remaining */}
                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">{m.remainingUnits} left</span>
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">No materials recorded yet.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};