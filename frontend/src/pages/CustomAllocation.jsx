import React, { useState, useEffect, useRef } from 'react';
import { parseCSV } from '../utils/csvParser';
import { runCustomAllocation } from '../utils/customAllocator';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  Award, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  Plus, 
  X, 
  ChevronRight, 
  Layers, 
  Cpu, 
  Check,
  Briefcase,
  Download,
  Zap
} from 'lucide-react';
import { exportAllocationToCSV } from '../utils/csvExporter';

export default function CustomAllocation() {
  // Configuration State
  const [companyName, setCompanyName] = useState('GovTech Enterprise');
  const [role, setRole] = useState('Full Stack & Data Engineering Intern');
  const [location, setLocation] = useState('Hyderabad');
  const [sector, setSector] = useState('IT / Technology');
  const [vacancies, setVacancies] = useState(20);
  
  const [minCgpa, setMinCgpa] = useState(7.0);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  
  const [skills, setSkills] = useState(['python', 'sql', 'machine-learning', 'javascript', 'problem-solving']);
  const [newSkill, setNewSkill] = useState('');

  const [weights, setWeights] = useState({
    skills: 30,
    semantic: 25,
    academic: 15,
    location: 10,
    inclusivity: 20
  });

  const [quotas, setQuotas] = useState({
    General: 50,
    OBC: 25,
    SC: 15,
    ST: 5,
    EWS: 5
  });

  const [toggles, setToggles] = useState({
    rural_boost: true,
    pwd_priority: true,
    first_time_priority: true
  });

  // Dataset State
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [rawCandidates, setRawCandidates] = useState([]);
  const fileInputRef = useRef(null);

  // Allocation & Animation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [candidateCountTicker, setCandidateCountTicker] = useState(0);

  const [allocationResult, setAllocationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('selected'); // 'selected', 'waitlist'
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // File Upload Handlers
  const handleFileUpload = (file) => {
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
        alert('Could not parse any candidate records. Please check the CSV structure.');
        return;
      }
      setFileName(file.name);
      setRawCandidates(parsed);
      setFileData(text);
      setAllocationResult(null);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const clearDataset = () => {
    setFileData(null);
    setFileName('');
    setRawCandidates([]);
    setAllocationResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadSampleDataset = async () => {
    try {
      const response = await fetch('/candidates_default.csv');
      if (response.ok) {
        const text = await response.text();
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          setFileName('sample_candidates_2000.csv (2,000 Verified Applicants)');
          setRawCandidates(parsed);
          setFileData(text);
          setAllocationResult(null);
        }
      }
    } catch (err) {
      console.error('Error loading sample dataset:', err);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim().toLowerCase())) {
      setSkills([...skills, newSkill.trim().toLowerCase()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // 5-Second Processing Engine
  const startAllocation = () => {
    if (rawCandidates.length === 0) {
      alert('Please upload a candidate CSV dataset first.');
      return;
    }

    setIsProcessing(true);
    setProcessProgress(0);
    setActiveStepIndex(0);
    setCandidateCountTicker(0);

    const totalDuration = 5000; // 5.0 seconds
    const startTime = Date.now();
    const totalCount = rawCandidates.length;

    // Run the computation in the background
    const result = runCustomAllocation(rawCandidates, {
      company_name: companyName,
      role,
      location,
      sector,
      vacancies: parseInt(vacancies, 10) || 20,
      min_cgpa: parseFloat(minCgpa) || 7.0,
      max_backlogs: parseInt(maxBacklogs, 10) || 0,
      target_skills: skills,
      weights,
      quotas,
      toggles
    });

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / totalDuration) * 100);
      setProcessProgress(progress);

      // Ticker
      const currentTick = Math.floor((progress / 100) * totalCount);
      setCandidateCountTicker(currentTick);

      // Step indices (4 steps across 5 seconds)
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
          setAllocationResult(result);
          setActiveTab('selected');
        }, 400);
      }
    }, 50);
  };

  const stepsList = [
    { title: 'Academic Gatekeeping & Backlog Auditing', desc: `Enforcing CGPA >= ${minCgpa} & Backlogs <= ${maxBacklogs}` },
    { title: 'NLP Project Relevance & Semantic Vectorization', desc: `Analyzing technical keywords & experience against ${skills.length} target skills` },
    { title: 'Constitutional Quotas & Inclusivity Optimization', desc: `Balancing Open Merit (${quotas.General}%), OBC (${quotas.OBC}%), SC (${quotas.SC}%), ST (${quotas.ST}%), EWS (${quotas.EWS}%)` },
    { title: 'Seat Assignment & Explainability Matrix', desc: `Allocating top ${vacancies} vacancies and generating transparency scorecards` }
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

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" /> Manual & Custom Parameter Matching Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Custom Allocation Studio</h1>
          <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
            Configure custom enterprise requirements, eligibility thresholds, weight multipliers, and upload any bulk candidate CSV dataset to run deterministic AI matching on the fly.
          </p>
        </div>
      </div>

      {/* 2-COLUMN SETUP: LEFT CONFIG, RIGHT CSV UPLOAD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ELIGIBILITY & CRITERIA FORM (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">1. Define Enterprise Profile & Eligibility</h2>
              <p className="text-xs text-slate-500">Fine-tune the criteria used to evaluate applicants</p>
            </div>
            <span className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
              <Sliders className="w-4 h-4" />
            </span>
          </div>

          {/* Role & Vacancies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Internship Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Location / City</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Vacancies: <span className="text-orange-600 font-extrabold text-sm">{vacancies} Seats</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={vacancies}
                onChange={(e) => setVacancies(e.target.value)}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Hard Academic Gates */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-orange-600" /> Academic Hard Eligibility Gates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Minimum CGPA Threshold: <strong className="text-slate-900">{minCgpa}</strong>
                </label>
                <input
                  type="range"
                  min="5.0"
                  max="9.0"
                  step="0.1"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Max Permissible Backlogs: <strong className="text-slate-900">{maxBacklogs}</strong>
                </label>
                <select
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value={0}>0 Backlogs (Strict Zero)</option>
                  <option value={1}>Max 1 Active Backlog</option>
                  <option value={2}>Max 2 Active Backlogs</option>
                  <option value={5}>Any Backlogs Allowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Target Skills Tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Target Skills Required</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200">
                  {s}
                  <button onClick={() => removeSkill(s)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. react, docker, java)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Weight Multipliers */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-orange-600" /> AI Scoring Weight Distribution (Total ~100%)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Skills ({weights.skills}%)</span>
                <input
                  type="range" min="0" max="60" value={weights.skills}
                  onChange={(e) => setWeights({ ...weights, skills: parseInt(e.target.value, 10) })}
                  className="w-full accent-orange-600 cursor-pointer mt-1"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">NLP Resume ({weights.semantic}%)</span>
                <input
                  type="range" min="0" max="60" value={weights.semantic}
                  onChange={(e) => setWeights({ ...weights, semantic: parseInt(e.target.value, 10) })}
                  className="w-full accent-orange-600 cursor-pointer mt-1"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Academic ({weights.academic}%)</span>
                <input
                  type="range" min="0" max="40" value={weights.academic}
                  onChange={(e) => setWeights({ ...weights, academic: parseInt(e.target.value, 10) })}
                  className="w-full accent-orange-600 cursor-pointer mt-1"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Location ({weights.location}%)</span>
                <input
                  type="range" min="0" max="30" value={weights.location}
                  onChange={(e) => setWeights({ ...weights, location: parseInt(e.target.value, 10) })}
                  className="w-full accent-orange-600 cursor-pointer mt-1"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Inclusivity ({weights.inclusivity}%)</span>
                <input
                  type="range" min="0" max="40" value={weights.inclusivity}
                  onChange={(e) => setWeights({ ...weights, inclusivity: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-600 cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>

          {/* Affirmative Toggles */}
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={toggles.rural_boost}
                onChange={(e) => setToggles({ ...toggles, rural_boost: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              Rural Area Boost (+25 pts)
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={toggles.pwd_priority}
                onChange={(e) => setToggles({ ...toggles, pwd_priority: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              Differently Abled (PwD) Priority
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={toggles.first_time_priority}
                onChange={(e) => setToggles({ ...toggles, first_time_priority: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              First-Time Applicant Priority
            </label>
          </div>

        </div>

        {/* RIGHT COLUMN: CSV UPLOAD & EXECUTION (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex-1 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">2. Upload Candidate Dataset</h2>
                  <p className="text-xs text-slate-500">Provide any CSV file to match</p>
                </div>
                <span className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                  <UploadCloud className="w-4 h-4" />
                </span>
              </div>

              {/* Drag and drop box or Sample button */}
              {!fileName ? (
                <div className="mt-6 space-y-4">
                  <button
                    type="button"
                    onClick={loadSampleDataset}
                    className="w-full py-3 px-4 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span>Load 2,000 Sample Applicants</span>
                  </button>

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50/60 hover:bg-orange-50/30 rounded-2xl p-7 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2.5 group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    />
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 group-hover:text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Or upload custom CSV file</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Supports any candidate dataset</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block truncate max-w-[180px]">{fileName}</span>
                        <span className="text-[11px] text-emerald-600 font-semibold block">
                          ✓ {rawCandidates.length.toLocaleString()} Candidates Loaded
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={clearDataset}
                      title="Clear / Delete Dataset"
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dataset mini metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                    <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                      <span className="text-slate-400 block text-[10px]">Columns Detected:</span>
                      <strong>{Object.keys(rawCandidates[0] || {}).length} Fields</strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                      <span className="text-slate-400 block text-[10px]">Processing Mode:</span>
                      <strong className="text-emerald-700">Client-Side (0 DB Reads)</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Run Allocation Action Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={startAllocation}
                disabled={!fileName || isProcessing}
                className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>Run Custom Allocation ({rawCandidates.length > 0 ? `${rawCandidates.length} Applicants` : 'Upload File First'})</span>
              </button>
              <span className="text-[10px] text-center text-slate-400 block mt-2">
                100% Zero-Cloud Footprint • Zero Firestore Consumption
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* 5-SECOND CINEMATIC PROCESSING SCREEN */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-8 text-white shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            
            {/* Top header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Cpu className="w-7 h-7 text-orange-400 animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight">AI Matching Engine in Progress</h2>
              <p className="text-xs text-slate-400">
                Evaluating candidate dataset across {vacancies} vacancies
              </p>
            </div>

            {/* Real-time Ticker Counter */}
            <div className="bg-slate-800/80 rounded-2xl p-4 text-center border border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applicants Evaluated</span>
              <div className="text-3xl font-black text-white font-mono mt-0.5">
                {candidateCountTicker.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ {rawCandidates.length.toLocaleString()}</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-700 rounded-full h-2.5 mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 h-2.5 rounded-full transition-all duration-75"
                  style={{ width: `${processProgress}%` }}
                ></div>
              </div>
            </div>

            {/* 4-Step Animated Pipeline Checklist */}
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
                      isDone 
                        ? 'bg-emerald-500 text-slate-900 font-black' 
                        : isCurrent 
                          ? 'bg-orange-500 text-white animate-pulse' 
                          : 'bg-slate-800 text-slate-500'
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

      {/* RESULTS DISPLAY BOARD */}
      {allocationResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Allocated Candidates</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{allocationResult.total_selected} Seats</div>
              <span className="text-xs text-emerald-700 font-bold mt-1 block">✓ 100% Quotas Satisfied</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Average AI Score</span>
              <div className="text-3xl font-black text-orange-950 mt-1">{allocationResult.summary_stats.avg_score} <span className="text-xs text-slate-400">/ 100</span></div>
              <span className="text-xs text-slate-500 font-medium mt-1 block">Across all dimensions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Rural Representation</span>
              <div className="text-3xl font-black text-emerald-900 mt-1">{allocationResult.summary_stats.rural_percentage}%</div>
              <span className="text-xs text-emerald-700 font-semibold mt-1 block">{allocationResult.summary_stats.rural_count} Candidates from Rural</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Average CGPA</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{allocationResult.summary_stats.avg_cgpa}</div>
              <span className="text-xs text-slate-500 font-medium mt-1 block">Gatekeeper: &gt;= {minCgpa} CGPA</span>
            </div>
          </div>

          {/* Tab buttons for Selected vs Waitlist */}
          <div className="bg-slate-200/80 p-1.5 rounded-2xl flex gap-2 max-w-md">
            <button
              onClick={() => setActiveTab('selected')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'selected'
                  ? 'bg-white text-slate-900 shadow-md font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Selected Interns ({allocationResult.selected_candidates.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'waitlist'
                  ? 'bg-white text-slate-900 shadow-md font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Waitlisted Pool ({allocationResult.waitlist_candidates.length})</span>
            </button>
          </div>

          {/* TABLE: SELECTED INTERNS */}
          {activeTab === 'selected' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Allocated Interns for {companyName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Matched according to custom weights and quota limits</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportAllocationToCSV(allocationResult.selected_candidates, companyName)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-600" />
                    <span>Export CSV Roster</span>
                  </button>
                  <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black rounded-full">
                    {allocationResult.selected_candidates.length} Allocated
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
                      <th className="px-4 py-4 text-left">Matched Skills</th>
                      <th className="px-4 py-4 text-left">Score</th>
                      <th className="px-4 py-4 text-center">Scorecard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allocationResult.selected_candidates.map((c, idx) => (
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
                            onClick={() => setSelectedCandidate(c)}
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

          {/* TABLE: WAITLISTED POOL */}
          {activeTab === 'waitlist' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50/40">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Top 10 Waitlisted Candidates</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Ranked standby queue for {companyName}</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
                  10 in Queue
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
                    {allocationResult.waitlist_candidates.map((c) => (
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
                            onClick={() => setSelectedCandidate(c)}
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
                <h2 className="text-2xl font-black mt-1 text-white tracking-tight">{selectedCandidate.Name || selectedCandidate.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Applicant ID: {selectedCandidate.Applicant_ID || selectedCandidate.candidate_id} • {selectedCandidate.Gender || selectedCandidate.gender} • Born {selectedCandidate.Date_of_Birth || 'N/A'}
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
                    <p><span className="text-slate-400">Degree:</span> <strong>{selectedCandidate.Highest_Qualification || selectedCandidate.qualification} in {selectedCandidate.Branch_Specialization || 'General'}</strong></p>
                    <p><span className="text-slate-400">Institute:</span> {selectedCandidate.College_University || 'Accredited University'} ({selectedCandidate.Graduation_Year || '2025'})</p>
                    <p><span className="text-slate-400">CGPA:</span> <strong className="text-emerald-700">{selectedCandidate.CGPA || selectedCandidate.cgpa}</strong> (Backlogs: {selectedCandidate.Backlogs || 0})</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-700" /> Inclusivity & Demographics
                  </h4>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p><span className="text-slate-400">Category:</span> <strong className="text-slate-900">{selectedCandidate.Category || selectedCandidate.category}</strong></p>
                    <p><span className="text-slate-400">Region:</span> {selectedCandidate.District || selectedCandidate.district}, {selectedCandidate.State || selectedCandidate.state} ({selectedCandidate.Area_Type || 'Rural'})</p>
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
                    {(selectedCandidate.Skills_List || selectedCandidate.skills || []).map((s) => {
                      const isMatch = skills.includes(s.toLowerCase());
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

                {selectedCandidate.Projects && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Key Practical Projects:</span>
                    <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                      {selectedCandidate.Projects}
                    </p>
                  </div>
                )}

                {selectedCandidate.Certifications && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Certifications & Achievements:</span>
                    <p className="text-xs text-slate-700">
                      <strong>Certifications:</strong> {selectedCandidate.Certifications} • <strong>Achievements:</strong> {selectedCandidate.Achievements || 'N/A'}
                    </p>
                  </div>
                )}
              </div>

              {/* Raw Parsed Resume Text */}
              {selectedCandidate.Resume_Text && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-600" /> Natural Language Resume Summary
                  </h4>
                  <p className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed font-mono">
                    {selectedCandidate.Resume_Text}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-[11px] text-slate-400 font-mono">
                Verification Token: <span className="text-slate-700 font-bold">PMIS-{(selectedCandidate.Applicant_ID || selectedCandidate.candidate_id || 'A000').toUpperCase()}-2026</span>
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
