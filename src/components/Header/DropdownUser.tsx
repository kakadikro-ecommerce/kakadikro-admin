import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, User2 } from 'lucide-react';
import ClickOutside from '../ClickOutside';
import ProfileModal from '../Tables/Admin/ProfileModal';
import { logout } from '../../store/modules/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const authUser = useAppSelector((state) => state.auth.user);

  const user = {
    name: authUser?.name || 'Admin',
    email: authUser?.email || 'admin@system.com',
    role: authUser?.role || 'admin',
  };

  const firstLetter = (user.name?.charAt(0) || 'A').toUpperCase();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    setIsProfileOpen(true);
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <>
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-4 group cursor-pointer"
        >
          <span className="hidden text-right lg:block">
            <span className="block text-xs md:text-sm font-bold text-[#3E2723] tracking-tight">
              {user.name}
            </span>
            <span className="block text-[10px] md:text-[12px] font-bold tracking-tight uppercase text-[#4338ca] tracking-widest mt-0.5">
              {user.role.replace('_', ' ')}
            </span>
          </span>

          <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#3E2723] text-white font-bold text-lg shadow-md transition-transform group-hover:scale-105">
            {firstLetter}
          </div>

          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-4 w-64 max-sm:w-[90vw] max-sm:right-2 flex flex-col rounded-2xl border border-gray-100 bg-white shadow-2xl z-[10000] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            <div className="px-5 py-5 bg-[#faf7f2]/50 border-b border-gray-100">
              <p className="truncate text-xs md:text-sm font-bold text-[#3E2723] tracking-tight">
                {user.name}
              </p>
              <p className="truncate text-xs md:text-sm font-bold text-[#A68F7B] tracking-widest mt-0.5">
                {user.email}
              </p>
            </div>

            <div className="p-2">
              <button
              onClick={handleProfile}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-sm md:text-base font-bold tracking-widest text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <User2 size={16} /> Get Profile
              </button>
            </div>

            <div className="p-2 pt-0">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-sm md:text-base font-bold tracking-widest text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>

          </div>
        )}

        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      </>
    </ClickOutside>
  );
};

export default DropdownUser;
