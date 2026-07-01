import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  Bell,
  Home,
  Calendar,
  Users,
  Stethoscope,
  BarChart3,
  Settings,
  ChevronRight,
  Activity,
  UserCircle,
  Shield,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { selectUnreadCount } from '../features/notifications/notificationSlice';
import Avatar from '../Components/shared/Avatar';
import { ThemeToggleCompact, ThemeTogglePill } from '../Components/shared/ThemeToggle';

/* ─────────────────────────────────────────────────────────────────
   Role configuration
───────────────────────────────────────────────────────────────── */
const patientNav = [
  { name: 'Dashboard',    path: '/patient/dashboard',      icon: Home },
  { name: 'Find Doctors', path: '/patient/doctors',        icon: Stethoscope },
  { name: 'Appointments', path: '/patient/appointments',   icon: Calendar },
  { name: 'Notifications',path: '/patient/notifications',  icon: Bell },
];

const doctorNav = [
  { name: 'Dashboard',    path: '/doctor/dashboard',       icon: Home },
  { name: 'Appointments', path: '/doctor/appointments',    icon: Calendar },
  { name: 'Availability', path: '/doctor/availability',    icon: Settings },
  { name: 'Profile',      path: '/doctor/profile',         icon: UserCircle },
  { name: 'Notifications',path: '/doctor/notifications',   icon: Bell },
];

const adminNav = [
  { name: 'Dashboard',       path: '/admin/dashboard',        icon: Home },
  { name: 'Doctors',         path: '/admin/doctors',          icon: Stethoscope },
  { name: 'Patients',        path: '/admin/patients',         icon: Users },
  { name: 'Appointments',    path: '/admin/appointments',     icon: Calendar },
  { name: 'Analytics',       path: '/admin/analytics',        icon: BarChart3 },
  { name: 'Specializations', path: '/admin/specializations',  icon: Shield },
  { name: 'Notifications',   path: '/admin/notifications',    icon: Bell },
];

const roleConfig = {
  patient: {
    nav: patientNav,
    gradient: 'from-blue-600 to-indigo-700',
    gradientHover: 'hover:from-blue-700 hover:to-indigo-800',
    accent: 'blue',
    glow: 'shadow-blue-500/20',
    label: 'Patient Portal',
    bottomNav: [patientNav[0], patientNav[1], patientNav[2], patientNav[3]],
  },
  doctor: {
    nav: doctorNav,
    gradient: 'from-teal-500 to-emerald-600',
    gradientHover: 'hover:from-teal-600 hover:to-emerald-700',
    accent: 'teal',
    glow: 'shadow-teal-500/20',
    label: 'Doctor Portal',
    bottomNav: [doctorNav[0], doctorNav[1], doctorNav[2], doctorNav[4]],
  },
  admin: {
    nav: adminNav,
    gradient: 'from-violet-600 to-purple-700',
    gradientHover: 'hover:from-violet-700 hover:to-purple-800',
    accent: 'violet',
    glow: 'shadow-violet-500/20',
    label: 'Admin Panel',
    bottomNav: [adminNav[0], adminNav[1], adminNav[3], adminNav[6]],
  },
};

/* ─────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────── */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate   = useNavigate();
  const location   = useLocation();
  const dispatch   = useDispatch();

  const user        = useSelector((state) => state.auth.user);
  const unreadCount = useSelector(selectUnreadCount);

  const config    = roleConfig[user?.role] || roleConfig.patient;
  const navItems  = config.nav;

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  // Current page label for the topbar breadcrumb
  const currentPage = navItems.find((n) => n.path === location.pathname)?.name
    ?? location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ');

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">

      {/* ── Mobile overlay ────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          w-[260px] sm:w-64
          bg-white dark:bg-slate-900
          border-r border-slate-100 dark:border-slate-800
          shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:shadow-none lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand header */}
        <div className={`relative bg-gradient-to-br ${config.gradient} p-5 overflow-hidden flex-shrink-0`}>
          {/* Decorative circles */}
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-3 w-16 h-16 rounded-full bg-white/10" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-none tracking-tight">MediCare</h1>
                <p className="text-[11px] text-white/65 mt-0.5 font-medium">{config.label}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 text-sm font-medium
                  ${isActive
                    ? `bg-gradient-to-r ${config.gradient} text-white shadow-md ${config.glow}`
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <item.icon
                  className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                <span className="flex-1 truncate">{item.name}</span>
                {item.name === 'Notifications' && unreadCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                    isActive ? 'bg-white/25 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-2">
            <Avatar name={user?.name} src={user?.profileImage?.url} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">{user?.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          {/* Theme picker */}
          <div className="mb-2">
            <ThemeTogglePill />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-sm font-medium group"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════
          MAIN AREA
      ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 lg:ml-0">

        {/* ── Top header ─────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16">

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand — mobile only (lg shows sidebar brand) */}
            <div className="lg:hidden flex items-center gap-2">
              <div className={`w-7 h-7 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center`}>
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-800 dark:text-white text-sm">MediCare</span>
            </div>

            {/* Page title — desktop only */}
            <div className="hidden lg:block">
              <h2 className="font-semibold text-slate-800 dark:text-white text-base capitalize">
                {currentPage}
              </h2>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Theme toggle */}
              <ThemeToggleCompact />

              {/* Bell */}
              <Link
                to={`/${user?.role}/notifications`}
                className="relative flex items-center justify-center w-9 h-9 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Avatar + name — sm+ */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <Avatar name={user?.name} src={user?.profileImage?.url} size="sm" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                  {user?.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ────────────────────────────────────── */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-20 lg:pb-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE BOTTOM NAV BAR
          Shows bottom 4 nav items on mobile / tablet, hidden on lg+
      ══════════════════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-800 safe-area-pb">
        <div className="flex items-stretch h-16 px-2">
          {config.bottomNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0 px-1
                  transition-all duration-200 relative
                  ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}
                `}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r ${config.gradient}`} />
                )}

                <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                  isActive ? `bg-gradient-to-br ${config.gradient} shadow-md ${config.glow}` : ''
                }`}>
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] font-medium leading-none truncate w-full text-center ${
                  isActive ? `text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}` : ''
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
