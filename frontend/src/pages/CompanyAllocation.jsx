import React, { useState, useEffect } from 'react';
import { 
  fetchCompanyXProfile, 
  fetchCompanyXApplicants, 
  runCompanyXAllocation, 
  fetchCompanyXResults 
} from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Building2, 
  MapPin, 
  Users, 
  GraduationCap, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Search, 
  X, 
  FileText, 
  Layers, 
  Briefcase,
  AlertCircle,
  Filter,
  Check,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Cpu,
  Download
} from 'lucide-react';
import { exportAllocationToCSV } from '../utils/csvExporter';

export default function CompanyAllocation() {
  const [profile, setProfile] = useState(null);
  const [allocationData, setAllocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('selected'); // 'selected', 'waitlist', 'all_applicants'
  
  // 5-Second Cinematic Animation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [candidateCountTicker, setCandidateCountTicker] = useState(0);

  // All applicants state
  const [applicants, setApplicants] = useState([]);
  const [applicantTotal, setApplicantTotal] = useState(0);
  const [applicantPage, setApplicantPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Modal State for Candidate Detail / Explainability
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'all_applicants') {
      loadApplicants();
    }
  }, [activeTab, applicantPage, search, categoryFilter, areaFilter]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [prof, results] = await Promise.all([
        fetchCompanyXProfile(),
        fetchCompanyXResults()
      ]);
      setProfile(prof);
      setAllocationData(results);
    } catch (err) {
      console.error('Error loading AVOLVE data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplicants = async () => {
    setLoadingApplicants(true);
    try {
      const res = await fetchCompanyXApplicants({
        page: applicantPage,
        limit: 20,
        search,
        category: categoryFilter,
        area_type: areaFilter
      });
      setApplicants(res.data || []);
      setApplicantTotal(res.total || 0);
    } catch (err) {
      console.error('Error loading applicants:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleRunAllocation = async () => {
    const totalCount = allocationData?.total_applicants || 2000;
    
    setIsProcessing(true);
    setProcessProgress(0);
    setActiveStepIndex(0);
    setCandidateCountTicker(0);

    const totalDuration = 5000; // 5.0 seconds
    const startTime = Date.now();

    // Call backend allocation API
    const allocationPromise = runCompanyXAllocation();

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

        allocationPromise.then((res) => {
          setTimeout(() => {
            setIsProcessing(false);
            setAllocationData(res);
            setActiveTab('selected');
          }, 300);
        }).catch((err) => {
          setIsProcessing(false);
          console.error('Allocation run error:', err);
          alert('Failed to run allocation. Please ensure backend is running.');
        });
      }
    }, 50);
  };

  const stepsList = [
    { title: 'Academic Gatekeeping & Backlog Auditing', desc: 'Enforcing CGPA >= 7.0 & Backlogs == 0' },
    { title: 'NLP Project Relevance & Semantic Vectorization', desc: 'Analyzing technical keywords & experience against target skills' },
    { title: 'Constitutional Quotas & Inclusivity Optimization', desc: 'Balancing Open Merit (50%), OBC (25%), SC (15%), ST (5%), EWS (5%)' },
    { title: 'Seat Assignment & Explainability Matrix', desc: 'Allocating top 20 vacancies and generating transparency scorecards' }
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

  const getScoreBadge = (score) => {
    if (score >= 75) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (score >= 60) return 'bg-orange-50 text-orange-800 border-orange-200';
    if (score >= 45) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-800 border-rose-200';
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

  if (loading) return <LoadingSpinner text="Initializing AVOLVE Enterprise Engine & Candidate Intelligence..." />;

  const stats = allocationData?.summary_stats || {};
  const selectedList = allocationData?.selected_candidates || [];
  const waitlistList = allocationData?.waitlist_candidates || [];

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      
      {/* ENTERPRISE HERO CARD */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-8 overflow-hidden text-white">
        {/* Indian Tricolor Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide uppercase">
              <Building2 className="w-3.5 h-3.5" /> Single-Enterprise AI Matching Engine
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {profile?.company_name || 'AVOLVE Technologies Pvt. Ltd.'}
              </h1>
              <p className="text-slate-300 text-base mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-bold text-white">{profile?.role}</span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-slate-200">
                  <MapPin className="w-4 h-4 text-orange-400" /> {profile?.location}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-bold">{profile?.sector}</span>
              </p>
            </div>

            {/* Target Skills Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400">Target Skills:</span>
              {profile?.target_skills?.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-orange-300 border border-slate-700">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Action & Vacancy Counter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <div className="bg-slate-800/90 backdrop-blur border border-slate-700 rounded-2xl p-4 text-center min-w-[140px] shadow-inner">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Vacancies</span>
              <div className="text-4xl font-black text-white tracking-tight mt-0.5">
                {profile?.vacancies || 20}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                from {allocationData?.total_applicants || 2000} Applicants
              </span>
            </div>

            <button
              onClick={handleRunAllocation}
              disabled={isProcessing}
              className="px-6 py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>{isProcessing ? 'Evaluating Resumes...' : 'Execute AI Allocation'}</span>
            </button>
          </div>
        </div>

        {/* Quota Breakdown Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Open Merit (Unreserved)</span>
            <span className="text-base font-extrabold text-white">10 Seats <span className="text-xs text-orange-400 font-bold">(50%)</span></span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">OBC Quota</span>
            <span className="text-base font-extrabold text-white">5 Seats <span className="text-xs text-orange-400 font-bold">(25%)</span></span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">SC Quota</span>
            <span className="text-base font-extrabold text-white">3 Seats <span className="text-xs text-amber-400 font-bold">(15%)</span></span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">ST Quota</span>
            <span className="text-base font-extrabold text-white">1 Seat <span className="text-xs text-emerald-400 font-bold">(5%)</span></span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">EWS Quota</span>
            <span className="text-base font-extrabold text-white">1 Seat <span className="text-xs text-emerald-400 font-bold">(5%)</span></span>
          </div>
        </div>
      </div>

      {/* METRICS & DIVERSITY OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Match Score</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{stats?.avg_score || 0}</span>
            <span className="text-xs text-slate-400 ml-1 font-semibold">/ 100</span>
          </div>
          <p className="text-xs text-emerald-700 font-bold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Multi-Factor Fit
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rural Representation</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{stats?.rural_percentage || 0}%</span>
            <span className="text-xs text-slate-400 ml-1 font-semibold">({stats?.rural_count || 0}/20)</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-2">
            Inclusive representation from rural districts
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Standard</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{stats?.avg_cgpa || 0}</span>
            <span className="text-xs text-slate-400 ml-1 font-semibold">Avg CGPA</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-2">
            Min requirement: 7.0 (0 Backlogs)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Quota Compliance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-700">100% Satisfied</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-2">
            {stats?.female_count || 0} Women • {stats?.pwd_count || 0} PwD selected
          </p>
        </div>

      </div>

      {/* SEGMENTED FLOATING TABS */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl flex flex-wrap gap-1.5 border border-slate-300/60 max-w-2xl">
        <button
          onClick={() => setActiveTab('selected')}
          className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'selected'
              ? 'bg-white text-slate-900 shadow-md shadow-slate-300/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${activeTab === 'selected' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>Top 20 Selected Interns</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-900 font-black">
            {selectedList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('waitlist')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'waitlist'
              ? 'bg-white text-slate-900 shadow-md shadow-slate-300/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
          }`}
        >
          <Clock className={`w-4 h-4 ${activeTab === 'waitlist' ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>Waitlisted Pool</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-900 font-black">
            {waitlistList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all_applicants')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'all_applicants'
              ? 'bg-white text-slate-900 shadow-md shadow-slate-300/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
          }`}
        >
          <Users className={`w-4 h-4 ${activeTab === 'all_applicants' ? 'text-orange-600' : 'text-slate-400'}`} />
          <span>All Applicants</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-orange-100 text-orange-900 font-black">
            {allocationData?.total_applicants || 2000}
          </span>
        </button>
      </div>

      {/* TAB 1: TOP 20 SELECTED INTERNS */}
      {activeTab === 'selected' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Top 20 Allocated Candidates</h3>
              <p className="text-xs text-slate-500 mt-1">
                Selected via Multi-Factor AI Engine adhering to constitutional reservation & affirmative action
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportAllocationToCSV(selectedList, profile?.company_name || 'AVOLVE_Technologies')}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-orange-600" />
                <span>Export CSV Roster</span>
              </button>
              <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-black rounded-full border border-emerald-200 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> 20 / 20 Seats Allocated
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80 text-[11px] text-slate-500 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="px-6 py-4 text-left">Rank & Candidate</th>
                  <th className="px-4 py-4 text-left">Allocated Under</th>
                  <th className="px-4 py-4 text-left">Academic & Location</th>
                  <th className="px-4 py-4 text-left">Skills Matched</th>
                  <th className="px-4 py-4 text-left">AI Match Score</th>
                  <th className="px-4 py-4 text-center">Explainability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {selectedList.map((c, idx) => (
                  <tr key={c.Applicant_ID || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                            {c.Name}
                            {c.Differently_Abled && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-md font-bold border border-purple-200">
                                PwD
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">
                            ID: {c.Applicant_ID} • {c.Gender}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs rounded-lg border inline-block ${getQuotaBadge(c.allocated_under)}`}>
                        {c.allocated_under}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 text-xs">
                        {c.Highest_Qualification} in {c.Branch_Specialization}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        CGPA: <strong className="text-slate-800">{c.CGPA}</strong> • {c.District}, {c.State} ({c.Area_Type})
                      </div>
                    </td>

                    <td className="px-4 py-4 min-w-[220px]">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {c.skills_matched && c.skills_matched.length > 0 ? (
                          c.skills_matched.map((skill) => (
                            <span 
                              key={skill} 
                              className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs"
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{formatSkillName(skill)}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">General domain overlap</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-black rounded-lg border ${getScoreBadge(c.score)}`}>
                          {c.score}
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                          <div 
                            className="bg-orange-500 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, c.score)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className="px-3 py-1.5 bg-slate-900 text-white hover:bg-orange-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 mx-auto cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> Explain
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WAITLISTED POOL */}
      {activeTab === 'waitlist' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50/30">
            <div>
              <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">Top 10 Waitlisted Candidates</h3>
              <p className="text-xs text-slate-500 mt-1">
                Automated fallback pool in case of candidate offer non-acceptance
              </p>
            </div>
            <span className="px-3.5 py-1.5 bg-amber-100 text-amber-900 text-xs font-black rounded-full border border-amber-200">
              10 In Queue
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80 text-[11px] text-slate-500 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="px-6 py-4 text-left">Waitlist Rank</th>
                  <th className="px-4 py-4 text-left">Candidate & Category</th>
                  <th className="px-4 py-4 text-left">Academic & Location</th>
                  <th className="px-4 py-4 text-left">Skills Matched</th>
                  <th className="px-4 py-4 text-left">AI Match Score</th>
                  <th className="px-4 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {waitlistList.map((c) => (
                  <tr key={c.Applicant_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs">
                        WL #{c.waitlist_rank}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-sm">{c.Name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {c.Applicant_ID} • Category: <strong className="text-slate-700">{c.Category}</strong></div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 text-xs">{c.Highest_Qualification} ({c.Branch_Specialization})</div>
                      <div className="text-xs text-slate-500 mt-0.5">CGPA: {c.CGPA} • {c.District}, {c.State}</div>
                    </td>

                    <td className="px-4 py-4 min-w-[220px]">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {c.skills_matched && c.skills_matched.length > 0 ? (
                          c.skills_matched.map((skill) => (
                            <span 
                              key={skill} 
                              className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs"
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{formatSkillName(skill)}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">General domain overlap</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-black rounded-lg border ${getScoreBadge(c.score)}`}>
                        {c.score}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className="px-3 py-1.5 bg-slate-900 text-white hover:bg-orange-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 mx-auto cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> Explain
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL 2,000 APPLICANTS DIRECTORY */}
      {activeTab === 'all_applicants' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-100 space-y-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">Applicant Directory (2,000 Total)</h3>
                <p className="text-xs text-slate-500 mt-1">Search, filter, and inspect detailed profiles</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                Displaying {applicants.length} of {applicantTotal} Candidates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search candidate name, ID, skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500 shadow-sm"
              >
                <option value="">All Social Categories</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>

              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500 shadow-sm"
              >
                <option value="">All Area Types</option>
                <option value="Rural">Rural</option>
                <option value="Semi-Urban">Semi-Urban</option>
                <option value="Urban">Urban</option>
              </select>
            </div>
          </div>

          {loadingApplicants ? (
            <LoadingSpinner text="Querying candidate directory..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80 text-[11px] text-slate-500 uppercase tracking-wider font-extrabold">
                  <tr>
                    <th className="px-6 py-4 text-left">Applicant</th>
                    <th className="px-4 py-4 text-left">Category & Region</th>
                    <th className="px-4 py-4 text-left">Degree & CGPA</th>
                    <th className="px-4 py-4 text-left">Declared Skills</th>
                    <th className="px-4 py-4 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {applicants.map((a) => (
                    <tr key={a.Applicant_ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-sm">{a.Name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{a.Applicant_ID} • {a.Gender}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {a.Category}
                        </span>
                        <div className="text-xs text-slate-500 mt-1">{a.Area_Type} • {a.District}, {a.State}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-xs">{a.Highest_Qualification} ({a.Branch_Specialization})</div>
                        <div className="text-xs text-slate-500 mt-0.5">CGPA: <strong>{a.CGPA}</strong> • Backlogs: {a.Backlogs}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {a.Skills_List?.slice(0, 4).map((s) => (
                            <span key={s} className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 rounded-md font-medium">
                              {s}
                            </span>
                          ))}
                          {a.Skills_List?.length > 4 && (
                            <span className="text-[10px] text-slate-400 self-center font-bold">+{a.Skills_List.length - 4}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedCandidate(a)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          View Resume
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-5 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
            <button
              disabled={applicantPage === 1}
              onClick={() => setApplicantPage((p) => p - 1)}
              className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-slate-50 shadow-sm cursor-pointer"
            >
              Previous Page
            </button>
            <span className="text-xs font-bold text-slate-600">
              Page {applicantPage} of {Math.ceil(applicantTotal / 20)}
            </span>
            <button
              disabled={applicantPage * 20 >= applicantTotal}
              onClick={() => setApplicantPage((p) => p + 1)}
              className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-slate-50 shadow-sm cursor-pointer"
            >
              Next Page
            </button>
          </div>
        </div>
      )}

      {/* 5-SECOND CINEMATIC PROCESSING SCREEN */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-8 text-white shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Cpu className="w-7 h-7 text-orange-400 animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight">AI Matching Engine in Progress</h2>
              <p className="text-xs text-slate-400">
                Evaluating candidate dataset for {profile?.company_name || 'AVOLVE Technologies'}
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-4 text-center border border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applicants Evaluated</span>
              <div className="text-3xl font-black text-white font-mono mt-0.5">
                {candidateCountTicker.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ {(allocationData?.total_applicants || 2000).toLocaleString()}</span>
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

      {/* CANDIDATE SCORECARD & EXPLAINABILITY MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 rounded-t-3xl flex justify-between items-start border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-orange-400" /> AI Candidate Evaluation Scorecard
                </div>
                <h2 className="text-2xl font-black mt-1 text-white tracking-tight">{selectedCandidate.Name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Applicant ID: {selectedCandidate.Applicant_ID} • {selectedCandidate.Gender} • Born {selectedCandidate.Date_of_Birth}
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Overall Score Banner */}
              {selectedCandidate.score !== undefined && (
                <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-200/80 rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-orange-950 uppercase tracking-wider block">Composite AI Match Score</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-4xl font-black text-slate-900">{selectedCandidate.score}</span>
                        <span className="text-sm font-bold text-slate-500">/ 100</span>
                      </div>
                      {selectedCandidate.allocated_under && (
                        <span className="mt-2 inline-block text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200">
                          ✓ Allocated Under: {selectedCandidate.allocated_under}
                        </span>
                      )}
                    </div>

                    {/* Score Bar Factors */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center w-full sm:w-auto">
                      <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block">Skills (30%)</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{selectedCandidate.breakdown?.skill_score}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block">NLP Resume (25%)</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{selectedCandidate.breakdown?.semantic_score}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block">Academics (15%)</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{selectedCandidate.breakdown?.academic_score}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block">Location (10%)</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{selectedCandidate.breakdown?.location_score}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block">Inclusivity (20%)</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{selectedCandidate.breakdown?.affirmative_score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Education & Demographics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-orange-600" /> Academic Qualifications
                  </h4>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p><span className="text-slate-400">Degree:</span> <strong>{selectedCandidate.Highest_Qualification} in {selectedCandidate.Branch_Specialization}</strong></p>
                    <p><span className="text-slate-400">Institute:</span> {selectedCandidate.College_University} ({selectedCandidate.Graduation_Year})</p>
                    <p><span className="text-slate-400">CGPA:</span> <strong className="text-emerald-700">{selectedCandidate.CGPA}</strong> (Backlogs: {selectedCandidate.Backlogs})</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-700" /> Inclusivity & Demographics
                  </h4>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p><span className="text-slate-400">Category:</span> <strong className="text-slate-900">{selectedCandidate.Category}</strong></p>
                    <p><span className="text-slate-400">Region:</span> {selectedCandidate.District}, {selectedCandidate.State} ({selectedCandidate.Area_Type})</p>
                    <p><span className="text-slate-400">PwD Status:</span> {selectedCandidate.Differently_Abled ? 'Yes (Priority Eligible)' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Skills & Projects */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" /> Verified Skills & Projects
                </h4>
                
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">Skill Pool Match:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.Skills_List?.map((s) => {
                      const isMatch = profile?.target_skills?.includes(s.toLowerCase());
                      return (
                        <span 
                          key={s} 
                          className={`px-2.5 py-1 text-xs rounded-lg font-semibold border ${
                            isMatch 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isMatch ? '✓ ' : ''}{s}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Key Practical Projects:</span>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                    {selectedCandidate.Projects || 'No project description declared.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Certifications & Achievements:</span>
                  <p className="text-xs text-slate-700">
                    <strong>Certifications:</strong> {selectedCandidate.Certifications} • <strong>Achievements:</strong> {selectedCandidate.Achievements}
                  </p>
                </div>
              </div>

              {/* Raw Parsed Resume Text */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-600" /> Natural Language Resume Summary
                </h4>
                <p className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed font-mono">
                  {selectedCandidate.Resume_Text}
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-[11px] text-slate-400 font-mono">
                Verification Token: <span className="text-slate-700 font-bold">PMIS-{(selectedCandidate.Applicant_ID || 'A000').toUpperCase()}-2026</span>
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
                  onClick={() => setSelectedCandidate(null)}
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
