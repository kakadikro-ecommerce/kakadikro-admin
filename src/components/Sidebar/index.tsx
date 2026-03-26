import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
 
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}
 
interface MenuItem {
  id: string;
  path?: string;
  name: string;
  icon: React.ReactNode;
  badge?: string;
  subItems?: { path: string; name: string }[];
}
 
const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
 
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);
  const toggleButton = useRef<any>(null);
 
  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );
 
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
 
  // Safe user data parsing - FIXED
  const userData = (() => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : {};
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  })();
 
  const userName = userData.name || userData.email?.split('@')[0] || 'Admin';
  const userEmail = userData.email || 'admin@example.com';
  const userInitial = userName.charAt(0).toUpperCase();
 
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target) ||
        toggleButton.current?.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen]);
 
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen]);
 
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);
 
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
 
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };
 
  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };
 
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    authService.logout();
    navigate('/login', { replace: true });
  };
 
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      path: '/dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    },
    {
      id: 'users',
      path: '/users',
      name: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 11.148A6.002 6.002 0 0118 16.5V17h-4v-2.5c0-1.047-.257-2.034-.713-2.906a8.097 8.097 0 00-.357-.446zM2 16.5V17h10v-2.5a6 6 0 00-10 0z" />
          <path d="M15 11.5c0-.538-.066-1.06-.19-1.558A5.002 5.002 0 0115 11.5z" />
        </svg>
      ),
    },
    {
      id: 'products',
      path: '/products',
      name: 'Products',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      badge: '24',
    },
    {
      id: 'orders',
      path: '/orders',
      name: 'Orders',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      ),
      badge: '8',
    },
    {
      id: 'payments',
      path: '/payments',
      name: 'Payments',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v2H4V6zm0 4h12v2H4v-2zm0 4h12v2H4v-2z" clipRule="evenodd" />
          <path d="M6 12h2v2H6zM10 12h2v2h-2zM14 12h2v2h-2z" />
        </svg>
      ),
    },
    {
      id: 'forms',
      name: 'Forms',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      ),
      subItems: [
        { path: '/forms/form-elements', name: 'Form Elements' },
        { path: '/forms/form-layout', name: 'Form Layout' },
      ],
    },
  ];
 
  const Dropdown = ({ open, items }: { open: boolean; items: { path: string; name: string }[] }) => {
    if (!open) return null;
    return (
      <ul className="mt-2 mb-1 ml-12 space-y-1">
        {items.map((item, idx) => (
          <li key={idx}>
            <NavLink
              to={item.path}
              onClick={closeSidebarOnMobile}
              className={({ isActive }) =>
                `flex items-center rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                  isActive
                    ? 'text-amber-800 font-medium bg-amber-50'
                    : 'text-amber-600/70 hover:text-amber-800 hover:bg-amber-50/50'
                }`
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2"></span>
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    );
  };
 
  return (
    <>
      <button
        ref={toggleButton}
        onClick={handleToggleSidebar}
        className={`fixed top-6 left-6 z-[99999] flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105 lg:hidden ${
          sidebarOpen ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}
      >
        <svg className="w-6 h-6 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
 
      <aside
        ref={sidebar}
        className={`fixed left-0 top-0 z-9999 flex h-screen w-80 flex-col overflow-y-hidden bg-gradient-to-br from-[#faf7f0] to-[#f5efe3] shadow-2xl duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-amber-200/50">
          <NavLink
            to="/dashboard"
            className="transition-transform duration-300 hover:scale-105"
            onClick={closeSidebarOnMobile}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl blur-xl opacity-60"></div>
              <img
                src="/src/images/logo/logo2.png"
                alt="Logo"
                className="relative w-20 h-20 object-contain rounded-xl"
              />
            </div>
          </NavLink>
 
          <button
            ref={trigger}
            onClick={handleToggleSidebar}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100/50 hover:bg-amber-200/50 transition-all duration-300"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg
              className={`w-5 h-5 text-amber-700 transition-transform duration-300 ${
                !sidebarOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
 
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100/50 hover:bg-amber-200/50 transition-all duration-300"
          >
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
 
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4">
          <div className="mb-8">
            <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-amber-600/70">
              Main Navigation
            </h3>
            <ul className="space-y-1.5">
              {menuItems.map((item, idx) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isOpen = openDropdown === item.id;
               
                if (hasSubItems) {
                  return (
                    <li key={idx}>
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        className={`group relative flex items-center w-full gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          (item.path && (pathname === item.path || pathname.includes(item.path)))
                            ? 'bg-gradient-to-r from-amber-100 to-transparent text-amber-900 shadow-sm'
                            : 'text-amber-700/70 hover:bg-amber-100/50 hover:text-amber-900'
                        }`}
                      >
                        <span className={`transition-colors duration-200 ${
                          (item.path && (pathname === item.path || pathname.includes(item.path)))
                            ? 'text-amber-600'
                            : 'text-amber-500 group-hover:text-amber-600'
                        }`}>
                          {item.icon}
                        </span>
                        <span className="flex-1 text-left">{item.name}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {item.subItems && <Dropdown open={isOpen} items={item.subItems} />}
                    </li>
                  );
                }
               
                return (
                  <li key={idx}>
                    <NavLink
                      to={item.path || '/'}
                      onClick={closeSidebarOnMobile}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-100 to-transparent text-amber-900 shadow-sm'
                            : 'text-amber-700/70 hover:bg-amber-100/50 hover:text-amber-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={`transition-colors duration-200 ${
                            isActive
                              ? 'text-amber-600'
                              : 'text-amber-500 group-hover:text-amber-600'
                          }`}>
                            {item.icon}
                          </span>
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
 
          <div className="pt-4 border-t border-amber-200/50">
            <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-amber-600/70">
              Account
            </h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={handleLogout}
                  className="group relative flex items-center w-full gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 text-amber-700/70 hover:bg-amber-100/50 hover:text-amber-900"
                >
                  <span className="text-amber-500 group-hover:text-amber-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
 
        <div className="p-4 border-t border-amber-200/50 bg-gradient-to-r from-amber-50/50 to-transparent">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold shadow-md">
                {userInitial}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900 truncate">{userName}</p>
              <p className="text-xs text-amber-600/70 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
 
export default Sidebar;
 