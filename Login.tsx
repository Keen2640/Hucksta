
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      onLogin();
    }
  };

  return (
    <div className="h-full bg-white flex flex-col px-8 py-16 animate-in fade-in duration-500">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mt-20 mb-12 text-center">
        <h1 className="text-6xl font-black text-[#FF8C42] tracking-tighter mb-10">
          Hucksta
        </h1>
        <div className="space-y-1">
          <h2 className="text-[#FF8C42] text-xl font-bold tracking-tight">Create an account</h2>
          <p className="text-[#FFB380] text-sm font-medium">Enter your email to sign up for this app</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@domain.com"
            required
            className="w-full h-14 px-6 bg-gray-50 rounded-xl text-gray-800 border-none outline-none focus:bg-gray-100 transition-all placeholder-gray-300"
          />
        </div>
        
        <button
          type="submit"
          className="w-full h-14 bg-[#FF8C42] text-white font-bold rounded-xl active:scale-[0.98] transition-all hover:bg-[#e67a35] border-none outline-none shadow-none"
        >
          Continue
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-8">
        <div className="flex-1 h-[1px] bg-gray-100"></div>
        <span className="px-4 text-sm font-medium text-gray-400">or</span>
        <div className="flex-1 h-[1px] bg-gray-100"></div>
      </div>

      {/* Social Logins */}
      <div className="space-y-3">
        <button 
          onClick={onLogin}
          className="w-full h-14 bg-[#F2F2F2] flex items-center justify-center space-x-3 rounded-xl active:scale-[0.98] transition-all border-none outline-none shadow-none"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-[#FF8C42] font-bold text-sm">Continue with Google</span>
        </button>

        <button 
          onClick={onLogin}
          className="w-full h-14 bg-[#F2F2F2] flex items-center justify-center space-x-3 rounded-xl active:scale-[0.98] transition-all border-none outline-none shadow-none"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.96.95-2.44.83-3.41-.24-1.52-1.67-3.23-1.63-4.72 0-.97 1.07-2.45 1.19-3.41.24C2.85 17.65 2.13 11.51 5.35 7.42c1.62-2.07 4.01-3.2 6.54-3.15 2.53.05 4.92 1.25 6.54 3.15 3.22 4.09 2.5 10.23-1.38 12.86zM12 2.2c-.37-.73-1.25-1.21-2.22-1.19-.97.02-1.83.54-2.16 1.3.31.75 1.16 1.25 2.13 1.23.97-.02 1.83-.54 2.25-1.34z" />
          </svg>
          <span className="text-[#FF8C42] font-bold text-sm">Continue with Apple</span>
        </button>
      </div>

      {/* Footer Links */}
      <div className="mt-auto mb-4 text-center">
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-[280px] mx-auto">
          By clicking continue, you agree to our{' '}
          <a href="#" className="text-[#FF8C42] font-medium hover:underline">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="text-[#FF8C42] font-medium hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
