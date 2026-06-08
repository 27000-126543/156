
import React, { useState } from 'react';
import { Waves, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Loading } from '../components/Loading';

export const Login: React.FC = () => {
  const { login, isLoading } = useStore();
  const [email, setEmail] = useState('chemist@ocean.edu');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = '请输入邮箱地址';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = '请输入有效的邮箱地址';
    if (!password) newErrors.password = '请输入密码';
    else if (password.length < 6) newErrors.password = '密码至少6位';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const success = await login(email, password);
    if (!success) {
      setErrors({ password: '邮箱或密码错误' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-950 via-ocean-800 to-ocean-900" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-ocean-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-seaweed-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-coral-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
        </div>
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(62,146,204,0.3)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-2xl border border-ocean-500/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center glow-effect">
              <Waves className="text-white" size={32} />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              海洋碳汇智能评估平台
            </h1>
            <p className="text-ocean-300/80 text-sm">
              高分辨率海洋生物地球化学循环与碳汇评估系统
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 transition-all ${
                    errors.email
                      ? 'border-coral-500/50 focus:border-coral-500'
                      : 'border-white/10 focus:border-ocean-500/50'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-coral-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 transition-all ${
                    errors.password
                      ? 'border-coral-500/50 focus:border-coral-500'
                      : 'border-white/10 focus:border-ocean-500/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-coral-400">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-ocean-500 focus:ring-ocean-500/50"
                />
                记住我
              </label>
              <a href="#" className="text-ocean-400 hover:text-ocean-300 transition-colors">
                忘记密码?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-400 hover:to-ocean-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-ocean-500/30 hover:shadow-xl hover:shadow-ocean-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loading text="" />
                  <span>登录中...</span>
                </>
              ) : (
                '登录系统'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-xs text-white/50">
              演示账号: chemist@ocean.edu / password
            </p>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © 2024 海洋碳汇智能评估平台 | 为IPCC气候评估与海洋负排放工程提供科学支撑
        </p>
      </div>
    </div>
  );
};
