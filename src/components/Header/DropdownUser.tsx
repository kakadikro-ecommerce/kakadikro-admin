import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import ClickOutside from '../ClickOutside';
import { logout } from '../../store/modules/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // 1. Get user from state
  const authUser = useAppSelector((state) => state.auth.user);

  // 2. Create a safe user object with fallbacks
  const user = {
    name: authUser?.name || 'Admin',
    email: authUser?.email || 'admin@system.com',
  };

  // 3. Optional chaining ensures .charAt(0) never runs on undefined
  const firstLetter = (user.name?.charAt(0) || 'A').toUpperCase();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <div
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4 group cursor-pointer"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-black text-[#3E2723] uppercase tracking-tight">
            {user.name}
          </span>
          <span className="block text-[10px] font-bold text-[#A68F7B] uppercase tracking-widest">
            {user.email}
          </span>
        </span>

        <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#3E2723] text-white font-black text-lg shadow-md transition-transform group-hover:scale-105">
          {firstLetter}
        </div>

        <ChevronDown 
          size={18} 
          className={`text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {dropdownOpen && (
        <div className="absolute right-0 mt-4 flex w-64 flex-col rounded-[1.5rem] border border-gray-100 bg-white shadow-2xl z-[10000] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-5 py-5 bg-[#faf7f2]/50 border-b border-gray-100">
             <p className="truncate text-sm font-black text-[#3E2723] uppercase tracking-tight">
                {user.name}
              </p>
              <p className="truncate text-[10px] font-bold text-[#A68F7B] uppercase tracking-widest mt-0.5">
                {user.email}
              </p>
          </div>
          <div className="p-2">
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-[11px] font-black uppercase tracking-widest text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
