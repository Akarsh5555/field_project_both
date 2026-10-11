import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole, User } from '../types/auth';
import { getCurrentUserRole } from '@/integrations/supabase';
import { supabase } from '@/lib/supabaseClient';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  LogIn,
  Users,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  UserCheck,
} from 'lucide-react';

interface GoogleAccountOption {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  status?: string;
}

const PRESET_GOOGLE_ACCOUNTS: GoogleAccountOption[] = [
  {
    id: 'acc-1',
    name: 'Vinayaka Tilak',
    email: 'vinaymeghu09@gmail.com',
    initials: 'V',
    color: 'bg-emerald-600',
    status: 'Signed in',
  },
  {
    id: 'acc-2',
    name: 'Tilak P.S.',
    email: 'tilak2007@gmail.com',
    initials: 'T',
    color: 'bg-blue-600',
    status: 'Signed in',
  },
  {
    id: 'acc-3',
    name: 'Field Operations',
    email: 'tilak.operations@fieldassist.io',
    initials: 'F',
    color: 'bg-indigo-600',
  },
];

export const Login: React.FC = () => {
  const { login, signUp, setUserSession, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Mode: 'login' or 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Google OAuth multi-step modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState<'role' | 'chooser' | 'add_account'>('role');
  const [selectedGoogleRole, setSelectedGoogleRole] = useState<UserRole>('Sales Representative');
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Login & SignUp form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('Sales Representative');
  const [territory, setTerritory] = useState('North Delhi');
  const [showPassword, setShowPassword] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleQuickLogin = async (quickEmail: string, quickPass: string, redirectPath: string) => {
    clearError();
    setEmail(quickEmail);
    setPassword(quickPass);
    try {
      await login({ email: quickEmail, password: quickPass });
      navigate(redirectPath);
    } catch (err: any) {
      console.warn('Quick login notice:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setActionMessage(null);

    try {
      if (mode === 'login') {
        await login({ email, password });
        if (email.includes('rep') || role === 'Sales Representative') {
          navigate("/rep/attendance");
        } else {
          navigate("/admin/dashboard");
        }
      } else {
        // Sign up
        await signUp({ email, password, fullName, role, territory });
        if (role === 'Sales Representative') {
          navigate("/rep/attendance");
        } else {
          navigate("/admin/dashboard");
        }
      }
    } catch (err: any) {
      console.warn('Auth error caught:', err);
    }
  };

  // Check active session or OAuth redirect callback on mount
  useEffect(() => {
    const handleNavigation = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const storedRole =
            sessionStorage.getItem('oauth_selected_role') ||
            localStorage.getItem('oauth_selected_role');

          if (storedRole) {
            try {
              await supabase.from('user_profiles').upsert([
                {
                  id: session.user.id,
                  full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Google User',
                  email: session.user.email,
                  role: storedRole,
                  is_admin: storedRole === 'System Admin',
                  is_staff: storedRole === 'Sales Manager',
                  territory: 'North Delhi',
                },
              ]);
            } catch {
              // Ignore
            }
          }

          const userRoleSession = await getCurrentUserRole(supabase);
          if (userRoleSession?.isAdmin || userRoleSession?.isStaff) {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/rep/attendance', { replace: true });
          }
        }
      } catch {
        // Ignore
      }
    };

    handleNavigation();

    // Listen to token authentication events (e.g., from email verification or Google OAuth hash fragments)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        handleNavigation();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  // Trigger Google Role Selection modal
  const onGoogleLogin = () => {
    clearError();
    setActionMessage(null);
    setGoogleStep('role');
    setShowGoogleModal(true);
  };

  // Proceed from Role selection step to Google Account Chooser
  const handleProceedToChooser = () => {
    clearError();
    setGoogleStep('chooser');
  };

  // Select a Google Account and complete sign-in immediately
  const handleSelectGoogleAccount = async (accountName: string, accountEmail: string) => {
    setIsSigningInGoogle(true);
    clearError();
    try {
      const googleUser: User = {
        id: `usr-g-${Date.now()}`,
        name: accountName,
        email: accountEmail,
        role: selectedGoogleRole,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(accountName)}&background=0284c7&color=fff`,
        territory: 'North Delhi',
        region: 'North Zone (Delhi-NCR)',
        department: selectedGoogleRole === 'Sales Representative' ? 'Field Sales Force' : 'Field Sales Operations',
        permissions: selectedGoogleRole === 'System Admin' ? ['all'] : ['read:all', 'write:orders'],
      };

      setUserSession(googleUser, `g-token-${Date.now()}`);

      setTimeout(() => {
        setIsSigningInGoogle(false);
        setShowGoogleModal(false);
        if (selectedGoogleRole === 'Sales Representative') {
          navigate('/rep/attendance');
        } else {
          navigate('/admin/dashboard');
        }
      }, 400);
    } catch (err: any) {
      console.warn('Google account selection error:', err);
      setIsSigningInGoogle(false);
    }
  };

  // Handle custom Google account entry
  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    const name = customGoogleName.trim() || customGoogleEmail.split('@')[0];
    handleSelectGoogleAccount(name, customGoogleEmail.trim());
  };


  return (
    <div className="min-h-screen bg-[#fcf8f5] text-slate-800 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Top Left Logo (Matching edclub reference style) */}
      <header className="relative z-20 w-full px-6 lg:px-12 py-5 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-[#eb5e28] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#252422]">
            FieldAssist
          </span>
        </div>
      </header>

      {/* Atmospheric Landscape Background Illustration (Soft Peach Hills & Windmill from reference image) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          viewBox="0 0 1440 900"
          className="w-full h-full object-cover opacity-90"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffcf9" />
              <stop offset="100%" stopColor="#fdf3eb" />
            </linearGradient>
            <linearGradient id="hill1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fcdcd1" />
              <stop offset="100%" stopColor="#f8c9b9" />
            </linearGradient>
            <linearGradient id="hill2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f7bcab" />
              <stop offset="100%" stopColor="#f0a592" />
            </linearGradient>
          </defs>

          {/* Background Gradient */}
          <rect width="1440" height="900" fill="url(#skyGrad)" />

          {/* Distant soft background hill */}
          <path
            d="M-100,550 Q300,420 800,520 T1600,480 L1600,900 L-100,900 Z"
            fill="url(#hill1)"
            opacity="0.5"
          />

          {/* Foreground rolling peach hill */}
          <path
            d="M-50,680 Q250,560 700,640 T1500,600 L1500,900 L-50,900 Z"
            fill="url(#hill2)"
            opacity="0.85"
          />

          {/* Stylized Windmill Illustration on bottom-left (from reference image) */}
          <g transform="translate(140, 480) scale(1.1)" opacity="0.9">
            {/* Windmill Tower */}
            <polygon points="50,220 70,80 110,80 130,220" fill="#ffffff" stroke="#f0a592" strokeWidth="2" />
            {/* Windmill Red Roof Dome */}
            <path d="M66,80 Q90,30 114,80 Z" fill="#eb5e28" />
            {/* Windows */}
            <circle cx="90" cy="115" r="7" fill="#eb5e28" />
            <circle cx="90" cy="165" r="7" fill="#eb5e28" />
            {/* Windmill Blades */}
            <g transform="translate(90, 80)">
              <line x1="0" y1="0" x2="-65" y2="-65" stroke="#d96b43" strokeWidth="4" />
              <polygon points="-65,-65 -50,-80 -35,-50" fill="#fcdcd1" stroke="#d96b43" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="65" y2="65" stroke="#d96b43" strokeWidth="4" />
              <polygon points="65,65 50,80 35,50" fill="#fcdcd1" stroke="#d96b43" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="-65" y2="65" stroke="#d96b43" strokeWidth="4" />
              <polygon points="-65,65 -80,50 -50,35" fill="#fcdcd1" stroke="#d96b43" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="65" y2="-65" stroke="#d96b43" strokeWidth="4" />
              <polygon points="65,-65 80,-50 50,-35" fill="#fcdcd1" stroke="#d96b43" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="6" fill="#eb5e28" />
            </g>
          </g>

          {/* Stylized trees & farmhouse details on right */}
          <g transform="translate(1200, 620)" opacity="0.8">
            <ellipse cx="60" cy="100" rx="35" ry="40" fill="#eb5e28" opacity="0.4" />
            <polygon points="120,120 140,40 180,40 200,120" fill="#ffffff" />
            <path d="M136,40 Q160,10 184,40 Z" fill="#eb5e28" />
          </g>
        </svg>
      </div>

      {/* Main Centered Login / Sign Up Card (Exact style from edclub reference) */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-200/80 p-6 sm:p-8 space-y-4">
          {/* Card Header with Mode Toggle */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight">
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </h1>
            <p className="text-[12px] text-slate-500">
              {mode === 'login'
                ? 'For field accounts, please enter your credentials below.'
                : 'Create your field sales account to access the portal.'}
            </p>
          </div>

          {/* SSO Authentication Buttons (Shown on Login mode) */}
          {mode === 'login' && (
            <>
              <div className="space-y-2 pt-1">
                {/* Google SSO calling onGoogleLogin */}
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  className="w-full h-10 px-4 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm group"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Log in with Google</span>
                </button>

                {/* Google Role Selector Shortcut */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
                  <span className="text-slate-400">Account Role:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleStep('role');
                      setShowGoogleModal(true);
                    }}
                    className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>{selectedGoogleRole}</span>
                    <span className="text-[10px] text-slate-400">✏️ change</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] text-slate-400 font-medium absolute">
                  Or
                </span>
              </div>
            </>
          )}

          {/* Action notification message */}
          {actionMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              {actionMessage}
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={clearError} className="text-rose-500 hover:text-rose-800 font-bold ml-2">
                ✕
              </button>
            </div>
          )}

          {/* Authentication & Sign-Up Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full h-10 px-3.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full h-10 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-brand-600"
                    >
                      <option value="Sales Representative">Sales Representative</option>
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="System Admin">System Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Territory</label>
                    <input
                      type="text"
                      value={territory}
                      onChange={(e) => setTerritory(e.target.value)}
                      placeholder="e.g. North Delhi"
                      className="w-full h-10 px-3.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {mode === 'login' ? 'Username/Email' : 'Work Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full h-10 px-3.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                {mode === 'login' && (
                  <span className="text-[11px] text-brand-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-10 pl-3.5 pr-10 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* High-Contrast Action Button (Log in / Sign up) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-1 rounded-lg bg-[#1f2937] hover:bg-[#111827] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 min-h-[40px]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <div className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span>Log in</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Sign In</span>
                </div>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Login Shortcuts */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Instant 1-Click Access
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@fieldassist.io', 'admin123', '/admin/dashboard')}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-center transition-all group shadow-sm hover:shadow"
              >
                <span className="text-xs font-bold block">👑 Admin</span>
                <span className="text-[10px] text-emerald-600 block">Full Portal</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager@fieldassist.io', 'manager123', '/admin/dashboard')}
                className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-center transition-all group shadow-sm hover:shadow"
              >
                <span className="text-xs font-bold block">💼 Manager</span>
                <span className="text-[10px] text-indigo-600 block">Stock & Targets</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('vikram@fieldassist.io', 'rep123', '/rep/attendance')}
                className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-center transition-all group shadow-sm hover:shadow"
              >
                <span className="text-xs font-bold block">🚴 Field Rep</span>
                <span className="text-[10px] text-blue-600 block">Beat & Orders</span>
              </button>
            </div>
          </div>

          {/* Footer Mode Switcher Link */}
          <div className="text-center pt-1 border-t border-slate-100">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setMode('signup');
                  }}
                  className="text-brand-600 font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setMode('login');
                  }}
                  className="text-brand-600 font-semibold hover:underline"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Subtle indicator bar */}
      <footer className="relative z-10 py-3 text-center">
        <div className="w-8 h-1 bg-slate-400/40 rounded-full mx-auto" />
      </footer>

      {/* Google Sign-In Multi-Step Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">

            {/* Loading Overlay */}
            {isSigningInGoogle && (
              <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-12 h-12 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h4 className="text-sm font-bold text-slate-900 mb-1">Authenticating with Google...</h4>
                <p className="text-xs text-slate-500">
                  Setting up workspace session as <span className="font-semibold text-slate-800">{selectedGoogleRole}</span>
                </p>
              </div>
            )}

            {/* STEP 1: Select Operational Role */}
            {googleStep === 'role' && (
              <>
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-white">Google Sign-In: Step 1</h3>
                      <p className="text-[11px] text-slate-300">Choose your workspace role first</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-600 font-medium">
                    Which operational role are you signing into?
                  </p>

                  <div className="space-y-2.5">
                    {/* 1. Sales Representative */}
                    <div
                      onClick={() => setSelectedGoogleRole('Sales Representative')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        selectedGoogleRole === 'Sales Representative'
                          ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedGoogleRole === 'Sales Representative' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Sales Representative</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            /rep/attendance
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Daily attendance punch-in, beat route map, visit check-ins, and store orders.
                        </p>
                      </div>
                    </div>

                    {/* 2. Sales Manager */}
                    <div
                      onClick={() => setSelectedGoogleRole('Sales Manager')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        selectedGoogleRole === 'Sales Manager'
                          ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedGoogleRole === 'Sales Manager' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Sales Manager</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            /admin/dashboard
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Team tracking, attendance oversight, beat planning, and territory performance.
                        </p>
                      </div>
                    </div>

                    {/* 3. System Admin */}
                    <div
                      onClick={() => setSelectedGoogleRole('System Admin')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        selectedGoogleRole === 'System Admin'
                          ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedGoogleRole === 'System Admin' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">System Admin</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            /admin/dashboard
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Full enterprise administration, user permissions, and warehouse catalog stock.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>Next step: Select your Google account from the account chooser.</span>
                  </div>

                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowGoogleModal(false)}
                      className="flex-1 h-10 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToChooser}
                      className="flex-[1.5] h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md group"
                    >
                      <span>Continue to Google Chooser</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: Google Account Chooser */}
            {googleStep === 'chooser' && (
              <>
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGoogleStep('role')}
                      className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Back to role selection"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">Choose an account</h3>
                      <p className="text-[11px] text-slate-500">to continue to FieldAssist</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-3.5">
                  {/* Selected Role Badge */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <span className="text-slate-500">
                      Signing in as: <strong className="text-slate-900">{selectedGoogleRole}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setGoogleStep('role')}
                      className="text-brand-600 hover:text-brand-700 font-semibold text-[11px] hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  {/* Google Accounts List */}
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {PRESET_GOOGLE_ACCOUNTS.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => handleSelectGoogleAccount(acc.name, acc.email)}
                        className="p-3.5 flex items-center justify-between hover:bg-slate-50/90 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full ${acc.color} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}>
                            {acc.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                              {acc.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {acc.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {acc.status && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {acc.status}
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}

                    {/* Use Another Account Option */}
                    <div
                      onClick={() => {
                        setCustomGoogleName('');
                        setCustomGoogleEmail('');
                        setGoogleStep('add_account');
                      }}
                      className="p-3.5 flex items-center gap-3 hover:bg-slate-50/90 cursor-pointer transition-colors text-slate-700 group"
                    >
                      <div className="w-9 h-9 rounded-full border border-dashed border-slate-300 text-slate-400 group-hover:text-brand-600 group-hover:border-brand-500 flex items-center justify-center shrink-0 transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                          Use another account
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Sign in with a different Google email address
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 text-center leading-relaxed px-2 pt-1">
                    To continue, Google will share your name, email address, and profile picture with FieldAssist.
                  </p>
                </div>
              </>
            )}

            {/* STEP 3: Add Custom Google Account */}
            {googleStep === 'add_account' && (
              <>
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGoogleStep('chooser')}
                      className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Back to accounts"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">Add another account</h3>
                      <p className="text-[11px] text-slate-500">Sign in with any Google account</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCustomAccountSubmit} className="p-5 space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Vinayaka Tilak"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setGoogleStep('chooser')}
                      className="flex-1 h-10 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!customGoogleEmail.trim()}
                      className="flex-[1.5] h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Continue & Sign In</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
