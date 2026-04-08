import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  UserPlus,
  Eye,
  ShoppingCart,
  Mail,
} from 'lucide-react';

import adminService from '../../services/admin-api';
import getAllProducts from '../../services/products-api';
import orders from '../../services/Orders-api';
import { normalizeOrderStatus, type Order } from '../../services/Orders-api';
import { contactService } from '../../services/contacts-api';

type PercentageKey = 'users' | 'products' | 'orders' | 'payments' | 'contacts';

const ECommerce: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalPayments: 0,
    totalContacts: 0,
  });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);

  const [percentages, setPercentages] = useState({
    users: 0,
    products: 0,
    orders: 0,
    payments: 0,
    contacts: 0,
  });

  useEffect(() => {
    const intervals: ReturnType<typeof setInterval>[] = [];

    const animatePercentage = (key: PercentageKey) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / 1200) * 100);
        setPercentages((prev) => ({ ...prev, [key]: Math.floor(progress) }));
        if (progress >= 100) clearInterval(interval);
      }, 16);
      intervals.push(interval);
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        (Object.keys(percentages) as PercentageKey[]).forEach((key) =>
          animatePercentage(key),
        );

        const [uRes, pRes, cRes, oRes] = await Promise.all([
          adminService.getAllUsers(1, 5, undefined, 'user'),
          getAllProducts(1, 5),
          contactService.adminGetAll(1, 5),
          orders.getAllOrders(1, 5),
        ]);

        setStats({
          totalUsers: uRes.pagination?.total || uRes.total || 0,
          totalProducts: pRes.pagination?.total || pRes.total || 0,
          totalContacts: cRes.pagination?.total || cRes.total || cRes.contacts?.length || 0,
          totalOrders: oRes.pagination?.total || oRes.total || 0,
          totalPayments: 0,
        });

        setRecentUsers(uRes.users || []);
        setRecentProducts(pRes.products || []);
        setRecentOrders(oRes.orders || []);
        setRecentContacts(cRes.contacts || []);
      } catch (error) {
        console.error('Dashboard Fetch Error:', error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchData();
    return () => intervals.forEach(clearInterval);
  }, []);

  const cards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, route: '/users', sub: 'Active accounts', pKey: 'users' },
    { title: 'Total Products', value: stats.totalProducts, icon: Package, route: '/products', sub: 'In stock', pKey: 'products' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, route: '/orders', sub: 'Placed orders', pKey: 'orders' },
    { title: 'Total Payments', value: stats.totalPayments, icon: CreditCard, route: '/payments', sub: 'Revenue', pKey: 'payments' },
    { title: 'Total Contacts', value: stats.totalContacts, icon: MessageSquare, route: '/contacts', sub: 'Messages', pKey: 'contacts' },
  ];

  return (
    <div className="space-y-8 bg-[#FFF9F0] p-4 md:p-6 rounded-xl min-h-screen font-sans">

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => !loading && navigate(card.route)}
            className={`relative p-4 rounded-2xl shadow-sm transition-all bg-gradient-to-br from-[#F5E6D3] to-[#EFE4D5] border border-white/50 ${loading ? 'cursor-wait' : 'cursor-pointer hover:scale-[1.03] hover:shadow-md'
              }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-white/50 rounded-lg mb-2">
                <card.icon className="w-5 h-5 text-[#5C3E2E]" />
              </div>
              <p className="text-[10px] font-bold text-[#8B5A2B] uppercase mb-1 tracking-wider">{card.title}</p>
              {loading ? (
                <NumberLoader percentage={percentages[card.pKey as keyof typeof percentages]} />
              ) : (
                <p className="text-2xl font-bold text-[#5C3E2E]">{card.value.toLocaleString()}</p>
              )}
              <p className="text-[9px] font-medium text-[#A67B45] mt-1 opacity-70">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <DashboardTable title="Recent Users" icon={<UserPlus size={18} />} onViewAll={() => navigate('/users')} loading={loading}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FDF9F2] border-b border-[#E8DBC8]">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-[#8B5A2B] uppercase">Name</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#8B5A2B] uppercase">Email</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#8B5A2B] uppercase text-center">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8DC]">
              {recentUsers.map((u, idx) => (
                <tr key={idx} className="hover:bg-[#FAF6F0] transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-[#5C3E2E]">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-[#A67B45] font-bold truncate max-w-[120px]">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E8DBC8] text-[#5C3E2E] uppercase border border-[#D7C4A9]">
                      {u.role || 'User'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardTable>

        <DashboardTable title="Recent Products" icon={<Package size={18} />} onViewAll={() => navigate('/products')} loading={loading}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FDF9F2] border-b border-[#E8DBC8]">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-[#8B5A2B] uppercase">Name</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#8B5A2B] uppercase">Category</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#8B5A2B] uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8DC]">
              {recentProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-[#FAF6F0] transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-[#5C3E2E]">{p.name}</td>
                  <td className="px-4 py-3 text-xs text-[#A67B45] font-bold">{p.category || 'General'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${p.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                      {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardTable>

        <DashboardTable title="Recent Orders" icon={<ShoppingCart size={18} />} onViewAll={() => navigate('/orders')} loading={loading}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F3E5D3]/50 border-b border-[#E8DBC8]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-[#8B5A2B] uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#8B5A2B] uppercase tracking-wider">Customer</th>
                <th className="px-4 py-4 text-[10px] font-bold text-[#8B5A2B] uppercase text-center tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8DC]">
              {recentOrders.length > 0 ? (
                recentOrders.map((o, idx) => (
                  <tr key={o._id || idx} className="hover:bg-[#FAF6F0] transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-[#5C3E2E]">
                      {o.orderNumber || `#${o._id?.slice(-6).toUpperCase() || 'N/A'}`}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#A67B45]">
                      {o.user?.name || o.shippingAddress?.fullName || 'Guest'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-tighter ${normalizeOrderStatus(o.orderStatus) === 'delivered'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : normalizeOrderStatus(o.orderStatus) === 'cancelled'
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : normalizeOrderStatus(o.orderStatus) === 'dispatched'
                              ? 'bg-blue-50 text-blue-600 border-blue-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                        {normalizeOrderStatus(o.orderStatus).toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-xs text-[#A67B45] italic opacity-60">No recent orders.</td></tr>
              )}
            </tbody>
          </table>
        </DashboardTable>

        <DashboardTable title="Recent Contacts" icon={<Mail size={18} />} onViewAll={() => navigate('/contacts')} loading={loading}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FDF9F2] border-b border-[#E8DBC8]">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-[#8B5A2B] uppercase">Name</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#8B5A2B] uppercase">Email</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#8B5A2B] uppercase text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8DC]">
              {recentContacts.map((c, idx) => (
                <tr key={idx} className="hover:bg-[#FAF6F0] transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-[#5C3E2E]">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-[#A67B45] truncate font-bold max-w-[150px]">{c.email}</td>
                  <td className="px-4 py-3 text-right text-sm text-[#8B5A2B] font-bold">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardTable>

      </div>
    </div>
  );
};


const NumberLoader = ({ percentage }: { percentage: number }) => (
  <div className="w-full flex flex-col items-center">
    <div className="w-20 h-1.5 bg-[#E8DBC8] rounded-full overflow-hidden mb-1">
      <div className="h-full bg-[#5C3E2E] transition-all duration-300" style={{ width: `${percentage}%` }} />
    </div>
    <span className="text-[10px] font-bold text-[#A67B45]">{percentage}%</span>
  </div>
);

const DashboardTable: React.FC<{
  title: string;
  icon: React.ReactNode;
  onViewAll: () => void;
  loading: boolean;
  children: React.ReactNode;
}> = ({ title, icon, onViewAll, loading, children }) => (
  <div className="rounded-2xl shadow-sm border border-[#E8DBC8] overflow-hidden bg-white flex flex-col">
    <div className="px-5 py-4 bg-gradient-to-r from-[#F5E6D3] to-[#EFE4D5] flex items-center justify-between border-b border-[#E8DBC8]">
      <div className="flex items-center gap-2">
        <div className="text-[#5C3E2E]">{icon}</div>
        <h3 className="text-sm font-bold text-[#5C3E2E] uppercase tracking-wider">{title}</h3>
      </div>
      <button onClick={onViewAll} className="flex items-center gap-1.5 px-3 py-1 bg-white/80 hover:bg-white text-[#5C3E2E] rounded-lg text-[10px] font-bold border border-[#D7C4A9] transition-all active:scale-95 shadow-sm">
        <Eye size={12} /> VIEW ALL
      </button>
    </div>
    <div className="overflow-x-auto flex-grow min-h-[280px]">
      {loading ? (
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-[#FAF6F0] rounded-lg animate-pulse border border-[#F0E8DC]" />
          ))}
        </div>
      ) : children}
    </div>
  </div>
);

export default ECommerce;
