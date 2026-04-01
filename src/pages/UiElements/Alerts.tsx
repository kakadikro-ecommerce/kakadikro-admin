import React, { useEffect } from 'react';
import { X, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      container: "border-[#3E2723] bg-[#faf7f2]", 
      iconBg: "bg-[#3E2723]",
      titleColor: "text-[#3E2723]",
      title: "Success",
      icon: <CheckCircle2 size={18} color="white" />
    },
    error: {
      container: "border-[#b32b2b] bg-[#fff5f5]",
      iconBg: "bg-[#b32b2b]",
      titleColor: "text-[#b32b2b]",
      title: "Error",
      icon: <X size={18} color="white" />
    },
    warning: {
      container: "border-[#9D5425] bg-[#fdfaf7]",
      iconBg: "bg-[#9D5425]",
      titleColor: "text-[#9D5425]",
      title: "Warning",
      icon: <AlertTriangle size={18} color="white" />
    },
    info: {
      container: "border-[#3b82f6] bg-[#eff6ff]",
      iconBg: "bg-[#3b82f6]",
      titleColor: "text-[#1d4ed8]",
      title: "Information",
      icon: <Info size={18} color="white" />
    }
  };

  const current = config[type];

  return (
    <>
      <style>{`
        @keyframes shrinkLine {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-line {
          animation: shrinkLine 4s linear forwards;
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[10000] w-full max-w-[380px] animate-in slide-in-from-right duration-300">
        <div className={`flex w-full border-l-[6px] shadow-2xl rounded-2xl overflow-hidden bg-white p-5 items-start relative ${current.container}`}>
          
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 mt-0.5 ${current.iconBg}`}>
            {current.icon}
          </div>

          <div className="ml-4 w-full pr-6">
            <h5 className={`text-[13px] font-black uppercase tracking-widest mb-1 ${current.titleColor}`}>
              {current.title}
            </h5>
            <p className="text-sm font-bold text-gray-600 leading-snug">
              {message}
            </p>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/5">
            <div 
              className={`h-full animate-line ${current.iconBg}`} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Alert;