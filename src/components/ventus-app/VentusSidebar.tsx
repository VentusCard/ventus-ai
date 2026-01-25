import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Sparkles, User, LogOut, PanelLeft } from 'lucide-react';
import { useVentusAuth } from '@/contexts/VentusAuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import ventusLogo from '@/assets/ventus-logo.png';

interface VentusSidebarProps {
  children: React.ReactNode;
}

export const VentusSidebar = ({ children }: VentusSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useVentusAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/smartrewards');
  };

  const navItems = [
    { path: '/app/home', icon: Home, label: 'Home' },
    { path: '/app/search', icon: Sparkles, label: 'Ventus AI' },
    { path: '/app/profile', icon: User, label: 'Profile' },
  ];

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar-background border-r border-sidebar-border flex flex-col z-40 transition-all duration-200",
          collapsed ? "w-14" : "w-52"
        )}
      >
        {/* Logo & Toggle */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          {!collapsed && (
            <Link to="/app/home" className="flex items-center">
              <img 
                src={ventusLogo} 
                alt="Ventus" 
                className="h-6 w-auto"
              />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors",
              collapsed && "w-full"
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className={cn("w-4 h-4 text-sidebar-foreground/60", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                title={label}
                className={cn(
                  "flex items-center gap-3 px-3 h-10 rounded-lg transition-colors",
                  collapsed && "justify-center px-0",
                  isActive 
                    ? "bg-sidebar-accent text-primary" 
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            title="Logout"
            className={cn(
              "flex items-center gap-3 px-3 h-10 rounded-lg w-full text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-colors",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main 
        className={cn(
          "flex-1 min-h-screen transition-all duration-200",
          collapsed ? "ml-14" : "ml-52"
        )}
      >
        {children}
      </main>
    </div>
  );
};
