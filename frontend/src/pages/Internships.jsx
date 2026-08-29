import React, { useState, useEffect } from 'react';
import { fetchInternships } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search } from 'lucide-react';

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  const loadInternships = async () => {
    setLoading(true);
    try {
      const res = await fetchInternships({ page, limit: 20, search, sector, state: stateFilter });
      setInternships(res.data || []);
    } catch (error) {
      console.error('Failed to fetch internships', error);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, [page, search, sector, stateFilter]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Internships</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <input
            type="text"
            placeholder="Sector..."
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          />
          <input
            type="text"
            placeholder="State..."
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : internships.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No internships found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {internships.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i.company_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i.sector}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i.location}, {i.state}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {i.required_skills && i.required_skills.map(skill => (
                        <span key={skill} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i.qualification_required}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i.capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border rounded text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
