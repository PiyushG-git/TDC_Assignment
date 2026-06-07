import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';

export const Navbar = () => {
  const { user } = useAuth();
  const initials = user?.username?.[0]?.toUpperCase() || 'M';

  return (
    <header className="h-16 bg-white border-b border-stone-100 flex items-center justify-between px-8 flex-shrink-0">
      <div>
        <h2 className="text-xl font-semibold text-brand-green-dark" style={{ fontFamily: "'Playfair Display', serif" }}>
          Matchmaker Dashboard
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 font-sans">The Date Crew · Internal Portal</p>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-slate-400 hover:text-brand-gold transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: '#dc9e4a' }} />
        </button>

        <div className="flex items-center gap-3 pl-5 border-l border-stone-200">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #244c3c, #1b3a2f)' }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800 leading-none">{user?.username}</p>
            <p className="text-xs text-slate-400 mt-0.5">Matchmaker</p>
          </div>
        </div>
      </div>
    </header>
  );
};
