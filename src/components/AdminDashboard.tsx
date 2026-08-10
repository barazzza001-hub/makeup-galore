import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShoppingBag,
  Package,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  RefreshCw,
  Bell,
  X,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Save,
  Lock,
} from 'lucide-react';
import { Product, Order, OrderStatus, BusinessSettings, UserAccount } from '../types';
import { subscribeToProducts, deleteProductFromFirestore } from '../services/productService';
import { subscribeToAllOrders, updateOrderStatus } from '../services/orderService';
import { fetchBusinessSettings, updateBusinessSettings } from '../services/businessService';
import { ProductFormModal } from './ProductFormModal';
import { showJulietToast } from './ToastNotification';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'settings'>('orders');

  // Real-time Firestore state
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  // Modal / Editing states
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Form states for business settings
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [physicalLocation, setPhysicalLocation] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Real-time subscriber for orders
    const unsubscribeOrders = subscribeToAllOrders((allOrders) => {
      setOrders(allOrders);
    });

    // Real-time subscriber for products
    const unsubscribeProducts = subscribeToProducts((allProducts) => {
      setProducts(allProducts);
    });

    // Fetch business settings
    fetchBusinessSettings().then((bs) => {
      setSettings(bs);
      setBusinessName(bs.businessName);
      setPhone(bs.phone);
      setWhatsapp(bs.whatsapp);
      setEmail(bs.email);
      setPhysicalLocation(bs.physicalLocation);
      setDeliveryInfo(bs.deliveryInfo);
      setInstagram(bs.instagram);
      setTiktok(bs.tiktok);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const newOrdersCount = orders.filter((o) => o.status === 'NEW').length;

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name} from inventory?`)) {
      await deleteProductFromFirestore(productId);
      showJulietToast(`Deleted ${name} from inventory`, 'info');
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    showJulietToast(`Order #${orderId} status updated to ${status}`, 'success');
  };

  const handleSaveBusinessSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateBusinessSettings({
        businessName,
        phone,
        whatsapp,
        email,
        physicalLocation,
        deliveryInfo,
        instagram,
        tiktok,
      });
      showJulietToast('Business contact details updated! ✨', 'success');
    } catch (err) {
      console.error(err);
      showJulietToast('Error updating business settings', 'info');
    } finally {
      setSavingSettings(false);
    }
  };

  // Security gate check (allow if admin role)
  const isAdminAuthorized = currentUser?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-5 shadow-2xl border border-pink-100 relative space-y-4 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-pink-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-base text-gray-900 leading-tight">
                  Business Owner Admin Portal
                </h3>
                {newOrdersCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full animate-bounce">
                    {newOrdersCount} NEW ORDERS
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-pink-600 font-medium">
                Juliet's Makeup Galore Store & Inventory Management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAdminAuthorized ? (
          /* Non-Admin Notice & Demo Admin Access Switch */
          <div className="p-6 text-center space-y-3 my-auto">
            <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">Admin Access Security Gate</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Logged in as <span className="font-bold text-gray-800">{currentUser?.email || 'Customer'}</span>. Only authenticated store administrators can manage products, pricing, and live customer orders.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  showJulietToast('Demo mode: Authorized as Admin for this session!', 'success');
                  if (currentUser) {
                    currentUser.role = 'admin';
                  }
                  setActiveTab('orders');
                }}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Access Admin Portal (Store Owner View)
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-pink-50 p-1 rounded-2xl border border-pink-100 text-xs shrink-0">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-white text-pink-600 shadow-2xs border border-pink-100'
                    : 'text-gray-600 hover:text-pink-600'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Customer Orders</span>
                {newOrdersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">
                    {newOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-white text-pink-600 shadow-2xs border border-pink-100'
                    : 'text-gray-600 hover:text-pink-600'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Product Inventory ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-white text-pink-600 shadow-2xs border border-pink-100'
                    : 'text-gray-600 hover:text-pink-600'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Business Settings</span>
              </button>
            </div>

            {/* TAB CONTENT CONTAINER */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {/* TAB 1: CUSTOMER ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Showing all real-time customer orders from Firestore</span>
                    <span className="font-bold text-gray-800">{orders.length} total orders</span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <ShoppingBag className="w-8 h-8 text-pink-300 mx-auto" />
                      <p className="text-xs text-gray-500 font-medium">No customer orders yet ♡</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3.5 rounded-2xl bg-white border border-pink-200 shadow-2xs space-y-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-pink-100 pb-2">
                          <div>
                            <span className="font-serif font-bold text-sm text-gray-900">
                              Order #{order.id}
                            </span>
                            <span className="text-[10px] text-gray-500 block">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-600">Status:</span>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              className="px-2.5 py-1 rounded-xl font-bold text-xs bg-pink-50 border border-pink-200 text-pink-700 outline-none cursor-pointer"
                            >
                              <option value="NEW">NEW</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PACKED">PACKED</option>
                              <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </div>
                        </div>

                        {/* Customer Contact Details */}
                        <div className="grid grid-cols-2 gap-2 bg-pink-50/40 p-2.5 rounded-xl border border-pink-100/80 text-[11px]">
                          <div>
                            <span className="font-bold text-gray-900 block">{order.customerName}</span>
                            <span className="text-gray-600">{order.customerPhone}</span>
                            <span className="text-gray-500 block">{order.customerEmail}</span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">Delivery Location</span>
                            <span className="text-gray-700 leading-tight">{order.deliveryAddress}</span>
                            {order.deliveryInstructions && (
                              <span className="text-pink-600 italic block text-[10px] mt-0.5">
                                Note: {order.deliveryInstructions}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ordered Items Table */}
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11px]">
                              <span>
                                {item.productName} ({item.shade}) x{item.quantity}
                              </span>
                              <span className="font-bold">
                                KSh {(item.priceKSh * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-pink-100 font-bold text-xs">
                          <span>Total Amount:</span>
                          <span className="text-pink-600 text-sm">
                            KSh {order.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: PRODUCT INVENTORY */}
              {activeTab === 'inventory' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Manage live products, pricing, shades & stock
                    </span>

                    <button
                      onClick={() => {
                        setSelectedProductToEdit(null);
                        setIsProductModalOpen(true);
                      }}
                      className="py-1.5 px-3 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 rounded-2xl bg-white border border-pink-100 shadow-2xs flex items-center justify-between gap-3 text-xs"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-100 shrink-0">
                              {product.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600">
                            Price: <span className="font-bold text-gray-900">KSh {product.priceKSh.toLocaleString()}</span> | Stock: <span className="font-bold">{product.stock ?? 20}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedProductToEdit(product);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg cursor-pointer"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: BUSINESS SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveBusinessSettings} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-700">Business Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-pink-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-700">Phone Care</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-pink-200 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-gray-700">WhatsApp Number</label>
                      <input
                        type="text"
                        required
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-pink-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-gray-700">Support Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-pink-200 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-gray-700">Physical Location</label>
                    <input
                      type="text"
                      required
                      value={physicalLocation}
                      onChange={(e) => setPhysicalLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-pink-200 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-gray-700">Delivery Information & Policy</label>
                    <textarea
                      rows={2}
                      required
                      value={deliveryInfo}
                      onChange={(e) => setDeliveryInfo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-pink-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-700">Instagram Handle</label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-pink-200 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-gray-700">TikTok Handle</label>
                      <input
                        type="text"
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-pink-200 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full py-3 bg-pink-600 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-pink-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? 'Saving...' : 'Save Business Settings to Firestore'}</span>
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        {/* Product Edit / Add Modal */}
        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          productToEdit={selectedProductToEdit}
          onSaveSuccess={() => {
            // Subscription auto updates products
          }}
        />
      </div>
    </div>
  );
};
