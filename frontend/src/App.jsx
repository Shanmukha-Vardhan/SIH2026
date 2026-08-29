import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Candidates from './pages/Candidates';
import Internships from './pages/Internships';
import Allocate from './pages/Allocate';
import Dashboard from './pages/Dashboard';
import CompanyAllocation from './pages/CompanyAllocation';
import CustomAllocation from './pages/CustomAllocation';
import Companies from './pages/Companies';

import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <div>
          <Navbar />
          <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/custom-allocation" element={<CustomAllocation />} />
              <Route path="/company-x" element={<CompanyAllocation />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/internships" element={<Internships />} />
              <Route path="/allocate" element={<Companies />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
