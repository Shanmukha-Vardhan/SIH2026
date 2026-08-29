import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Home, 
  Layers, 
  BarChart2, 
  Users, 
  Briefcase,
  Sparkles,
  ShieldCheck,
  Sliders,
  Award
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/', icon: Home },
    { 
      name: 'Companies', 
      path: '/companies', 
      icon: Building2, 
      highlight: true 
    },
    { 
      name: 'Custom Allocation', 
      path: '/custom-allocation', 
      icon: Sliders,
    },
    { 
      name: 'AVOLVE Portal', 
      path: '/company-x', 
      icon: Briefcase, 
    },
    { name: 'Analytics', path: '/dashboard', icon: BarChart2 },
    { name: 'Team SIH', path: '/candidates', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Indian National Tricolor Ribbon Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Emblem & Scheme Branding */}
          <Link to="/" className="flex items-center gap-2 group">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  PM Internship Scheme
                </span>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                  GOV AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                Ministry of Corporate Affairs • Govt. of India
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              if (link.highlight) {
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                      isActive 
                        ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 border border-orange-400/50' 
                        : 'bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-orange-400'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 text-orange-400 border border-slate-700 font-extrabold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>



        </div>
      </div>
    </header>
  );
}
