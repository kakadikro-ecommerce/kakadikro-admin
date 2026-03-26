import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
// import woodBg from '../../images/brand/login bg image.jpg';
// import Logo from '../../images/logo/kde-logo-1.png';
import { authService } from '../../services/authService';

// CSS Imports
import 'react-toastify/dist/ReactToastify.css';
import '../../css/style.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);

    try {
      // Corrected dynamic import and axios call
      const axiosModule = await import('../../services/axiosInstance');
      const axiosInstance = axiosModule.default;
      
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      // Logic to extract token from various possible API structures
      let token = null;
      let userData = null;

      if (response.data.token) {
        token = response.data.token;
        userData = response.data.user || response.data.data?.user;
      } else if (response.data.data?.token) {
        token = response.data.data.token;
        userData = response.data.data.user;
      } else if (response.data.accessToken) {
        token = response.data.accessToken;
        userData = response.data.user;
      } else if (response.data.access_token) {
        token = response.data.access_token;
        userData = response.data.user;
      }

      if (!token) {
        throw new Error('Server did not return a valid authentication token.');
      }

      // Persist Session
      localStorage.setItem('token', token);
      
      const userToSave = userData || {
        email: email,
        name: response.data.name || response.data.user?.name,
      };
      localStorage.setItem('user', JSON.stringify(userToSave));

      // Update Axios Headers for immediate subsequent calls
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      toast.success(`Welcome ${userToSave.name || email.split('@')[0]}!`);

      // Brief delay for toast visibility before redirect
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 800);

    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        const message = error.response.data?.message || 'Invalid credentials';
        toast.error(message);
      } else {
        toast.error('Connection error. Please check your internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authService.isAuthenticated()) {
    return null;
  }

  return (
    <div className="login-container min-h-screen w-full flex items-center justify-center bg-white p-4">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="w-full max-w-6xl md:h-[85vh] bg-white rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-stone-100">
        
        {/* LEFT: FORM SECTION */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
          <div className="w-full max-w-sm">
            <h1 className="text-4xl font-black text-stone-900 mb-2">Login</h1>
            <p className="text-[#7A330F] font-bold mb-8 uppercase tracking-widest text-xs">
              Rasoi ma umeryo asli swaad!
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-[#7A330F] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-[#7A330F] transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#7A330F] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#5e270b] transition-all shadow-xl shadow-[#7A330F]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: BRANDING SECTION */}
        <div
          className="hidden md:flex md:w-1/2 flex-col items-center justify-center relative text-stone-900 bg-cover bg-center"
          // style={{ backgroundImage: `url("${woodBg}")` }}
        >
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-white/30"></div>

          <div className="relative z-10 text-center px-6">
            {/* <img src={Logo} alt="Logo" className="w-44 mb-6 mx-auto" /> */}
            <h2 className="text-3xl font-black leading-tight text-stone-900">
              Swad ni <br />
              <span className="text-[#7A330F] italic font-medium">
                Asli Pehchaan.
              </span>
            </h2>
            <div className="mt-6 w-16 h-1 bg-[#7A330F]/30 mx-auto rounded-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
}