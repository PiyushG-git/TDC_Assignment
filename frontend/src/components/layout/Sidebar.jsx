import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 flex flex-col h-full" style={{ backgroundColor: '#1b3a2f' }}>
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #dc9e4a, #7D5115)' }}>
          <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>T</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>TDC Match</p>
          <p className="text-white/40 text-xs">Matchmaker Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'text-brand-gold'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive ? { backgroundColor: 'rgba(220,158,74,0.15)' } : {}}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-white/50 hover:text-white/90 hover:bg-white/5 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};
