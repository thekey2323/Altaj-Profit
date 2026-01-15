import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus, Order } from '../types';
import { CheckCircle, Truck, XCircle, Clock, Package, Plus, Trash2, Edit2, X, ExternalLink, RefreshCw, AlertOctagon, MapPin, Minus } from 'lucide-react';

export const Orders: React.FC = () => {
  const { orders, updateOrderStatus, products, addOrder, updateOrder, deleteOrder } = useApp();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
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
      case OrderStatus.RETURNED_FREE: return 'bg-amber-50 text-amber-700 border-amber-200';
      case OrderStatus.RETURNED_PAID: return 'bg-rose-50 text-rose-700 border-rose-200';
      case OrderStatus.LOST_DAMAGED: return 'bg-gray-800 text-white border-gray-600';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return Clock;
      case OrderStatus.CONFIRMED: return CheckCircle;
      case OrderStatus.SHIPPED: return Truck;
      case OrderStatus.DELIVERED: return Package;
      case OrderStatus.RETURNED_FREE: return RefreshCw;
      case OrderStatus.RETURNED_PAID: return XCircle;
      case OrderStatus.LOST_DAMAGED: return AlertOctagon;
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setCustomerName('');
    setCity('');
    const defaultProduct = products.length > 0 ? products[0] : null;
    setProductId(defaultProduct ? defaultProduct.id : '');
    setQuantity(1);
    setStatus(OrderStatus.PENDING);
    setDate(new Date().toISOString().split('T')[0]);
    
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
    setCity(order.city || '');
    setProductId(order.productId);
    setQuantity(order.quantity || 1);
    setStatus(order.status);
    setDate(order.date);
    
    const product = products.find(p => p.id === order.productId);
    setFinalPrice(order.finalPrice?.toString() ?? (product ? (product.price * (order.quantity || 1)).toString() : '0'));
    setManualShippingCost(order.manualShippingCost?.toString() ?? product?.shippingCost.toString() ?? '0');
    
    setIsModalOpen(true);
  };

  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    const product = products.find(p => p.id === newProductId);
    if (product) {
        setFinalPrice((product.price * quantity).toString());
        setManualShippingCost(product.shippingCost.toString());
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
    
    // Auto-update price if a product is selected
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            setFinalPrice((product.price * newQuantity).toString());
        }
    }
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
      setStatus(newStatus);
      // Auto-logic for Return Costs
      if (newStatus === OrderStatus.RETURNED_FREE) {
          // Rule: Free returns have 0 shipping cost
          setManualShippingCost('0');
      } else if (newStatus === OrderStatus.RETURNED_PAID && productId) {
          // Rule: Paid returns pay shipping (default to product avg)
          const product = products.find(p => p.id === productId);
          if (product) setManualShippingCost(product.shippingCost.toString());
      }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrder(id);
      setIsModalOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    const orderData = {
      customerName,
      city,
      productId,
      quantity,
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

  const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const inputClass = "w-full p-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-slate-900 placeholder-slate-400";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Orders</h2>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Modify Order' : 'New Order'}</h3>
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
                <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputClass} placeholder="e.g. Ahmed Benali" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <div className="relative">
                  <input required type="text" value={city} onChange={e => setCity(e.target.value)} className={`${inputClass} pl-8`} placeholder="e.g. Casablanca" />
                  <MapPin className="w-4 h-4 absolute left-2.5 top-3 text-slate-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  value={status}
                  onChange={e => handleStatusChange(e.target.value as OrderStatus)}
                  className={inputClass}
                >
                  <option value={OrderStatus.PENDING}>Pending</option>
                  <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                  <option value={OrderStatus.SHIPPED}>Shipped</option>
                  <option value={OrderStatus.DELIVERED}>Delivered</option>
                  <option disabled>---</option>
                  <option value={OrderStatus.RETURNED_FREE}>Refused (Free Return)</option>
                  <option value={OrderStatus.RETURNED_PAID}>Refused (Paid Return)</option>
                  <option value={OrderStatus.LOST_DAMAGED}>Lost / Damaged</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Product</label>
                </div>
                <select required value={productId} onChange={e => handleProductChange(e.target.value)} className={inputClass}>
                  <option value="" disabled>Select a product...</option>
                  {products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-600 transition"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 text-center font-bold text-lg text-slate-800 bg-slate-50 border border-slate-200 py-1.5 rounded-md">
                        {quantity}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-600 transition"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Financial Specifics</div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Total Revenue</label>
                    <div className="relative">
                        <input required type="number" value={finalPrice} onChange={e => setFinalPrice(e.target.value)} className={`${inputClass} pl-6`} />
                        <span className="absolute left-2 top-2.5 text-slate-400 text-xs">DH</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Shipping Cost</label>
                    <div className="relative">
                        <input required type="number" value={manualShippingCost} onChange={e => setManualShippingCost(e.target.value)} className={`${inputClass} pl-6`} />
                        <span className="absolute left-2 top-2.5 text-slate-400 text-xs">DH</span>
                    </div>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
              </div>
              
              <div className="pt-6 flex flex-col-reverse gap-3 sm:flex-row">
                 {editingId && (
                    <button type="button" onClick={(e) => handleDelete(editingId, e)} className="px-4 py-3 sm:py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition flex items-center justify-center gap-2 font-medium w-full sm:w-auto">
                      <Trash2 className="w-5 h-5" /> Delete
                    </button>
                 )}
                <div className="flex-1"></div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 sm:py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-center">Cancel</button>
                    <button type="submit" className="flex-1 px-6 py-3 sm:py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition font-medium text-center">{editingId ? 'Update' : 'Create'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {sortedOrders.map(order => {
            const product = products.find(p => p.id === order.productId);
            const StatusIcon = getStatusIcon(order.status);
            const qty = order.quantity || 1;
            
            return (
              <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                   <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(order.status)} min-w-[150px] justify-center`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="font-semibold text-xs whitespace-nowrap">{order.status}</span>
                   </div>
                   <div className="border-l border-slate-200 pl-4">
                      <div className="font-medium text-slate-800">{order.customerName}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                           {product?.name} 
                           {qty > 1 && <span className="bg-slate-800 text-white text-[10px] px-1.5 rounded-full font-bold">x{qty}</span>}
                        </span>
                        {order.city && (
                          <>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {order.city}</span>
                          </>
                        )}
                      </div>
                   </div>
                </div>
                <button type="button" onClick={() => handleOpenEdit(order)} className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 rounded-lg transition font-medium shadow-sm">
                    <Edit2 className="w-4 h-4" /> Modify
                </button>
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