import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

import woodBg from '../../images/brand/register.webp';
import { login } from '../../store/modules/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import 'react-toastify/dist/ReactToastify.css';
import '../../css/style.css';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, status } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isLoading = status === 'loading';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password', { className: 'custom-toast custom-toast-error' });
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();
      toast.success(`Welcome back! Login successful`, { className: 'custom-toast custom-toast-success' });
      setTimeout(() => navigate('/dashboard', { replace: true }), 500);
    } catch (error) {
      toast.error(String(error) || 'Login failed', { className: 'custom-toast custom-toast-error' });
    }
  };

  if (isAuthenticated) return null;

return (
  <div className="min-h-screen w-full flex items-center justify-center bg-stone-100 px-4">
    <ToastContainer position="top-right" autoClose={3000} />

    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
    
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-xs">
          
          <h1 className="text-2xl font-bold text-stone-900 mb-6 text-center md:text-left">
            Welcome Back
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:border-[#7A330F] focus:bg-white outline-none transition"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:border-[#7A330F] focus:bg-white outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#7A330F]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7A330F] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5e270b] transition disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      <div className="w-full md:w-1/2 h-40 md:h-auto relative">
        <img
          src={woodBg}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </div>
);
}
