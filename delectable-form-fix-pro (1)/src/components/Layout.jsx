import { Link, Outlet, useLocation } from 'react-router-dom';
import { Zap, LayoutDashboard, History, TrendingUp, Users, Upload, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';

export default function Layout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) {
        setUser(u);
        base44.entities.UserProfile.filter({ user_id: u.id }).then(profiles => {
          if (profiles.length > 0) setProfile(profiles[0]);
        });
      }
    }).catch(() => {});
  }, []);

  const isTrainer = profile?.role === 'trainer';

  const athleteLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/submit', icon: Upload, label: 'Submit Set' },
    { to: '/history', icon: History, label: 'Grade History' },
    { to: '/gpa', icon: TrendingUp, label: 'My GPA' },
  ];

  const trainerLinks = [
    { to: '/trainer', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/trainer/athletes', icon: Users, label: 'Athletes' },
  ];

  const links = isTrainer ? trainerLinks : athleteLinks;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-16 md:w-60 bg-[#141414] border-r border-border flex flex-col shrink-0">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 px-4 py-5 border-b border-border">
          <div className="w-8 h-8 bg-primary flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="hidden md:block font-heading font-900 text-xl uppercase tracking-wider text-foreground">
            RepGrade
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 py-6 flex flex-col gap-1 px-2">
          {links.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all ${
                  active
                    ? 'bg-primary/15 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="hidden md:block font-heading font-700 text-sm uppercase tracking-wide">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden md:flex flex-col flex-1 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">{user?.full_name || 'User'}</span>
            <span className="text-xs text-muted-foreground uppercase">{profile?.role || 'athlete'}</span>
          </div>
          <button
            onClick={() => base44.auth.logout('/')}
            className="hidden md:block text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}