import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus, Order } from '../types';
import { CheckCircle, Truck, XCircle, Clock, Package, Plus, Trash2, Edit2, X, ExternalLink, DollarSign } from 'lucide-react';

export const Orders: React.FC = () => {
  const { orders, updateOrderStatus, products, addOrder, updateOrder, deleteOrder } = useApp();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [productId, setProductId] = useState('');
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [date, setDate] = useState('');
  const [finalPrice, setFinalPrice] = useState<string>('');
  const [manualShippingCost, setManualShippingCost] = useState<string>('');

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-slate-100 text-slate-600 border-slate-200';
      case OrderStatus.CONFIRMED: return 'bg-blue-50 text-blue-700 border-blue-200';
      case OrderStatus.SHIPPED: return 'bg-purple-50 text-purple-700 border-purple-200';
      case OrderStatus.DELIVERED: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case OrderStatus.RETURNED: return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return Clock;
      case OrderStatus.CONFIRMED: return CheckCircle;
      case OrderStatus.SHIPPED: return Truck;
      case OrderStatus.DELIVERED: return Package;
      case OrderStatus.RETURNED: return XCircle;
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setCustomerName('');
    const defaultProduct = products.length > 0 ? products[0] : null;
    setProductId(defaultProduct ? defaultProduct.id : '');
    setStatus(OrderStatus.PENDING);
    setDate(new Date().toISOString().split('T')[0]);
    
    // Auto-set financials from product defaults
    if (defaultProduct) {
        setFinalPrice(defaultProduct.price.toString());
        setManualShippingCost(defaultProduct.shippingCost.toString());
    } else {
        setFinalPrice('');
        setManualShippingCost('');
    }
    
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: Order) => {
    setEditingId(order.id);
    setCustomerName(order.customerName);
    setProductId(order.productId);
    setStatus(order.status);
    setDate(order.date);
    
    // Check if order has overrides, otherwise fall back to product defaults (or 0 if product deleted)
    const product = products.find(p => p.id === order.productId);
    setFinalPrice(order.finalPrice?.toString() ?? product?.price.toString() ?? '0');
    setManualShippingCost(order.manualShippingCost?.toString() ?? product?.shippingCost.toString() ?? '0');
    
    setIsModalOpen(true);
  };

  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    // If adding a new order (or editing and changing product), auto-update financials
    // Only if the user hasn't typed something custom? For simplicity, we auto-update on product switch.
    const product = products.find(p => p.id === newProductId);
    if (product) {
        setFinalPrice(product.price.toString());
        setManualShippingCost(product.shippingCost.toString());
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrder(id);
      setIsModalOpen(false); // Close modal if open
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    const orderData = {
      customerName,
      productId,
      status,
      date,
      finalPrice: Number(finalPrice),
      manualShippingCost: Number(manualShippingCost)
    };

    if (editingId) {
      const originalOrder = orders.find(o => o.id === editingId);
      if (originalOrder) {
        updateOrder({
          ...originalOrder,
          ...orderData
        });
      }
    } else {
      addOrder(orderData);
    }
    setIsModalOpen(false);
  };

  // Group orders by status for Kanban (simplified to list with actions for mobile friendliness)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const inputClass = "w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-slate-900 placeholder-slate-400";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Orders & COD Tracking</h2>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      {/* Modal - Fixed Z-Index and Scroll behavior for mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Edit Order' : 'New Order'}</h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                <input 
                  required
                  type="text" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Ahmed Benali"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Product</label>
                  <div className="text-[10px] text-indigo-600 flex items-center gap-1">
                     <ExternalLink className="w-3 h-3" />
                     <span>Go to "Products" tab to add/edit</span>
                  </div>
                </div>
                <select 
                  required
                  value={productId}
                  onChange={e => handleProductChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {products.length === 0 && (
                  <p className="text-xs text-rose-500 mt-1">⚠️ No products found. Please add a product first.</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Order Financials</div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Revenue (Price)</label>
                    <div className="relative">
                        <input 
                          required
                          type="number" 
                          value={finalPrice}
                          onChange={e => setFinalPrice(e.target.value)}
                          className={`${inputClass} pl-6`}
                        />
                        <span className="absolute left-2 top-2.5 text-slate-400 text-xs">MAD</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Shipping Cost</label>
                    <div className="relative">
                        <input 
                          required
                          type="number" 
                          value={manualShippingCost}
                          onChange={e => setManualShippingCost(e.target.value)}
                          className={`${inputClass} pl-6`}
                        />
                        <span className="absolute left-2 top-2.5 text-slate-400 text-xs">MAD</span>
                    </div>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value as OrderStatus)}
                  className={inputClass}
                >
                  {Object.values(OrderStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  required
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              
              <div className="pt-6 flex flex-col-reverse gap-3 sm:flex-row">
                 {editingId && (
                    <button 
                      type="button"
                      onClick={(e) => handleDelete(editingId, e)}
                      className="px-4 py-3 sm:py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition flex items-center justify-center gap-2 font-medium w-full sm:w-auto"
                    >
                      <Trash2 className="w-5 h-5" /> Delete
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
                      {editingId ? 'Update' : 'Create'}
                    </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order List */}
      <div className="grid gap-4">
        {sortedOrders.map(order => {
            const product = products.find(p => p.id === order.productId);
            const StatusIcon = getStatusIcon(order.status);
            const displayPrice = order.finalPrice !== undefined ? order.finalPrice : product?.price;
            
            return (
              <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative group">
                <div className="flex items-start gap-3 w-full md:w-auto">
                  <div className={`p-2 rounded-full ${getStatusColor(order.status)} border shrink-0`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 truncate">{order.customerName}</div>
                    <div className="text-sm text-slate-500 truncate">{product?.name} • {order.date}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    {/* Workflow Actions */}
                    <div className="flex gap-2 flex-wrap justify-end">
                      {order.status === OrderStatus.PENDING && (
                          <button 
                              type="button"
                              onClick={() => updateOrderStatus(order.id, OrderStatus.CONFIRMED)}
                              className="flex-1 sm:flex-none px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm"
                          >
                              Confirm
                          </button>
                      )}
                      {order.status === OrderStatus.CONFIRMED && (
                          <button 
                              type="button"
                              onClick={() => updateOrderStatus(order.id, OrderStatus.SHIPPED)}
                              className="flex-1 sm:flex-none px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 shadow-sm"
                          >
                              Mark Shipped
                          </button>
                      )}
                      {order.status === OrderStatus.SHIPPED && (
                          <>
                              <button 
                                  type="button"
                                  onClick={() => updateOrderStatus(order.id, OrderStatus.DELIVERED)}
                                  className="flex-1 sm:flex-none px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow-sm"
                              >
                                  Delivered
                              </button>
                              <button 
                                  type="button"
                                  onClick={() => updateOrderStatus(order.id, OrderStatus.RETURNED)}
                                  className="flex-1 sm:flex-none px-3 py-1 text-sm bg-rose-600 text-white rounded hover:bg-rose-700 shadow-sm"
                              >
                                  Returned
                              </button>
                          </>
                      )}
                    </div>

                    {/* Financial Indicators */}
                    {order.status === OrderStatus.DELIVERED && (
                        <span className="text-sm font-bold text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full text-center">+ {displayPrice} MAD</span>
                    )}
                    {order.status === OrderStatus.RETURNED && (
                        <span className="text-sm font-bold text-rose-600 px-3 py-1 bg-rose-50 rounded-full text-center">Loss Rec.</span>
                    )}

                    {/* Edit/Delete Controls */}
                    <div className="flex items-center gap-1 pl-2 border-l border-slate-100 ml-2">
                      <button 
                        type="button"
                        onClick={() => handleOpenEdit(order)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                        title="Edit Order"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleDelete(order.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                </div>
              </div>
            );
        })}
        {orders.length === 0 && (
          <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No orders yet. Add one to start tracking!</p>
          </div>
        )}
      </div>
    </div>
  );
};