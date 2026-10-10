import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  ChevronDown,
  Globe,
  MapPin,
  TrendingUp,
  Store,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If URL has access_token in hash (from Supabase Auth redirect), navigate to dashboard
    if (window.location.hash.includes('access_token')) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#07172f] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Dynamic Starry Sky Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle radial glow from the moon */}
        <div className="absolute top-[28%] left-[18%] -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-sky-400/10 rounded-full blur-[120px]" />
        <div className="absolute top-[35%] right-[20%] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[140px]" />

        {/* Scattered Stars Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-70" xmlns="http://www.w3.org/2000/svg">
          <circle cx="5%" cy="12%" r="1" fill="#ffffff" opacity="0.8" />
          <circle cx="12%" cy="28%" r="1.5" fill="#ffffff" opacity="0.9" />
          <circle cx="18%" cy="8%" r="1" fill="#ffffff" opacity="0.6" />
          <circle cx="25%" cy="35%" r="1" fill="#ffffff" opacity="0.7" />
          <circle cx="32%" cy="18%" r="1.8" fill="#ffffff" opacity="0.9" />
          <circle cx="38%" cy="42%" r="1.2" fill="#ffffff" opacity="0.8" />
          <circle cx="48%" cy="10%" r="1" fill="#ffffff" opacity="0.5" />
          <circle cx="54%" cy="25%" r="1.6" fill="#ffffff" opacity="0.8" />
          <circle cx="62%" cy="14%" r="1" fill="#ffffff" opacity="0.6" />
          <circle cx="70%" cy="32%" r="1.5" fill="#ffffff" opacity="0.85" />
          <circle cx="78%" cy="9%" r="1" fill="#ffffff" opacity="0.7" />
          <circle cx="85%" cy="22%" r="1.8" fill="#ffffff" opacity="0.9" />
          <circle cx="92%" cy="38%" r="1.2" fill="#ffffff" opacity="0.7" />
          <circle cx="96%" cy="15%" r="1" fill="#ffffff" opacity="0.5" />
          <circle cx="42%" cy="65%" r="1" fill="#ffffff" opacity="0.4" />
          <circle cx="68%" cy="58%" r="1.4" fill="#ffffff" opacity="0.6" />
          <circle cx="82%" cy="62%" r="1" fill="#ffffff" opacity="0.5" />
        </svg>
      </div>

      {/* Top Navigation Bar - Exact style from typingclub reference */}
      <header className="relative z-30 w-full px-6 lg:px-16 py-5 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl lg:text-2xl font-bold tracking-tight text-white">
            FieldAssist
          </span>
        </div>

        {/* Right Menu Links + Login Button */}
        <nav className="flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => {
              const el = document.getElementById('features');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden sm:inline-block text-xs lg:text-sm font-medium text-slate-200 hover:text-white transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('features');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden md:inline-block text-xs lg:text-sm font-medium text-slate-200 hover:text-white transition-colors"
          >
            Pricing
          </button>

          <div className="hidden lg:flex items-center gap-1 text-xs lg:text-sm font-medium text-slate-200 cursor-pointer hover:text-white">
            <Globe className="w-4 h-4" />
            <span>English</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>

          {/* Header Login / Dashboard Button */}
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="px-5 py-2 lg:px-6 lg:py-2.5 rounded-full bg-white text-[#0a1e3f] hover:bg-slate-100 text-xs lg:text-sm font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 min-h-[40px] flex items-center gap-1.5"
          >
            {isAuthenticated ? (
              <>
                <LayoutDashboard className="w-4 h-4 text-brand-600" />
                <span>Go to Dashboard</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </nav>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-20 flex-1 flex flex-col justify-center px-6 lg:px-16 pt-8 pb-32 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Moon Illustration with Crater Texture */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="relative group">
              {/* Outer soft glowing halo */}
              <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl transform scale-110 group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute -inset-4 rounded-full bg-sky-300/10 blur-3xl animate-pulse" />

              {/* Realistic SVG Moon Sphere */}
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full bg-gradient-to-br from-[#f8faff] via-[#d6e3f8] to-[#9bb7df] shadow-[inset_-25px_-25px_50px_rgba(15,35,70,0.6),0_0_60px_rgba(200,225,255,0.4)] flex items-center justify-center overflow-hidden">
                {/* Moon Crater Details */}
                <div className="absolute top-10 left-12 w-14 h-14 rounded-full bg-[#b8cfef]/40 shadow-inner blur-[0.5px]" />
                <div className="absolute top-24 left-28 w-20 h-20 rounded-full bg-[#acc7ec]/50 shadow-inner blur-[0.5px]" />
                <div className="absolute bottom-12 left-16 w-16 h-16 rounded-full bg-[#adc9ee]/45 shadow-inner" />
                <div className="absolute top-16 right-8 w-10 h-10 rounded-full bg-[#b6cef0]/40 shadow-inner" />
                <div className="absolute bottom-16 right-16 w-12 h-12 rounded-full bg-[#9fc0ea]/50 shadow-inner" />
                <div className="absolute top-6 left-32 w-8 h-8 rounded-full bg-[#c6daf4]/35 shadow-inner" />
                <div className="absolute bottom-8 left-36 w-6 h-6 rounded-full bg-[#a3c3eb]/40 shadow-inner" />

                {/* Subtle crater rim reflections */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40 rounded-full pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right Column: Hero Headline */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Empower Your Field Sales Force!
              <span className="inline-block w-1 h-9 lg:h-11 bg-white ml-2 align-middle animate-pulse" />
            </h1>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Next-generation SaaS platform for real-time sales force tracking, beat route optimization, instant retail order booking, and field analytics.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <span>{isAuthenticated ? 'Open FieldAssist Portal' : 'Get Started Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all"
                >
                  Demo Accounts
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scroll down pill icon (from typingclub reference) */}
        <div className="absolute bottom-28 left-6 sm:left-16 z-30">
          <button
            onClick={() => {
              const el = document.getElementById('features');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-10 h-10 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-105"
            aria-label="Scroll to features"
          >
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </main>

      {/* Layered White Cloud Illustration at Bottom (from typingclub reference) */}
      <div className="relative w-full z-10 pointer-events-none -mt-16 sm:-mt-24 lg:-mt-32">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-auto text-white fill-current block"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Back cloud layer */}
          <path
            fill="#a6c8e8"
            fillOpacity="0.45"
            d="M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,213.3C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          {/* Middle cloud layer */}
          <path
            fill="#cbe0f4"
            fillOpacity="0.75"
            d="M0,224L60,208C120,192,240,160,360,170.7C480,181,600,235,720,240C840,245,960,203,1080,186.7C1200,171,1320,181,1380,186.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
          {/* Front white puffy cloud layer */}
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,256L48,245.3C96,235,192,213,288,224C384,235,480,277,576,277.3C672,277,768,235,864,229.3C960,224,1056,256,1152,261.3C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Features Overview Section (White background below clouds) */}
      <section id="features" className="relative z-20 bg-white text-slate-800 py-16 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c2340]">
              Built for High-Velocity Field Sales Teams
            </h2>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto">
              Everything your field force needs to exceed monthly targets and streamline secondary distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">GPS Beat Planning</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Smart route sequencing with geofenced retail check-ins to ensure 100% genuine store visits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Retail Outlet Orders</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Book secondary orders on the spot with real-time stock levels, pricing schemes, and credit checks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Executive Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Live leaderboards, territory targets vs actuals, and automated performance reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-8 px-6 lg:px-16 text-xs text-center border-t border-slate-900">
        <p>© 2026 FieldAssist Inc. All rights reserved. Enterprise Sales Management SaaS.</p>
      </footer>
    </div>
  );
};
