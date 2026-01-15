import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Material } from '../types';

export const Inventory: React.FC = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [yieldUnit, setYieldUnit] = useState('');
  const [remainingUnits, setRemainingUnits] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setCost('');
    setYieldUnit('');
    setRemainingUnits('');
    setIsOpen(true);
  };

  const handleOpenEdit = (m: Material) => {
    setEditingId(m.id);
    setName(m.name);
    setCost(m.cost.toString());
    setYieldUnit(m.yield.toString());
    setRemainingUnits(m.remainingUnits.toString());
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
        deleteMaterial(id);
        if (editingId === id) setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
        const existing = materials.find(m => m.id === editingId);
        if (existing) {
            updateMaterial({
                ...existing,
                name,
                cost: Number(cost),
                yield: Number(yieldUnit),
                remainingUnits: Number(remainingUnits)
            });
        }
    } else {
        addMaterial({
            name,
            cost: Number(cost),
            yield: Number(yieldUnit),
            date: new Date().toISOString().split('T')[0],
        });
    }
    setIsOpen(false);
    // Reset
    setName('');
    setCost('');
    setYieldUnit('');
    setRemainingUnits('');
  };

  const inputClass = "w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-slate-900 placeholder-slate-400";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Materials & Stock</h2>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4" /> Add Bulk Purchase
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Edit Material' : 'Record New Material'}</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              
              {editingId && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Remaining Stock</label>
                   <input 
                     required
                     type="number" 
                     value={remainingUnits}
                     onChange={e => setRemainingUnits(e.target.value)}
                     className={inputClass}
                   />
                </div>
              )}

              <div className="bg-indigo-50 p-3 rounded text-sm text-indigo-800">
                💡 Cost per wallet will be: <strong>{cost && yieldUnit ? (Number(cost) / Number(yieldUnit)).toFixed(2) : '0.00'} MAD</strong>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                {editingId && (
                    <button 
                      type="button" 
                      onClick={() => handleDelete(editingId)}
                      className="mr-auto px-4 py-2 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                )}
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
                  {editingId ? 'Update' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
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
              <th className="p-4 text-right">Actions</th>
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
                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">{m.remainingUnits} left</span>
                </td>
                <td className="p-4 text-right">
                     <button 
                         onClick={() => handleOpenEdit(m)}
                         className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition"
                         title="Modify"
                     >
                         <Edit2 className="w-4 h-4" />
                     </button>
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No materials recorded yet.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};