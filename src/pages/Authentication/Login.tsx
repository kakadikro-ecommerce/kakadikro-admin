import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'; 

import woodBg from '../../images/brand/login bg image.jpg';
import Logo from '../../images/logo/kde-logo-1.png';
import { authService } from '../../services/authService';

import 'react-toastify/dist/ReactToastify.css';
import '../../css/style.css'; 

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password', { className: 'custom-toast custom-toast-error' });
      return;
    }

    setIsLoading(true);
    try {
      const axiosInstance = (await import('../../services/axiosInstance')).default;
      const response = await axiosInstance.post('/auth/login', { email, password });
      let token = response.data.token || response.data.data?.token || response.data.accessToken;

      if (!token) throw new Error('Token not found');

      localStorage.setItem('token', token);
      const userToSave = response.data.user || { email, name: response.data.name };
      localStorage.setItem('user', JSON.stringify(userToSave));

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      toast.success(`Welcome back! Login successful`, { className: 'custom-toast custom-toast-success' });
      setTimeout(() => navigate('/dashboard', { replace: true }), 500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed', { className: 'custom-toast custom-toast-error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (authService.isAuthenticated()) return null;

  return (
    <div className="login-container min-h-screen w-full flex items-center justify-center bg-stone-50 p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-6xl md:h-[85vh] bg-white rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-stone-100">
        
        {/* LEFT: FORM */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
          <div className="w-full max-w-sm">
            <h1 className="text-4xl font-black text-stone-900 mb-2">Login</h1>
            <p className="text-[#7A330F] font-bold mb-8 uppercase tracking-widest text-xs">
              Rasoi ma umeryo asli swaad!
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* EMAIL INPUT */}
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">Email Address</label>
                <div className="relative flex items-center group">
                  <div className="absolute left-4 text-stone-400 group-focus-within:text-[#7A330F] transition-colors z-10">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-[#7A330F] focus:bg-white transition-all overflow-hidden text-ellipsis"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD INPUT */}
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">Password</label>
                <div className="relative flex items-center group">
                  <div className="absolute left-4 text-stone-400 group-focus-within:text-[#7A330F] transition-colors z-10">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-14 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-[#7A330F] focus:bg-white transition-all overflow-hidden text-ellipsis"
                    required
                  />
                  {/* Eye Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-stone-400 hover:text-[#7A330F] z-20 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#7A330F] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#5e270b] transition-all shadow-xl shadow-[#7A330F]/20 disabled:opacity-50"
              >
                {isLoading ? "Authenticating..." : "Login"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: BRANDING */}
        <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center relative overflow-hidden">
          <img src={woodBg} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/30 z-10"></div>
          <div className="relative z-20 text-center px-6">
            <img src={Logo} alt="Logo" className="w-44 mb-6 mx-auto" />
            <h2 className="text-3xl font-black leading-tight text-stone-900">
              Swad ni <br />
              <span className="text-[#7A330F] italic font-medium">Asli Pehchaan.</span>
            </h2>
          </div>
        </div>

      </div>
    </div>
  );
}