import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, User, LogOut } from 'lucide-react';
import { useVentusAuth } from '@/contexts/VentusAuthContext';
import { cn } from '@/lib/utils';

export const VentusNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useVentusAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/smartrewards');
  };

  const navItems = [
    { path: '/app/home', icon: Home, label: 'Home' },
    { path: '/app/search', icon: MessageCircle, label: 'Search' },
    { path: '/app/profile', icon: User, label: 'Profile' },
  ];

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                isActive 
                  ? "text-[#0064E0]" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};
