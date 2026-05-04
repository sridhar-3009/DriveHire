import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, MapPin, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { FALLBACK_JOBS, normalizeJob } from '../data/jobs';
import JobCard from '../components/JobCard';

const LOCATIONS = ['All', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Delhi', 'Pune'];
const ROUTE_TYPES = ['All', 'City', 'Interstate', 'School', 'Corporate', 'Local'];
const SALARY_RANGES = [
  { label: 'Any salary', min: 0, max: Infinity },
  { label: 'Under ₹15k', min: 0, max: 15000 },
  { label: '₹15k – ₹25k', min: 15000, max: 25000 },
  { label: '₹25k – ₹35k', min: 25000, max: 35000 },
  { label: '₹35k+', min: 35000, max: Infinity },
];

function parseSalaryMin(s) {
  const m = s.match(/₹([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

const FilterBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '7px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 500,
    border: `1.5px solid ${active ? '#0ea5e9' : '#e2e8f0'}`,
    background: active ? '#0ea5e9' : '#fff', color: active ? '#fff' : '#475569',
    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
  }}>
    {children}
  </button>
);

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All');
  const [routeType, setRouteType] = useState('All');
  const [salaryIdx, setSalaryIdx] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setApiLoading(true);
    api.getJobs()
      .then(data => setJobs(data.map(normalizeJob)))
      .catch(() => setJobs(FALLBACK_JOBS))
      .finally(() => setApiLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const base = jobs.filter(job => {
      const matchSearch = !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase());
      const matchLoc = location === 'All' || job.location.includes(location);
      const matchRoute = routeType === 'All' || job.route === routeType;
      const salMin = parseSalaryMin(job.salary);
      const range = SALARY_RANGES[salaryIdx];
      return matchSearch && matchLoc && matchRoute && salMin >= range.min && salMin <= range.max;
    });
    if (sortBy === 'salary_high') return [...base].sort((a, b) => parseSalaryMin(b.salary) - parseSalaryMin(a.salary));
    if (sortBy === 'salary_low') return [...base].sort((a, b) => parseSalaryMin(a.salary) - parseSalaryMin(b.salary));
    if (sortBy === 'urgent') return [...base].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
    return [...base].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [jobs, search, location, routeType, salaryIdx, sortBy]);

  const activeFilterCount = [location !== 'All', routeType !== 'All', salaryIdx !== 0].filter(Boolean).length;
  const clearAll = () => { setLocation('All'); setRouteType('All'); setSalaryIdx(0); setSearch(''); };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="page-container" style={{ paddingTop: '28px', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '24px' }}>🚌</span>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Bus Driver Jobs
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
            {apiLoading ? 'Loading...' : `${jobs.length} jobs across India`}
          </p>

          {/* Search row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', background: '#fff' }}>
              <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search jobs or companies..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#334155', background: 'transparent', minWidth: 0 }} />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0', display: 'flex' }}><X size={15} /></button>}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', flexShrink: 0,
              border: `1.5px solid ${showFilters || activeFilterCount ? '#0ea5e9' : '#e2e8f0'}`,
              borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              background: showFilters || activeFilterCount ? '#0ea5e9' : '#fff',
              color: showFilters || activeFilterCount ? '#fff' : '#475569', transition: 'all 0.15s',
            }}>
              <SlidersHorizontal size={15} />
              <span>Filters</span>
              {activeFilterCount > 0 && <span style={{ background: 'rgba(255,255,255,0.35)', borderRadius: '999px', padding: '1px 7px', fontSize: '12px' }}>{activeFilterCount}</span>}
            </button>
          </div>

          {/* Active pills */}
          {activeFilterCount > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
              {location !== 'All' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', background: '#f0f9ff', color: '#0284c7', borderRadius: '999px', fontSize: '13px', fontWeight: 500, border: '1px solid #bae6fd' }}>
                  <MapPin size={12} /> {location}
                  <button onClick={() => setLocation('All')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: '0', lineHeight: 1 }}><X size={12} /></button>
                </span>
              )}
              {routeType !== 'All' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', background: '#f0f9ff', color: '#0284c7', borderRadius: '999px', fontSize: '13px', fontWeight: 500, border: '1px solid #bae6fd' }}>
                  🛣 {routeType}
                  <button onClick={() => setRouteType('All')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: '0', lineHeight: 1 }}><X size={12} /></button>
                </span>
              )}
              {salaryIdx !== 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', background: '#f0f9ff', color: '#0284c7', borderRadius: '999px', fontSize: '13px', fontWeight: 500, border: '1px solid #bae6fd' }}>
                  {SALARY_RANGES[salaryIdx].label}
                  <button onClick={() => setSalaryIdx(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: '0', lineHeight: 1 }}><X size={12} /></button>
                </span>
              )}
              <button onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <X size={13} /> Clear all
              </button>
            </div>
          )}

          {/* Filter panel */}
          {showFilters && (
            <div style={{ marginTop: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Location</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {LOCATIONS.map(loc => <FilterBtn key={loc} active={location === loc} onClick={() => setLocation(loc)}>{loc}</FilterBtn>)}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Route Type</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ROUTE_TYPES.map(rt => <FilterBtn key={rt} active={routeType === rt} onClick={() => setRouteType(rt)}>{rt}</FilterBtn>)}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Salary Range</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {SALARY_RANGES.map((r, i) => <FilterBtn key={i} active={salaryIdx === i} onClick={() => setSalaryIdx(i)}>{r.label}</FilterBtn>)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="page-content">
        {apiLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 20px', gap: '12px', color: '#64748b' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading jobs...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ fontSize: '52px', marginBottom: '16px' }}>🔍</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>No jobs found</p>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>Try adjusting your filters</p>
            <button onClick={clearAll} style={{ padding: '10px 24px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>{filtered.length} job{filtered.length !== 1 ? 's' : ''} found</p>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ padding: '7px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 500, color: '#475569', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                <option value="newest">Newest first</option>
                <option value="salary_high">Salary: High → Low</option>
                <option value="salary_low">Salary: Low → High</option>
                <option value="urgent">Urgent first</option>
              </select>
            </div>
            <div className="grid-3">
              {filtered.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
