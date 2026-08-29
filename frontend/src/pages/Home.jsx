import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Scale, BarChart3, Zap, Building2, Sliders, Briefcase, Award, ShieldCheck } from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: 'AI Semantic Synergy Matching',
      description: 'Advanced multi-factor intelligence analyzing real candidate resumes against enterprise technical skills and project keywords.',
      icon: BrainCircuit,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    {
      title: 'Constitutional Quotas & Inclusivity',
      description: 'Strict enforcement of Open Merit (50%), OBC (27%), SC (15%), ST (7.5%), EWS (10%) with automated Rural & PwD priority boosts.',
      icon: Scale,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Real-Time Transparency Analytics',
      description: 'Full multi-dimensional explainability scorecards showing why each candidate was selected with 0 hardcoded numbers.',
      icon: BarChart3,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: 'High-Performance Allocation Engine',
      description: 'Zero-cloud in-memory optimizer capable of evaluating 10,000+ applicants in milliseconds with 5-second verification sweeps.',
      icon: Zap,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16">
      
      {/* NATIONAL HERO SECTION */}
      <section className="text-center py-16 px-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden text-white">
        {/* Tricolor Ambient Glows */}
        <div className="absolute -top-12 -left-12 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-5 max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-orange-500/40 text-xs font-black uppercase tracking-wider text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            Government of India • Ministry of Corporate Affairs
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            PM Internship Scheme <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
              Smart Allocation Engine
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
            AI-driven multi-factor candidate matching and constitutional quota optimization ensuring meritocracy, transparency, and nationwide youth empowerment.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/companies"
              className="px-8 py-4 text-sm font-black rounded-2xl text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/30 transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Building2 className="w-4 h-4" />
              <span>Explore 10 Enterprise JDs</span>
            </Link>

            <Link
              to="/custom-allocation"
              className="px-8 py-4 text-sm font-black rounded-2xl text-slate-900 bg-white hover:bg-slate-100 shadow-lg border border-slate-200 transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sliders className="w-4 h-4 text-orange-600" />
              <span>Custom Allocation Studio</span>
            </Link>

            <Link
              to="/company-x"
              className="px-8 py-4 text-sm font-black rounded-2xl text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>AVOLVE 2k Sandbox</span>
            </Link>
          </div>

          {/* Tricolor Mini Guarantee */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold border-t border-slate-800/80 mt-6">
            <span className="flex items-center gap-1.5 text-orange-300">
              <Award className="w-4 h-4 text-orange-400" /> Multi-Factor AI Scoring
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Quota Compliant
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Zap className="w-4 h-4 text-emerald-400" /> Zero-Cloud In-Memory Processing
            </span>
          </div>

        </div>
      </section>

      {/* 4 NATIONAL PILLAR CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div 
              key={feature.title} 
              className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-slate-200/80 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${feature.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </section>

    </div>
  );
}
