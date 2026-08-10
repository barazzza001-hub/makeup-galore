import React, { useEffect, useState } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, PackageCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { fetchUserOrders } from '../services/orderService';

interface MyOrdersSectionProps {
  customerId: string;
}

export const MyOrdersSection: React.FC<MyOrdersSectionProps> = ({ customerId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadOrders = async () => {
    setLoading(true);
    const data = await fetchUserOrders(customerId);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    if (customerId) {
      loadOrders();
    }
  }, [customerId]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>ORDER RECEIVED</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>CONFIRMED</span>
          </span>
        );
      case 'PACKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <PackageCheck className="w-3 h-3" />
            <span>PACKED</span>
          </span>
        );
      case 'OUT FOR DELIVERY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800 border border-pink-200 animate-pulse">
            <Truck className="w-3 h-3" />
            <span>OUT FOR DELIVERY</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>DELIVERED</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <AlertCircle className="w-3 h-3" />
            <span>CANCELLED</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 border border-pink-100 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-pink-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-gray-900 leading-tight">
              My Orders & Purchase History
            </h3>
            <p className="text-[10px] text-gray-500">
              Track your recent makeup orders and delivery status
            </p>
          </div>
        </div>

        <button
          onClick={loadOrders}
          className="p-1.5 rounded-full text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
          title="Refresh orders"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-xs text-pink-500">
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-6 space-y-1">
          <p className="text-xs font-semibold text-gray-700">No recent orders found ♡</p>
          <p className="text-[10px] text-gray-400">
            When you purchase products from Juliet's Makeup Galore, your order history will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-3 rounded-2xl bg-pink-50/40 border border-pink-100 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900">#{order.id}</span>
                  <span className="text-[10px] text-gray-500 block">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="bg-white p-2 rounded-xl border border-pink-100/80 space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-gray-800">
                    <span className="font-medium truncate max-w-[200px]">
                      {item.productName} ({item.shade}) x{item.quantity}
                    </span>
                    <span className="font-bold text-gray-900">
                      KSh {(item.priceKSh * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] font-bold">
                <span className="text-gray-600">Total Paid / Payable:</span>
                <span className="text-pink-600 text-xs">
                  KSh {order.total.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
