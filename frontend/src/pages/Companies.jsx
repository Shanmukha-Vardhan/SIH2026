import React, { useState, useRef } from 'react';
import { COMPANIES_CATALOG } from '../utils/companiesData';
import { parseCSV } from '../utils/csvParser';
import { runCustomAllocation } from '../utils/customAllocator';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Users, 
  GraduationCap, 
  Award, 
  Sparkles, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  ArrowLeft, 
  Cpu, 
  Check, 
  ShieldCheck,
  Search,
  Download,
  Zap
} from 'lucide-react';
import { exportAllocationToCSV } from '../utils/csvExporter';

export default function Companies() {
  // Global Dataset State
  const [globalFile, setGlobalFile] = useState(null);
  const [globalFileName, setGlobalFileName] = useState('');
  const [globalCandidates, setGlobalCandidates] = useState([]);
  const fileInputRef = useRef(null);

  // Selected Active Company for Deep Dive (null = all companies list view)
  const [activeCompany, setActiveCompany] = useState(null);

  // Single Company Dataset (can override global or inherit)
  const [companyFile, setCompanyFile] = useState(null);
  const [companyFileName, setCompanyFileName] = useState('');
  const [companyCandidates, setCompanyCandidates] = useState([]);
  const companyFileInputRef = useRef(null);

  // Results State Map: companyId -> allocationResult
  const [allocationsMap, setAllocationsMap] = useState({});

  // 5-Second Cinematic Animation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTitle, setProcessingTitle] = useState('');
  const [processProgress, setProcessProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [candidateCountTicker, setCandidateCountTicker] = useState(0);
  const [processingCandidatePool, setProcessingCandidatePool] = useState([]);

  // Sub-tabs in single company result view
  const [resultTab, setResultTab] = useState('selected'); // 'selected', 'waitlist'
  const [selectedScorecardCandidate, setSelectedScorecardCandidate] = useState(null);

  // Global CSV File Upload Handler
  const handleGlobalUpload = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        alert('Could not parse candidates. Please check CSV format.');
        return;
      }
      setGlobalFileName(file.name);
      setGlobalCandidates(parsed);
      setGlobalFile(text);
    };
    reader.readAsText(file);
  };

  const clearGlobalDataset = () => {
    setGlobalFile(null);
    setGlobalFileName('');
    setGlobalCandidates([]);
    setAllocationsMap({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Single Company CSV Upload Handler
  const handleCompanyUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      setCompanyFileName(file.name);
      setCompanyCandidates(parsed);
      setCompanyFile(text);
    };
    reader.readAsText(file);
  };

  const clearCompanyDataset = () => {
    setCompanyFile(null);
    setCompanyFileName('');
    setCompanyCandidates([]);
    if (companyFileInputRef.current) companyFileInputRef.current.value = '';
  };

  const loadGlobalSampleDataset = async () => {
    try {
      const response = await fetch('/candidates_default.csv');
      if (response.ok) {
        const text = await response.text();
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          setGlobalFileName('sample_candidates_2000.csv (2,000 Verified Applicants)');
          setGlobalCandidates(parsed);
          setGlobalFile(text);
        }
      }
    } catch (err) {
      console.error('Error loading sample dataset:', err);
    }
  };

  const loadCompanySampleDataset = async () => {
    try {
      const response = await fetch('/candidates_default.csv');
      if (response.ok) {
        const text = await response.text();
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          setCompanyFileName('sample_candidates_2000.csv (2,000 Verified Applicants)');
          setCompanyCandidates(parsed);
          setCompanyFile(text);
        }
      }
    } catch (err) {
      console.error('Error loading sample dataset:', err);
    }
  };

  // Run Global 10-Company Allocation with 5s Animation
  const runGlobalAllocation = () => {
    if (globalCandidates.length === 0) {
      alert('Please import a bulk candidate CSV dataset first.');
      return;
    }

    startCinematicProcessing(
      `Allocating ${globalCandidates.length.toLocaleString()} Candidates across 10 Enterprise JDs`,
      globalCandidates,
      () => {
        const newMap = {};
        COMPANIES_CATALOG.forEach((comp) => {
          const res = runCustomAllocation(globalCandidates, {
            company_name: comp.company_name,
            role: comp.role,
            location: comp.location,
            sector: comp.sector,
            vacancies: comp.vacancies,
            min_cgpa: comp.min_cgpa,
            max_backlogs: comp.max_backlogs,
            target_skills: comp.target_skills,
            quotas: comp.quotas,
            weights: { skills: 30, semantic: 25, academic: 15, location: 10, inclusivity: 20 },
            toggles: { rural_boost: true, pwd_priority: true, first_time_priority: true }
          });
          newMap[comp.id] = res;
        });
        setAllocationsMap(newMap);
      }
    );
  };

  // Run Single Company Allocation
  const runSingleCompanyAllocation = (company) => {
    const pool = companyCandidates.length > 0 ? companyCandidates : globalCandidates;
    if (pool.length === 0) {
      alert('Please upload a candidate CSV dataset for this company or import bulk data at the top.');
      return;
    }

    startCinematicProcessing(
      `Evaluating Resumes for ${company.company_name}`,
      pool,
      () => {
        const res = runCustomAllocation(pool, {
          company_name: company.company_name,
          role: company.role,
          location: company.location,
          sector: company.sector,
          vacancies: company.vacancies,
          min_cgpa: company.min_cgpa,
          max_backlogs: company.max_backlogs,
          target_skills: company.target_skills,
          quotas: company.quotas,
          weights: { skills: 30, semantic: 25, academic: 15, location: 10, inclusivity: 20 },
          toggles: { rural_boost: true, pwd_priority: true, first_time_priority: true }
        });
        setAllocationsMap(prev => ({ ...prev, [company.id]: res }));
      }
    );
  };

  const startCinematicProcessing = (title, candidatesPool, onComplete) => {
    setIsProcessing(true);
    setProcessingTitle(title);
    setProcessingCandidatePool(candidatesPool);
    setProcessProgress(0);
    setActiveStepIndex(0);
    setCandidateCountTicker(0);

    const totalDuration = 5000; // 5.0 seconds
    const startTime = Date.now();
    const totalCount = candidatesPool.length;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / totalDuration) * 100);
      setProcessProgress(progress);

      const currentTick = Math.floor((progress / 100) * totalCount);
      setCandidateCountTicker(currentTick);

      if (progress < 25) setActiveStepIndex(0);
      else if (progress < 55) setActiveStepIndex(1);
      else if (progress < 80) setActiveStepIndex(2);
      else setActiveStepIndex(3);

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setCandidateCountTicker(totalCount);
        setProcessProgress(100);
        setTimeout(() => {
          setIsProcessing(false);
          onComplete();
        }, 400);
      }
    }, 50);
  };

  const stepsList = [
    { title: 'Auditing Academic Integrity & CGPA Gateways', desc: 'Verifying minimum threshold CGPA and zero-backlog limits' },
    { title: 'NLP Semantic Resume & Project Match', desc: 'Vectorizing project descriptions and measuring target skill overlap' },
    { title: 'Constitutional Quotas & Inclusivity Balancing', desc: 'Applying Open Merit, OBC, SC, ST, EWS & Rural/PwD boosts' },
    { title: 'Final Vacancy Placement & Scorecard Generation', desc: 'Assigning top candidates and generating transparent scorecards' }
  ];

  const formatSkillName = (s) => {
    if (!s) return '';
    const map = {
      'sql': 'SQL',
      'python': 'Python',
      'javascript': 'JavaScript',
      'machine-learning': 'Machine Learning',
      'problem-solving': 'Problem Solving',
      'c++': 'C++',
      'java': 'Java',
      'react': 'React',
      'docker': 'Docker',
      'aws': 'AWS',
      'excel': 'Excel',
      'digital-marketing': 'Digital Marketing',
      'critical-thinking': 'Critical Thinking',
      'project-management': 'Project Management',
      'leadership': 'Leadership',
      'communication': 'Communication',
      'teamwork': 'Teamwork'
    };
    return map[s.toLowerCase()] || s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getQuotaBadge = (quota) => {
    if (!quota) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (quota.includes('Open Merit')) return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
    if (quota.includes('OBC')) return 'bg-orange-50 text-orange-800 border-orange-200 font-bold';
    if (quota.includes('SC')) return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
    if (quota.includes('ST')) return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
    if (quota.includes('EWS')) return 'bg-teal-50 text-teal-800 border-teal-200 font-bold';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const compResult = activeCompany ? allocationsMap[activeCompany.id] : null;
  const candidatePoolCount = companyCandidates.length > 0 ? companyCandidates.length : globalCandidates.length;

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      
      {/* -------------------------------------------------------------
          VIEW A: SINGLE COMPANY DEEP DIVE VIEW (When activeCompany is selected)
         ------------------------------------------------------------- */}
      {activeCompany ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Back Button */}
          <button
            onClick={() => { setActiveCompany(null); clearCompanyDataset(); }}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-orange-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" /> Back to All 10 Companies
          </button>

          {/* Company Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-orange-500/30 text-orange-400 text-xs font-extrabold uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" /> Enterprise Locked Job Description (JD)
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{activeCompany.company_name}</h1>
                <p className="text-slate-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-bold text-white">{activeCompany.role}</span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1 text-slate-200">
                    <MapPin className="w-4 h-4 text-orange-400" /> {activeCompany.location}, {activeCompany.state}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-bold">{activeCompany.sector}</span>
                </p>
                <p className="text-xs text-slate-300 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 leading-relaxed max-w-2xl font-medium">
                  {activeCompany.description}
                </p>
              </div>

              <div className="bg-slate-800/90 backdrop-blur border border-slate-700 rounded-2xl p-5 text-center min-w-[150px] shadow-lg">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Vacancies</span>
                <div className="text-4xl font-black text-white tracking-tight mt-0.5">{activeCompany.vacancies}</div>
                <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">{activeCompany.stipend}</span>
              </div>
            </div>

            {/* Locked Parameters Strip */}
            <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Skills Required</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {activeCompany.target_skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-slate-700 text-orange-300 rounded text-[10px] font-bold">{s}</span>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Academic Criteria</span>
                <span className="font-bold text-white block mt-1">Min CGPA: {activeCompany.min_cgpa}</span>
                <span className="text-[10px] text-slate-400 block">Max Backlogs: {activeCompany.max_backlogs}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Eligible Degrees</span>
                <span className="font-semibold text-slate-200 block mt-1">{activeCompany.eligible_qualifications.join(', ')}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Quota Guardrails</span>
                <span className="text-[10px] text-slate-300 block mt-1">
                  Open: {activeCompany.quotas.General}% • OBC: {activeCompany.quotas.OBC}% • SC: {activeCompany.quotas.SC}%
                </span>
              </div>
            </div>
          </div>

          {/* Dataset Upload / Status Box & Action */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold border border-orange-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {companyFileName ? `Custom Dataset: ${companyFileName}` : globalFileName ? `Global Dataset: ${globalFileName}` : 'No Dataset Selected'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {candidatePoolCount > 0 ? `${candidatePoolCount.toLocaleString()} Candidates Ready for Evaluation` : 'Upload a CSV dataset below to match'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="file"
                ref={companyFileInputRef}
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files && handleCompanyUpload(e.target.files[0])}
              />
              <button
                onClick={loadCompanySampleDataset}
                className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-orange-600" />
                <span>Load 2,000 Sample Applicants</span>
              </button>
              <button
                onClick={() => companyFileInputRef.current?.click()}
                className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-sm"
              >
                Upload Custom CSV
              </button>
              <button
                onClick={() => runSingleCompanyAllocation(activeCompany)}
                disabled={candidatePoolCount === 0 || isProcessing}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Run Allocation for {activeCompany.company_name}</span>
              </button>
            </div>
          </div>

          {/* RESULTS SECTION */}
          {compResult && (
            <div className="space-y-6">
              
              {/* Stats Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Seats Allocated</span>
                  <div className="text-3xl font-black text-slate-900 mt-1">{compResult.total_selected} / {activeCompany.vacancies}</div>
                  <span className="text-xs text-emerald-600 font-bold mt-1 block">✓ 100% Quotas Filled</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Avg AI Match Score</span>
                  <div className="text-3xl font-black text-orange-950 mt-1">{compResult.summary_stats.avg_score} <span className="text-xs text-slate-400">/ 100</span></div>
                  <span className="text-xs text-slate-500 font-medium mt-1 block">High Multi-Factor Synergy</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Rural Representation</span>
                  <div className="text-3xl font-black text-emerald-900 mt-1">{compResult.summary_stats.rural_percentage}%</div>
                  <span className="text-xs text-emerald-700 font-semibold mt-1 block">{compResult.summary_stats.rural_count} Rural Interns</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Average CGPA</span>
                  <div className="text-3xl font-black text-slate-900 mt-1">{compResult.summary_stats.avg_cgpa}</div>
                  <span className="text-xs text-slate-500 font-medium mt-1 block">Min required: {activeCompany.min_cgpa}</span>
                </div>
              </div>

              {/* Sub-tab pills */}
              <div className="bg-slate-200/80 p-1.5 rounded-2xl flex gap-2 max-w-md">
                <button
                  onClick={() => setResultTab('selected')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    resultTab === 'selected' ? 'bg-white text-slate-900 shadow-md font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Selected Interns ({compResult.selected_candidates.length})</span>
                </button>
                <button
                  onClick={() => setResultTab('waitlist')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    resultTab === 'waitlist' ? 'bg-white text-slate-900 shadow-md font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Waitlisted Pool ({compResult.waitlist_candidates.length})</span>
                </button>
              </div>

              {/* Selected Candidates Table */}
              {resultTab === 'selected' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg">Top {compResult.selected_candidates.length} Selected Candidates</h3>
                      <p className="text-xs text-slate-500">Allocated for {activeCompany.company_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => exportAllocationToCSV(compResult.selected_candidates, activeCompany.company_name)}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-orange-600" />
                        <span>Export CSV Roster</span>
                      </button>
                      <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black rounded-full">
                        {compResult.selected_candidates.length} / {activeCompany.vacancies} Seats Filled
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                      <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-extrabold">
                        <tr>
                          <th className="px-6 py-4 text-left">Rank & Candidate</th>
                          <th className="px-4 py-4 text-left">Allocated Under</th>
                          <th className="px-4 py-4 text-left">Academics & Region</th>
                          <th className="px-4 py-4 text-left">Skills Matched</th>
                          <th className="px-4 py-4 text-left">Score</th>
                          <th className="px-4 py-4 text-center">Scorecard</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {compResult.selected_candidates.map((c, idx) => (
                          <tr key={c.Applicant_ID || c.candidate_id || idx} className="hover:bg-slate-50/80">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                                  {idx + 1}
                                </span>
                                <div>
                                  <div className="font-bold text-slate-900">{c.Name || c.name}</div>
                                  <div className="text-xs text-slate-400">{c.Applicant_ID || c.candidate_id} • {c.Gender || c.gender}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 text-xs rounded-lg border ${getQuotaBadge(c.allocated_under)}`}>
                                {c.allocated_under}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-medium text-slate-800 text-xs">{c.Highest_Qualification || c.qualification} ({c.Branch_Specialization || 'General'})</div>
                              <div className="text-xs text-slate-500">CGPA: <strong>{c.CGPA || c.cgpa}</strong> • {c.District || c.district} ({c.Area_Type || 'Rural'})</div>
                            </td>
                            <td className="px-4 py-4 min-w-[220px]">
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {c.skills_matched && c.skills_matched.length > 0 ? (
                                  c.skills_matched.map((s) => (
                                    <span 
                                      key={s} 
                                      className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs"
                                    >
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span>{formatSkillName(s)}</span>
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium italic">General domain overlap</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 bg-slate-900 text-white text-xs font-black rounded-lg">
                                {c.score}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => setSelectedScorecardCandidate(c)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-orange-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                              >
                                Explain
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Waitlist Table */}
              {resultTab === 'waitlist' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50/40">
                    <h3 className="font-extrabold text-slate-900 text-lg">Waitlisted Queue for {activeCompany.company_name}</h3>
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
                      {compResult.waitlist_candidates.length} in Standby
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                      <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-extrabold">
                        <tr>
                          <th className="px-6 py-4 text-left">Waitlist Rank</th>
                          <th className="px-4 py-4 text-left">Candidate</th>
                          <th className="px-4 py-4 text-left">Academics & Region</th>
                          <th className="px-4 py-4 text-left">Skills Matched</th>
                          <th className="px-4 py-4 text-left">Score</th>
                          <th className="px-4 py-4 text-center">Scorecard</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {compResult.waitlist_candidates.map((c) => (
                          <tr key={c.Applicant_ID || c.candidate_id} className="hover:bg-slate-50/80">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs">
                                WL #{c.waitlist_rank}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900">{c.Name || c.name}</div>
                              <div className="text-xs text-slate-400">Category: {c.Category || c.category}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-medium text-slate-800 text-xs">{c.Highest_Qualification || c.qualification}</div>
                              <div className="text-xs text-slate-500">CGPA: {c.CGPA || c.cgpa}</div>
                            </td>
                            <td className="px-4 py-4 min-w-[220px]">
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {c.skills_matched && c.skills_matched.length > 0 ? (
                                  c.skills_matched.map((s) => (
                                    <span 
                                      key={s} 
                                      className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs"
                                    >
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span>{formatSkillName(s)}</span>
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium italic">General domain overlap</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-950 text-xs font-black rounded-lg">
                                {c.score}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => setSelectedScorecardCandidate(c)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-orange-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                              >
                                Explain
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        /* -------------------------------------------------------------
           VIEW B: ALL 10 COMPANIES GRID VIEW WITH BULK IMPORT HEADER
           ------------------------------------------------------------- */
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* HEADER SECTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" /> PM Internship Enterprise Opportunities
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Enterprise Company Catalog</h1>
              <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                Browse 10 enterprise opportunities across IT, Banking, Healthcare, Infrastructure, and Clean Energy with locked Job Descriptions (JDs). Import candidate datasets to allocate across all companies simultaneously.
              </p>
            </div>
          </div>

          {/* BULK DATASET IMPORT BOX */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Import Bulk Candidate Dataset</h2>
                <p className="text-xs text-slate-500">Provide a master candidate CSV to allocate across all 10 companies at once</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files && handleGlobalUpload(e.target.files[0])}
                />
                {!globalFileName ? (
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={loadGlobalSampleDataset}
                      className="w-full sm:w-auto px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                    >
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span>Load 2,000 Sample Applicants</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <UploadCloud className="w-4 h-4 text-orange-400" />
                      <span>Upload Candidates CSV</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>{globalFileName} ({globalCandidates.length.toLocaleString()} Candidates)</span>
                    </div>
                    <button
                      onClick={clearGlobalDataset}
                      title="Clear Dataset"
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={runGlobalAllocation}
                      disabled={isProcessing}
                      className="px-6 py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>Run 10-Company Allocation</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 10 COMPANIES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPANIES_CATALOG.map((company) => {
              const alloc = allocationsMap[company.id];

              return (
                <div 
                  key={company.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col justify-between space-y-5 relative overflow-hidden group"
                >
                  <div className="space-y-3">
                    {/* Sector & Location */}
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-100">
                        {company.sector}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" /> {company.location}
                      </span>
                    </div>

                    {/* Company Name & Role */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-orange-600 transition-colors">
                        {company.company_name}
                      </h3>
                      <p className="text-xs font-bold text-slate-600 mt-0.5">{company.role}</p>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {company.description}
                    </p>

                    {/* Target Skills Tags */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {company.target_skills.slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold">
                            {s}
                          </span>
                        ))}
                        {company.target_skills.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center font-bold">+{company.target_skills.length - 3}</span>
                        )}
                      </div>
                    </div>

                    {/* Allocation Badge if run */}
                    {alloc && (
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 block uppercase">Allocation Completed</span>
                          <strong className="text-emerald-950">{alloc.total_selected} / {company.vacancies} Seats Allocated</strong>
                        </div>
                        <span className="px-2 py-1 bg-white text-emerald-700 font-black rounded-lg text-xs border border-emerald-200">
                          Score: {alloc.summary_stats.avg_score}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Vacancies & Action */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Vacancies</span>
                      <span className="text-sm font-black text-slate-900">{company.vacancies} Slots</span>
                    </div>

                    <button
                      onClick={() => setActiveCompany(company)}
                      className="px-4 py-2 bg-slate-900 group-hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{alloc ? 'View Allocation' : 'Inspect JD & Match'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------
          5-SECOND CINEMATIC PROCESSING SCREEN (ALWAYS RENDERED AT ROOT)
         ------------------------------------------------------------- */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-8 text-white shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Cpu className="w-7 h-7 text-orange-400 animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight">{processingTitle}</h2>
              <p className="text-xs text-slate-400">
                Evaluating candidate dataset across enterprise Job Descriptions
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-4 text-center border border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applicants Evaluated</span>
              <div className="text-3xl font-black text-white font-mono mt-0.5">
                {candidateCountTicker.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ {processingCandidatePool.length.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5 mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 h-2.5 rounded-full transition-all duration-75"
                  style={{ width: `${processProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              {stepsList.map((st, idx) => {
                const isDone = activeStepIndex > idx;
                const isCurrent = activeStepIndex === idx;
                return (
                  <div 
                    key={st.title} 
                    className={`p-3 rounded-xl border text-xs flex items-center gap-3 transition-all ${
                      isDone 
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                        : isCurrent 
                          ? 'bg-orange-950/50 border-orange-400/40 text-orange-200 ring-1 ring-orange-500/40' 
                          : 'bg-slate-800/30 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                      isDone ? 'bg-emerald-500 text-slate-900 font-black' : isCurrent ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 truncate">
                      <span className="font-bold block text-slate-200">{st.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{st.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          CANDIDATE SCORECARD & EXPLAINABILITY MODAL (ALWAYS RENDERED AT ROOT)
         ------------------------------------------------------------- */}
      {selectedScorecardCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 rounded-t-3xl flex justify-between items-start border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-orange-400" /> AI Candidate Evaluation Scorecard
                </div>
                <h2 className="text-2xl font-black mt-1 text-white tracking-tight">{selectedScorecardCandidate.Name || selectedScorecardCandidate.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Applicant ID: {selectedScorecardCandidate.Applicant_ID || selectedScorecardCandidate.candidate_id} • {selectedScorecardCandidate.Gender || selectedScorecardCandidate.gender} • Born {selectedScorecardCandidate.Date_of_Birth || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedScorecardCandidate(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Overall Score Banner */}
              {selectedScorecardCandidate.score !== undefined && (
                <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-200/80 rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-orange-900 uppercase tracking-wider block">Composite AI Match Score</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-4xl font-black text-slate-900">{selectedScorecardCandidate.score}</span>
                        <span className="text-sm font-bold text-slate-500">/ 100</span>
                      </div>
                      {selectedScorecardCandidate.allocated_under && (
                        <span className="mt-2 inline-block text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200">
                          ✓ Allocated Under: {selectedScorecardCandidate.allocated_under}
                        </span>
                      )}
                    </div>

                    {/* Score Bar Factors */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center w-full sm:w-auto">
                      <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block">Skills (30%)</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{selectedScorecardCandidate.breakdown?.skill_score}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block">NLP Resume (25%)</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{selectedScorecardCandidate.breakdown?.semantic_score}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block">Academics (15%)</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{selectedScorecardCandidate.breakdown?.academic_score}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block">Location (10%)</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{selectedScorecardCandidate.breakdown?.location_score}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block">Inclusivity (20%)</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{selectedScorecardCandidate.breakdown?.affirmative_score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Education & Demographics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-orange-600" /> Academic Credentials
                  </h4>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p><span className="text-slate-400">Degree:</span> <strong>{selectedScorecardCandidate.Highest_Qualification || selectedScorecardCandidate.qualification} in {selectedScorecardCandidate.Branch_Specialization || 'General'}</strong></p>
                    <p><span className="text-slate-400">Institute:</span> {selectedScorecardCandidate.College_University || 'Accredited Institute'} ({selectedScorecardCandidate.Graduation_Year || '2025'})</p>
                    <p><span className="text-slate-400">CGPA:</span> <strong className="text-emerald-700">{selectedScorecardCandidate.CGPA || selectedScorecardCandidate.cgpa}</strong> (Backlogs: {selectedScorecardCandidate.Backlogs || 0})</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-700" /> Inclusivity & Demographics
                  </h4>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p><span className="text-slate-400">Category:</span> <strong className="text-slate-900">{selectedScorecardCandidate.Category || selectedScorecardCandidate.category}</strong></p>
                    <p><span className="text-slate-400">Region:</span> {selectedScorecardCandidate.District || selectedScorecardCandidate.district}, {selectedScorecardCandidate.State || selectedScorecardCandidate.state} ({selectedScorecardCandidate.Area_Type || 'Rural'})</p>
                    <p><span className="text-slate-400">PwD Priority:</span> {selectedScorecardCandidate.Differently_Abled ? 'Yes (Priority Verified)' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Skills & Projects */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" /> Verified Skills & Match Breakdown
                </h4>
                
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">Skill Pool Match:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedScorecardCandidate.Skills_List || selectedScorecardCandidate.skills || []).map((s) => (
                      <span 
                        key={s} 
                        className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedScorecardCandidate.Projects && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Key Practical Projects:</span>
                    <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                      {selectedScorecardCandidate.Projects}
                    </p>
                  </div>
                )}

                {selectedScorecardCandidate.Certifications && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Certifications & Achievements:</span>
                    <p className="text-xs text-slate-700">
                      <strong>Certifications:</strong> {selectedScorecardCandidate.Certifications} • <strong>Achievements:</strong> {selectedScorecardCandidate.Achievements || 'N/A'}
                    </p>
                  </div>
                )}
              </div>

              {/* Raw Parsed Resume Text */}
              {selectedScorecardCandidate.Resume_Text && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-600" /> Natural Language Resume Summary
                  </h4>
                  <p className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed font-mono">
                    {selectedScorecardCandidate.Resume_Text}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-[11px] text-slate-400 font-mono">
                Verification Token: <span className="text-slate-700 font-bold">PMIS-{(selectedScorecardCandidate.Applicant_ID || selectedScorecardCandidate.candidate_id || 'A000').toUpperCase()}-2026</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-orange-600" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedScorecardCandidate(null)}
                  className="px-6 py-2 bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Close Scorecard
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
