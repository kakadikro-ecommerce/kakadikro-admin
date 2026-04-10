import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import LOGO from '../../images/logo/kde-logo-1.png';
import logo2 from '../../images/logo/kaka-dikro-icon.png';
import { logout } from '../../store/modules/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const sidebarRef = useRef<HTMLElement>(null);

  const newUsers = useAppSelector((state) => state.admin?.newCount ?? 0);
  const newProducts = useAppSelector((state) => state.products?.newCount ?? 0);
  const newAdmins = 0;
  const newOrders = useAppSelector((state) => state.orders?.newCount ?? 0);
  const newContacts = useAppSelector((state) => state.contacts?.newCount ?? 0);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebarRef.current || !sidebarOpen || sidebarRef.current.contains(target as Node)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logout());
    setSidebarOpen(false);
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', name: 'Dashboard', icon: <DashboardIcon />, badge: 0 },
    { id: 'admins', path: '/admins', name: 'Admins', icon: <AdminIcon />, badge: newAdmins },
    { id: 'users', path: '/users', name: 'Users', icon: <UsersIcon />, badge: newUsers }, 
    { id: 'products', path: '/products', name: 'Products', icon: <ProductsIcon />, badge: newProducts },
    { id: 'orders', path: '/orders', name: 'Orders', icon: <OrdersIcon />, badge: newOrders },
    { id: 'contacts', path: '/contacts', name: 'Contacts', icon: <ContactsIcon />, badge: newContacts },
    { id: 'payments', path: '/payments', name: 'Payments', icon: <PaymentsIcon />, badge: 0 },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-[9999] flex h-screen flex-col bg-[#EFE4D5] border-r border-[#D7C4A9] transition-all duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarExpanded ? 'w-72' : 'lg:w-20'}`}
      >
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="hidden lg:flex absolute -right-3 top-9 z-[10000] items-center justify-center w-7 h-7 rounded-full bg-[#D7C4A9] text-white hover:bg-[#A68F7B] transition-all shadow-md border border-white"
        >
          <svg className={`w-4 h-4 transition-transform ${!sidebarExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={`flex items-center min-h-[120px] transition-all duration-300 ${sidebarExpanded ? 'px-6' : 'justify-center'}`}>
          <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)} className="block w-full">
            {sidebarExpanded ? (
              <img src={LOGO} alt="Logo" className="h-36 w-full object-contain" />
            ) : (
              <img src={logo2} alt="Icon" className="h-10 w-10 object-contain mx-auto" />
            )}
          </NavLink>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl transition-all duration-200 ${
                      sidebarExpanded ? 'px-4 py-3' : 'justify-center py-3'
                    } ${isActive ? 'bg-white/60 text-black shadow-sm' : 'text-black hover:bg-[#F2EAE0]'}`
                  }
                >
                  <div className="relative shrink-0 transition-transform group-hover:scale-110">
                    {item.icon}
                    {!sidebarExpanded && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3E2723] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3E2723]"></span>
                      </span>
                    )}
                  </div>

                  <span className={`flex-1 whitespace-nowrap font-bold transition-opacity duration-300 ${!sidebarExpanded ? 'hidden' : 'block'}`}>
                    {item.name}
                  </span>

                  {sidebarExpanded && item.badge > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[#3E2723] text-[#EFE4D5] text-[10px] font-bold rounded-md shadow-sm">
                      +{item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-8 border-t border-[#D7C4A9]">
            <button
              onClick={handleLogout}
              className={`group flex w-full items-center gap-3 rounded-xl text-black font-bold transition-all hover:bg-red-50 hover:text-red-600 ${sidebarExpanded ? 'px-4 py-3' : 'justify-center py-3'}`}
            >
              <span className="shrink-0"><LogoutIcon /></span>
              <span className={`${!sidebarExpanded ? 'hidden' : 'block'} font-bold`}>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

const DashboardIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h4v4H4V6zm10 0h4v4h-4V6zM4 16h4v4H4v-4zm10 0h4v4h-4v-4z" /></svg>);
const AdminIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>);
const UsersIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const ProductsIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>);
const OrdersIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>);
const ContactsIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
const PaymentsIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>);
const LogoutIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);

export default Sidebar;
