import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import woodBg from '../../images/brand/register.webp';
import { login } from '../../store/modules/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/style.css';
import { loginSchema } from '../../validations/adminValidation';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, status } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = status === 'loading';
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const loginSubmittedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !loginSubmittedRef.current) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginSubmittedRef.current = true;

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      loginSubmittedRef.current = false;
      return;
    }
    setErrors({});

    try {
      await dispatch(login({ email, password })).unwrap();
      toast.success(`Welcome back! Login successful`, {
        className: 'custom-toast custom-toast-success',
        position: 'top-right',
        autoClose: 2500,
      });

      setTimeout(() => navigate('/dashboard', { replace: true }), 2200);
    } catch (error: any) {
      setErrors({
        password: String(error) || "Login failed",
      });
      loginSubmittedRef.current = false;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone-100 px-3">
      <ToastContainer position="top-right" autoClose={2500} newestOnTop closeOnClick pauseOnFocusLoss={false} />

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">

        <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-xs">

            <h1 className="text-xl md:text-2xl font-bold text-stone-900 mb-2 text-center md:text-left">
              Welcome Back !
            </h1>
            <p className="text-sm text-stone-500 mb-6 text-center md:text-left">
              Sign in to access your account
            </p>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Email
                </label>

                <div className="relative mb-8">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className={`w-full pl-10 pr-3 py-4 text-sm bg-stone-50 border rounded-lg outline-none transition
        ${errors.email ? "border-red-500" : "border-stone-200 focus:border-[#7A330F]"}`}
                  />
                </div>

                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Password
                </label>

                <div className="relative mb-8">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={`w-full pl-10 pr-10 py-4 text-sm bg-stone-50 border rounded-lg outline-none transition
        ${errors.password ? "border-red-500" : "border-stone-200 focus:border-[#7A330F]"}`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#7A330F] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#5e270b] transition disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Login"}
              </button>
            </form>
          </div>
        </div>

        <div className="w-full md:w-1/2 h-32 md:h-auto relative hidden md:block">
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
