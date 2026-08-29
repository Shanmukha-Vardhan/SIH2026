import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Building2, Sliders, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs mt-auto">
      {/* Indian Tricolor Ribbon Bottom Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">PM Internship Scheme</span>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                Smart Engine
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              An AI-powered smart allocation engine designed for the Prime Minister’s Internship Scheme under the Ministry of Corporate Affairs, ensuring constitutional quota compliance, meritocratic skill matching, and nationwide youth empowerment.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Deterministic & Auditable
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-orange-400">
                <Award className="w-3.5 h-3.5" /> Zero-Cloud In-Memory Processing
              </span>
            </div>
          </div>

          {/* Quick Portals */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Portal Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/companies" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  <span>🏢 10 Enterprise JDs</span>
                </Link>
              </li>
              <li>
                <Link to="/custom-allocation" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  <span>🎛️ Custom Allocation Studio</span>
                </Link>
              </li>
              <li>
                <Link to="/company-x" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  <span>💼 AVOLVE Enterprise Portal</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  <span>📊 National Live Analytics</span>
                </Link>
              </li>
              <li>
                <Link to="/candidates" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  <span>👥 Team SIH</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Scheme Compliance & Disclaimer */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Scheme Governance</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Maintained in accordance with constitutional reservation norms (50% Open Merit, 27% OBC, 15% SC, 7.5% ST, 10% EWS) and affirmative action mandates for rural and differently abled youth.
            </p>
            <p className="text-[10px] text-slate-500">
              Government of India • Ministry of Corporate Affairs (MCA)
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <p>© 2026 PM Internship Smart Allocation Engine. All Rights Reserved.</p>
          <p className="flex items-center gap-2">
            <span>Powered by Scikit-Learn NLP & Jaccard Optimization</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
