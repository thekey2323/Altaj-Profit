import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { Plus, Edit2, Trash2, X, Tag, Box, Truck, Hammer, Calculator } from 'lucide-react';

export const Products: React.FC = () => {
  const { products, materials, addProduct, updateProduct, deleteProduct } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [packagingCost, setPackagingCost] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const inputClass = "w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-slate-900 placeholder-slate-400";

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setLaborCost(''); // Reset to empty to force entry
    setPackagingCost('0');
    setShippingCost('35'); // Default Morocco shipping
    setSelectedMaterials([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(p.price.toString());
    setLaborCost(p.laborCost.toString());
    setPackagingCost(p.packagingCost.toString());
    setShippingCost(p.shippingCost.toString());
    setSelectedMaterials(p.materialIds);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      setIsModalOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name,
      price: Number(price),
      laborCost: Number(laborCost),
      packagingCost: Number(packagingCost),
      shippingCost: Number(shippingCost),
      materialIds: selectedMaterials
    };

    if (editingId) {
      updateProduct({ ...productData, id: editingId });
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
  };

  const toggleMaterial = (id: string) => {
    setSelectedMaterials(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Helper to calculate total cost for display
  const calculateTotalCost = (p: Product) => {
    let matCost = 0;
    p.materialIds.forEach(mId => {
      const m = materials.find(mat => mat.id === mId);
      if (m && m.yield > 0) matCost += m.cost / m.yield;
    });
    return matCost + p.laborCost + p.packagingCost + p.shippingCost;
  };

  // Profit Simulation Helper
  const simulateProfit = (product: Product, returnRate: number) => {
    const cost = calculateTotalCost(product);
    // 100 orders simulation
    const successful = 100 * (1 - returnRate);
    const returns = 100 * returnRate; // Assuming 50% paid returns, 50% free returns for simplicity in quick view
    
    // Revenue
    const revenue = successful * product.price;
    
    // Costs
    // Delivered: Full Cost
    const deliveredCost = successful * cost;
    
    // Returns (Simplified Model for card view: Avg loss per return is Shipping + Packing)
    // Assuming 50% of returns are PAID shipping (loss ~40dh) and 50% FREE (loss ~5dh pack)
    const avgReturnLoss = (product.shippingCost + product.packagingCost + product.packagingCost) / 2;
    const returnCost = returns * avgReturnLoss;

    const netProfit = revenue - deliveredCost - returnCost;
    return netProfit / 100; // Profit per Unit attempted
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Product Management</h2>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Product List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(product => {
          const totalCost = calculateTotalCost(product);
          const maxProfit = product.price - totalCost;

          return (
            <div key={product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{product.name}</h3>
                  <div className="text-indigo-600 font-bold text-xl">{product.price} MAD</div>
                </div>
                <button 
                  type="button"
                  onClick={() => handleOpenEdit(product)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between">
                  <span>Base Unit Cost:</span>
                  <span className="font-medium text-slate-900">{totalCost.toFixed(0)} MAD</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                   <span>(Mat+Labor+Pack+Ship)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span>Max Profit (0% Returns):</span>
                  <span className="font-bold text-emerald-600">{maxProfit.toFixed(0)} MAD</span>
                </div>
              </div>

              <div className="mt-auto">
                 <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
                    <Calculator className="w-3 h-3" /> Profitability Simulator
                 </div>
                 <div className="grid grid-cols-3 gap-1 text-center text-xs">
                    <div className="bg-emerald-50 p-1 rounded border border-emerald-100">
                        <div className="text-emerald-800 font-bold">{simulateProfit(product, 0.1).toFixed(0)}</div>
                        <div className="text-[10px] text-emerald-600">@10% Ret</div>
                    </div>
                    <div className="bg-amber-50 p-1 rounded border border-amber-100">
                        <div className="text-amber-800 font-bold">{simulateProfit(product, 0.3).toFixed(0)}</div>
                        <div className="text-[10px] text-amber-600">@30% Ret</div>
                    </div>
                    <div className="bg-rose-50 p-1 rounded border border-rose-100">
                        <div className="text-rose-800 font-bold">{simulateProfit(product, 0.5).toFixed(0)}</div>
                        <div className="text-[10px] text-rose-600">@50% Ret</div>
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Basic Info
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. Cardholder" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (MAD)</label>
                    <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} placeholder="250" />
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                       <Box className="w-4 h-4" /> Material Used
                    </h4>
                    <div className="border border-slate-200 rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-slate-50">
                       {materials.map(m => (
                         <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-100 p-1 rounded">
                           <input 
                             type="checkbox" 
                             checked={selectedMaterials.includes(m.id)} 
                             onChange={() => toggleMaterial(m.id)}
                             className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                           />
                           <span>{m.name}</span>
                           <span className="text-slate-400 text-xs ml-auto">{(m.cost / m.yield).toFixed(1)} MAD/unit</span>
                         </label>
                       ))}
                       {materials.length === 0 && <div className="text-xs text-slate-400">No materials added yet.</div>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Cost Structure (Per Unit)
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Labor (Time Value)</label>
                    <input required type="number" value={laborCost} onChange={e => setLaborCost(e.target.value)} className={inputClass} placeholder="e.g. 50" />
                    <p className="text-[10px] text-slate-500 mt-1">Must be counted even if done by you.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Packaging</label>
                      <input required type="number" value={packagingCost} onChange={e => setPackagingCost(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Avg Shipping</label>
                      <input required type="number" value={shippingCost} onChange={e => setShippingCost(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded text-xs text-indigo-800 mt-2">
                    <p>Shipping is tracked per order. This value is used for profit projections.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col-reverse gap-3 sm:flex-row">
                 {editingId && (
                    <button 
                      type="button"
                      onClick={() => handleDelete(editingId)}
                      className="px-4 py-3 sm:py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                 )}
                <div className="flex-1"></div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-3 sm:py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-center"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 px-6 py-3 sm:py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition font-medium text-center"
                    >
                      {editingId ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};