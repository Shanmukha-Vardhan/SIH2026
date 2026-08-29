import React from 'react';
import { 
  Users, 
  Award, 
  Code2, 
  BrainCircuit, 
  Database, 
  Palette, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Terminal,
  Sparkles,
  ExternalLink,
  Github,
  Layers
} from 'lucide-react';

export default function Candidates() {
  const teamMembers = [
    {
      name: 'S. Shanmukha Vardhan',
      role: 'Team Lead & Full Stack Developer (FSD)',
      tag: 'Team Leader',
      isLead: true,
      icon: Terminal,
      color: 'from-orange-500 to-amber-500',
      badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
      description: 'Architected the core end-to-end platform, high-performance in-memory matching engine, client-side dataset parser, and full-stack integration.',
      skills: ['System Architecture', 'React 18 / Vite', 'FastAPI', 'Python Engine', 'Tailwind CSS', 'Greedy Quota Optimizer']
    },
    {
      name: 'Yogendra Sai',
      role: 'Machine Learning Engineer',
      tag: 'ML & NLP',
      isLead: false,
      icon: BrainCircuit,
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Engineered the NLP pipeline using TF-IDF vectorization and Cosine Similarity to capture practical resume context against complex enterprise Job Descriptions.',
      skills: ['TF-IDF Vectorization', 'Cosine Similarity', 'NLP Text Processing', 'Jaccard Set Metrics', 'Feature Engineering']
    },
    {
      name: 'Dibyanshu Biswal',
      role: 'Backend Developer',
      tag: 'Backend Core',
      isLead: false,
      icon: Code2,
      color: 'from-blue-500 to-indigo-500',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      description: 'Built high-throughput FastAPI REST API endpoints, routing logic, Firebase cloud SDK integration, and backend security guardrails.',
      skills: ['FastAPI REST APIs', 'Python 3.11', 'Microservices', 'Firebase Cloud SDK', 'CORS Middleware']
    },
    {
      name: 'Shyama Shree Pati',
      role: 'UI/UX & Frontend Developer',
      tag: 'UI/UX Design',
      isLead: false,
      icon: Palette,
      color: 'from-rose-500 to-pink-500',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      description: 'Designed the official Indian GovTech Tricolor design system, interactive allocation sandboxes, responsive navigation, and candidate scorecard modal views.',
      skills: ['GovTech Design System', 'Component Architecture', 'Tailwind CSS v4', 'Responsive UI', 'Accessibility (a11y)']
    },
    {
      name: 'Kodali Lakshmi Samiya',
      role: 'Data Engineer',
      tag: 'Data Pipeline',
      isLead: false,
      icon: Database,
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Processed and sanitized the 2,000+ real applicant dataset, structuring resume fields, academic credentials, and categorical demographic splits.',
      skills: ['Data Preprocessing', 'Pandas & NumPy', 'Dataset Sanitization', 'Demographic Schemas', 'CSV Stream Parsing']
    },
    {
      name: 'Bathula Vinila',
      role: 'QA & Integration Engineer',
      tag: 'QA & Validation',
      isLead: false,
      icon: ShieldCheck,
      color: 'from-purple-500 to-indigo-500',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      description: 'Conducted rigorous edge-case testing, constitutional quota mathematical verification, deterministic reproducibility audits, and cross-browser quality checks.',
      skills: ['Quota Audit Testing', 'Cross-Browser QA', 'Edge Case Validation', 'Performance Profiling', 'Integration Tests']
    }
  ];

  const projectStats = [
    { label: 'Smart India Hackathon', value: 'SIH 2026', sub: 'National Finalist Track' },
    { label: 'Ministry Focus', value: 'MCA', sub: 'Ministry of Corporate Affairs' },
    { label: 'Evaluation Speed', value: '< 100ms', sub: 'For 2,000 Resumes' },
    { label: 'Quota Precision', value: '100.0%', sub: 'Constitutional Compliance' }
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      
      {/* HERO SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Smart India Hackathon (SIH)
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Team & Technical Contributors
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            The engineering team behind the <strong className="text-white">PM Internship Smart Allocation Engine</strong> — uniting Full Stack Development, Machine Learning, Data Engineering, UI/UX, and QA for nation-wide impact.
          </p>
        </div>
      </div>

      {/* QUICK METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {projectStats.map((st) => (
          <div key={st.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{st.label}</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{st.value}</div>
            <span className="text-xs text-orange-600 font-semibold mt-0.5 block">{st.sub}</span>
          </div>
        ))}
      </div>

      {/* 6 TEAM MEMBER CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Core Development Team</h2>
            <p className="text-xs text-slate-500 mt-0.5">Engineers responsible for system architecture, machine learning, and delivery</p>
          </div>
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black rounded-full">
            6 Members
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div 
                key={m.name}
                className={`bg-white rounded-3xl border ${
                  m.isLead ? 'border-orange-300 shadow-md ring-1 ring-orange-400/20' : 'border-slate-200 shadow-sm'
                } p-6 flex flex-col justify-between hover:shadow-xl transition-all space-y-5 group`}
              >
                <div className="space-y-4">
                  {/* Top row: Avatar icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} p-0.5 shadow-md flex items-center justify-center`}>
                      <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${m.badgeColor}`}>
                      {m.tag}
                    </span>
                  </div>

                  {/* Name and Role */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                      {m.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">{m.role}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {m.description}
                  </p>
                </div>

                {/* Key Skills */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Key Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.skills.map((s) => (
                      <span 
                        key={s} 
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md border border-slate-200/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SIH PROJECT MISSION STATEMENT */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 rounded-3xl border border-orange-200/80 p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-orange-950 uppercase tracking-wider">
          <Award className="w-4 h-4 text-orange-600" /> SIH Solution Summary
        </div>
        <h3 className="text-xl font-black text-slate-900">
          Empowering Indian Youth with Transparent, Explainable, and Meritocratic AI Allocation
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl font-medium">
          Built specifically for the Ministry of Corporate Affairs (MCA) to automate the Prime Minister’s Internship Scheme. Our platform eliminates human bias, processes thousands of applications in milliseconds, guarantees exact constitutional reservation quotas, and provides complete explainability scorecards for every single applicant.
        </p>
      </div>

    </div>
  );
}
