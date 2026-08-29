import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8005/api',
});

export const fetchCandidates = (params) => api.get('/candidates', { params }).then(res => res.data);
export const fetchCandidateById = (id) => api.get(`/candidates/${id}`).then(res => res.data);
export const fetchInternships = (params) => api.get('/internships', { params }).then(res => res.data);
export const fetchInternshipById = (id) => api.get(`/internships/${id}`).then(res => res.data);
export const runAllocation = () => api.post('/allocate').then(res => res.data);
export const fetchResults = (params) => api.get('/results', { params }).then(res => res.data);
export const fetchResultByCandidateId = (id) => api.get(`/results/${id}`).then(res => res.data);
export const fetchStats = () => api.get('/stats').then(res => res.data);
export const checkHealth = () => api.get('/health').then(res => res.data);

// AVOLVE Technologies (Company X) APIs
export const fetchCompanyXProfile = () => api.get('/company-x/profile').then(res => res.data);
export const fetchCompanyXApplicants = (params) => api.get('/company-x/applicants', { params }).then(res => res.data);
export const runCompanyXAllocation = () => api.post('/company-x/allocate').then(res => res.data);
export const fetchCompanyXResults = () => api.get('/company-x/results').then(res => res.data);

export default api;
