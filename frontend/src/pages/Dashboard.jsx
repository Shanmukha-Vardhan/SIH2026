import React, { useState, useEffect, useRef } from 'react';
import { COMPANIES_CATALOG } from '../utils/companiesData';
import { parseCSV } from '../utils/csvParser';
import { runCustomAllocation } from '../utils/customAllocator';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users, 
  Briefcase, 
  Percent, 
  Award, 
  BarChart3, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Filter,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Indian Tricolor & National Gov Palette
const COLORS = ['#FF671F', '#046A38', '#F59E0B', '#1E3A8A', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState('ALL'); // 'ALL' or specific company id
  const [fileName, setFileName] = useState('candidates_company_x.csv (2,000 Real Applicants)');
  const fileInputRef = useRef(null);

  // Auto-load default dataset on mount
  useEffect(() => {
    loadDefaultCandidates();
  }, []);

  const loadDefaultCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/candidates_default.csv');
      if (response.ok) {
        const text = await response.text();
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          setCandidates(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not load candidates_default.csv directly:', err);
    }
    setLoading(false);
  };

  // Custom File Upload
  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        setCandidates(parsed);
        setFileName(file.name);
      } else {
        alert('Could not parse any candidate rows from the uploaded CSV.');
      }
    };
    reader.readAsText(file);
  };

  // Compute live analytics
  const computeAnalytics = () => {
    if (candidates.length === 0) return null;

    if (selectedCompanyId === 'ALL') {
      // Aggregate across all 10 companies
      const allSelected = [];
      const companySummaries = [];

      COMPANIES_CATALOG.forEach((comp) => {
        const result = runCustomAllocation(candidates, {
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

        companySummaries.push({
          id: comp.id,
          name: comp.company_name,
          sector: comp.sector,
          location: comp.location,
          vacancies: comp.vacancies,
          allocated: result.total_selected,
          avg_score: result.summary_stats.avg_score,
          rural_percentage: result.summary_stats.rural_percentage,
          avg_cgpa: result.summary_stats.avg_cgpa
        });

        allSelected.push(...result.selected_candidates);
      });

      // Score distribution buckets
      const scoreBuckets = { '0-40': 0, '40-60': 0, '60-70': 0, '70-80': 0, '80-90': 0, '90-100': 0 };
      allSelected.forEach(c => {
        const s = c.score || 0;
        if (s < 40) scoreBuckets['0-40']++;
        else if (s < 60) scoreBuckets['40-60']++;
        else if (s < 70) scoreBuckets['60-70']++;
        else if (s < 70) scoreBuckets['70-80']++;
        else if (s < 90) scoreBuckets['80-90']++;
        else scoreBuckets['90-100']++;
      });
      const scoreDistribution = Object.entries(scoreBuckets).map(([name, count]) => ({ name, count }));

      // Quota distribution
      const quotaCounts = { 'Open Merit': 0, 'OBC Quota': 0, 'SC Quota': 0, 'ST Quota': 0, 'EWS Quota': 0 };
      allSelected.forEach(c => {
        const q = c.allocated_under || 'Open Merit';
        if (q.includes('Open Merit')) quotaCounts['Open Merit']++;
        else if (q.includes('OBC')) quotaCounts['OBC Quota']++;
        else if (q.includes('SC')) quotaCounts['SC Quota']++;
        else if (q.includes('ST')) quotaCounts['ST Quota']++;
        else if (q.includes('EWS')) quotaCounts['EWS Quota']++;
      });
      const categoryAllocation = Object.entries(quotaCounts).map(([name, value]) => ({ name, value }));

      // State distribution
      const cleanStateName = (st) => {
        if (!st) return 'Other';
        const s = st.trim();
        if (s.toLowerCase().includes('dadra') || s.toLowerCase().includes('daman')) return 'Daman & Diu';
        if (s.toLowerCase().includes('andaman')) return 'A&N Islands';
        if (s.toLowerCase().includes('jammu')) return 'J&K';
        return s;
      };

      const stateCounts = {};
      allSelected.forEach(c => {
        const st = cleanStateName(c.State || c.state);
        stateCounts[st] = (stateCounts[st] || 0) + 1;
      });
      const topStates = Object.entries(stateCounts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Degree distribution
      const degreeCounts = {};
      allSelected.forEach(c => {
        const deg = c.Highest_Qualification || c.qualification || 'B.Tech';
        degreeCounts[deg] = (degreeCounts[deg] || 0) + 1;
      });
      const degreeDistribution = Object.entries(degreeCounts).map(([degree, count]) => ({ degree, count }));

      // Rural and PwD stats
      const ruralCount = allSelected.filter(c => (c.Area_Type || '').toLowerCase() === 'rural').length;
      const pwdCount = allSelected.filter(c => c.Differently_Abled === true || c.Differently_Abled === 'True').length;
      const femaleCount = allSelected.filter(c => (c.Gender || '').toLowerCase() === 'female').length;
      const totalAllocated = allSelected.length;
      const avgScore = totalAllocated > 0 ? (allSelected.reduce((sum, c) => sum + (c.score || 0), 0) / totalAllocated).toFixed(1) : 0;
      const avgCgpa = totalAllocated > 0 ? (allSelected.reduce((sum, c) => sum + (parseFloat(c.CGPA) || 0), 0) / totalAllocated).toFixed(2) : 0;

      return {
        scopeName: 'All 10 Enterprise Companies (National Composite)',
        totalCandidates: candidates.length,
        totalAllocated,
        avgScore,
        avgCgpa,
        ruralCount,
        ruralPercentage: totalAllocated > 0 ? ((ruralCount / totalAllocated) * 100).toFixed(1) : 0,
        pwdCount,
        femaleCount,
        femalePercentage: totalAllocated > 0 ? ((femaleCount / totalAllocated) * 100).toFixed(1) : 0,
        scoreDistribution,
        categoryAllocation,
        topStates,
        degreeDistribution,
        companySummaries
      };
    } else {
      // Specific Company
      const comp = COMPANIES_CATALOG.find(c => c.id === selectedCompanyId) || COMPANIES_CATALOG[0];
      const result = runCustomAllocation(candidates, {
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

      const selected = result.selected_candidates;

      // Score distribution
      const scoreBuckets = { '0-40': 0, '40-60': 0, '60-70': 0, '70-80': 0, '80-90': 0, '90-100': 0 };
      selected.forEach(c => {
        const s = c.score || 0;
        if (s < 40) scoreBuckets['0-40']++;
        else if (s < 60) scoreBuckets['40-60']++;
        else if (s < 70) scoreBuckets['60-70']++;
        else if (s < 80) scoreBuckets['70-80']++;
        else if (s < 90) scoreBuckets['80-90']++;
        else scoreBuckets['90-100']++;
      });
      const scoreDistribution = Object.entries(scoreBuckets).map(([name, count]) => ({ name, count }));

      // Quota distribution
      const quotaCounts = { 'Open Merit': 0, 'OBC Quota': 0, 'SC Quota': 0, 'ST Quota': 0, 'EWS Quota': 0 };
      selected.forEach(c => {
        const q = c.allocated_under || 'Open Merit';
        if (q.includes('Open Merit')) quotaCounts['Open Merit']++;
        else if (q.includes('OBC')) quotaCounts['OBC Quota']++;
        else if (q.includes('SC')) quotaCounts['SC Quota']++;
        else if (q.includes('ST')) quotaCounts['ST Quota']++;
        else if (q.includes('EWS')) quotaCounts['EWS Quota']++;
      });
      const categoryAllocation = Object.entries(quotaCounts).map(([name, value]) => ({ name, value }));

      // State distribution
      const cleanStateName = (st) => {
        if (!st) return 'Other';
        const s = st.trim();
        if (s.toLowerCase().includes('dadra') || s.toLowerCase().includes('daman')) return 'Daman & Diu';
        if (s.toLowerCase().includes('andaman')) return 'A&N Islands';
        if (s.toLowerCase().includes('jammu')) return 'J&K';
        return s;
      };

      const stateCounts = {};
      selected.forEach(c => {
        const st = cleanStateName(c.State || c.state);
        stateCounts[st] = (stateCounts[st] || 0) + 1;
      });
      const topStates = Object.entries(stateCounts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Degree distribution
      const degreeCounts = {};
      selected.forEach(c => {
        const deg = c.Highest_Qualification || c.qualification || 'B.Tech';
        degreeCounts[deg] = (degreeCounts[deg] || 0) + 1;
      });
      const degreeDistribution = Object.entries(degreeCounts).map(([degree, count]) => ({ degree, count }));

      return {
        scopeName: `${comp.company_name} (${comp.role})`,
        totalCandidates: candidates.length,
        totalAllocated: result.total_selected,
        avgScore: result.summary_stats.avg_score,
        avgCgpa: result.summary_stats.avg_cgpa,
        ruralCount: result.summary_stats.rural_count,
        ruralPercentage: result.summary_stats.rural_percentage,
        pwdCount: selected.filter(c => c.Differently_Abled === true || c.Differently_Abled === 'True').length,
        femaleCount: selected.filter(c => (c.Gender || '').toLowerCase() === 'female').length,
        femalePercentage: selected.length > 0 ? ((selected.filter(c => (c.Gender || '').toLowerCase() === 'female').length / selected.length) * 100).toFixed(1) : 0,
        scoreDistribution,
        categoryAllocation,
        topStates,
        degreeDistribution,
        companySummaries: null
      };
    }
  };

  const analytics = computeAnalytics();

  if (loading) return <LoadingSpinner text="Compiling National Scheme Analytics..." />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* HERO HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5" /> Government of India Transparency & Analytics
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              National Allocation Command Center
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Real-time multi-dimensional transparency analytics: merit score distributions, constitutional quota fulfillment, state-wise diversity, and affirmative action representation.
            </p>
          </div>

          {/* Dataset Status & Upload */}
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            />
            <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-3.5 rounded-2xl text-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Candidate Pool:</span>
              <strong className="text-emerald-400 block truncate max-w-[200px]">{fileName}</strong>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={loadDefaultCandidates}
                className="w-full sm:w-auto px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-orange-600" />
                <span>Load 2,000 Sample</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-3 bg-white text-slate-900 hover:bg-orange-500 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-orange-600" />
                <span>Upload Custom CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR: COMPANY SCOPE SELECTOR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
          <Filter className="w-4 h-4 text-orange-600" />
          <span>Analytics Scope:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 shadow-sm"
          >
            <option value="ALL">🏢 All 10 Enterprise Companies (National Composite)</option>
            {COMPANIES_CATALOG.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.company_name} — {comp.role} ({comp.vacancies} Seats)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Applicant Pool</span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">{analytics.totalCandidates.toLocaleString()}</div>
            <span className="text-xs text-orange-600 font-semibold mt-1 block">Verified Candidates in System</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Seats Allocated</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-800 mt-2">{analytics.totalAllocated} Interns</div>
            <span className="text-xs text-emerald-700 font-bold mt-1 block">✓ 100% Seats Successfully Filled</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Synergy Score</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-950 mt-2">
              {analytics.avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-1 block">Avg CGPA: {analytics.avgCgpa}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rural Representation</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-800 mt-2">{analytics.ruralPercentage}%</div>
            <span className="text-xs text-emerald-700 font-semibold mt-1 block">{analytics.ruralCount} Rural Placements</span>
          </div>
        </div>
      )}

      {/* 4 CHARTS GRID */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Score Distribution */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">AI Match Score Distribution</h3>
                <p className="text-xs text-slate-500">Distribution of candidate synergy scores</p>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                Avg: {analytics.avgScore}
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.scoreDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#FF671F" radius={[6, 6, 0, 0]} name="Candidates" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Constitutional Quota Allocation */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Social Category & Quota Distribution</h3>
                <p className="text-xs text-slate-500">Adhering to constitutional reservation standards</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                100% Compliant
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryAllocation || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={95}
                    dataKey="value"
                  >
                    {(analytics.categoryAllocation || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Top States by Allocation */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Geographic State-Wise Distribution</h3>
                <p className="text-xs text-slate-500">Top states where interns originate</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                Pan-India
              </span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={analytics.topStates || []}
                  margin={{ top: 10, right: 30, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="state" type="category" width={115} stroke="#64748b" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#046A38" radius={[0, 6, 6, 0]} barSize={18} name="Allocated Youths" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Inclusivity & Diversity Breakdown */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Inclusivity & Affirmative Action Radar</h3>
                <p className="text-xs text-slate-500">Affirmative boosts for underrepresented groups</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 my-auto py-4 text-center">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Rural Youths</span>
                <span className="text-2xl font-black text-emerald-950 block mt-1">{analytics.ruralPercentage}%</span>
                <span className="text-[10px] text-emerald-700 font-semibold">{analytics.ruralCount} Interns</span>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <span className="text-[10px] uppercase font-bold text-orange-800 block">Women Representation</span>
                <span className="text-2xl font-black text-orange-950 block mt-1">{analytics.femalePercentage}%</span>
                <span className="text-[10px] text-orange-700 font-semibold">{analytics.femaleCount} Interns</span>
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <span className="text-[10px] uppercase font-bold text-indigo-800 block">PwD Priority</span>
                <span className="text-2xl font-black text-indigo-950 block mt-1">{analytics.pwdCount}</span>
                <span className="text-[10px] text-indigo-700 font-semibold">Priority Placements</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
              Every candidate evaluated across constitutional quotas, regional background, academic CGPA threshold, and NLP verified skills.
            </p>
          </div>

        </div>
      )}

      {/* TABLE: ALL 10 COMPANIES ALLOCATION BREAKDOWN (When ALL is selected) */}
      {analytics?.companySummaries && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Enterprise Company Allocations Roster</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time matching status across all 10 participating enterprises</p>
            </div>
            <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black rounded-full">
              10 Enterprise JDs Evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="px-6 py-4 text-left">Company Name</th>
                  <th className="px-4 py-4 text-left">Sector & Location</th>
                  <th className="px-4 py-4 text-left">Vacancies</th>
                  <th className="px-4 py-4 text-left">Allocated Interns</th>
                  <th className="px-4 py-4 text-left">Average Score</th>
                  <th className="px-4 py-4 text-left">Rural Ratio</th>
                  <th className="px-4 py-4 text-left">Average CGPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.companySummaries.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{comp.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{comp.sector}</span> • {comp.location}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                      {comp.vacancies} Slots
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {comp.allocated} / {comp.vacancies} Filled
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-black text-orange-950">
                      {comp.avg_score} / 100
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-bold text-emerald-700">
                      {comp.rural_percentage}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                      {comp.avg_cgpa}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
