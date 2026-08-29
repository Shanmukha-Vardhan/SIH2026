import React, { useState, useEffect } from 'react';
import { runAllocation, fetchResults } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export default function Allocate() {
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingResults, setLoadingResults] = useState(false);
  
  const navigate = useNavigate();

  const handleRun = async () => {
    setRunning(true);
    setSummary(null);
    try {
      const data = await runAllocation();
      setSummary(data);
      loadResults(1);
    } catch (error) {
      console.error('Allocation failed', error);
      alert('Failed to run allocation. Make sure backend is running.');
    } finally {
      setRunning(false);
    }
  };

  const loadResults = async (p = page) => {
    setLoadingResults(true);
    try {
      const data = await fetchResults({ page: p, limit: 20 });
      setResults(data.data || []);
      setPage(p);
    } catch (error) {
      console.error('Failed to fetch results', error);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    if (summary) {
      loadResults();
    }
  }, []);

  const getScoreColor = (score) => {
    if (score > 70) return 'text-green-600 font-bold';
    if (score >= 40) return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Run AI Allocation</h2>
        <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
          This process will match all unallocated candidates with available internships using our multi-factor AI scoring algorithm, considering skills, location, and affirmative action constraints.
        </p>
        <button
          onClick={handleRun}
          disabled={running}
          className="px-8 py-4 bg-blue-700 text-white rounded-md font-bold text-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {running ? 'Running Allocation...' : 'Start Allocation Engine'}
        </button>
      </div>

      {running && <LoadingSpinner text="Running complex matching algorithms... This may take a moment." />}

      {summary && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex justify-around text-center">
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Matched</p>
            <p className="text-3xl font-bold text-blue-900">{summary.total_matched || 0}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">Unmatched</p>
            <p className="text-3xl font-bold text-blue-900">{summary.total_unmatched || 0}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">Average Score</p>
            <p className="text-3xl font-bold text-blue-900">{summary.avg_score ? summary.avg_score.toFixed(2) : 0}</p>
          </div>
        </div>
      )}

      {(results.length > 0 || loadingResults) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Allocation Results</h3>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-700 hover:text-blue-900 font-medium text-sm"
            >
              View Full Analytics &rarr;
            </button>
          </div>
          
          {loadingResults ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((r, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.candidate_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.candidate_category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.company_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.internship_sector}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getScoreColor(r.score)}`}>
                        {r.score ? r.score.toFixed(1) : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <button 
                  disabled={page === 1} 
                  onClick={() => loadResults(page - 1)}
                  className="px-4 py-2 border rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page}</span>
                <button 
                  onClick={() => loadResults(page + 1)}
                  className="px-4 py-2 border rounded text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
