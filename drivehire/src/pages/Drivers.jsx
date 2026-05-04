import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Search, MapPin, Star, Users, Loader2, Filter, X } from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';

const AVAIL_LABELS = { immediate: 'Immediate', '2weeks': 'In 2 Weeks', '1month': 'In 1 Month' };
const AVAIL_COLORS = { immediate: '#16a34a', '2weeks': '#d97706', '1month': '#64748b' };

export default function Drivers() {
  const { user } = useStore();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minExp, setMinExp] = useState('');
  const [availability, setAvailability] = useState('');
  const [kycOnly, setKycOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  if (!user || user.role !== 'employer') return <Navigate to="/dashboard" />;

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (minExp) params.minExp = minExp;
      if (availability) params.availability = availability;
      if (kycOnly) params.kycOnly = 'true';
      const data = await api.searchDrivers(params);
      setDrivers(data);
    } catch { setDrivers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDrivers();
  };

  const clearFilters = () => {
    setSearch(''); setLocation(''); setMinExp(''); setAvailability(''); setKycOnly(false);
  };

  const activeFilters = [location, minExp, availability, kycOnly].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={22} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, color: '#0f172a' }}>Search Drivers</h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Find verified bus drivers across India</p>
          </div>
        </div>

        {/* Search + filter bar */}
        <form onSubmit={handleSearch} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '16px 20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or license number..."
                style={{ width: '100%', padding: '10px 14px 10px 38px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button type="button" onClick={() => setShowFilters(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: showFilters ? '#eff6ff' : '#f8fafc', border: `1.5px solid ${showFilters ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: showFilters ? '#2563eb' : '#475569', position: 'relative' }}>
              <Filter size={15} /> Filters
              {activeFilters > 0 && <span style={{ width: '18px', height: '18px', background: '#0ea5e9', color: '#fff', borderRadius: '50%', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFilters}</span>}
            </button>
            <button type="submit" style={{ padding: '10px 20px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Search
            </button>
          </div>

          {showFilters && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City or State" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Min Experience (yrs)</label>
                <input type="number" min="0" value={minExp} onChange={e => setMinExp(e.target.value)} placeholder="0" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Availability</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#111827', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
                  <option value="">Any</option>
                  <option value="immediate">Immediate</option>
                  <option value="2weeks">In 2 Weeks</option>
                  <option value="1month">In 1 Month</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                  <input type="checkbox" checked={kycOnly} onChange={e => setKycOnly(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: '#0ea5e9' }} />
                  KYC Verified Only
                </label>
                {activeFilters > 0 && (
                  <button type="button" onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#94a3b8', padding: 0 }}>
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#94a3b8', gap: '12px', alignItems: 'center' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : drivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '20px', border: '1.5px solid #e2e8f0' }}>
            <p style={{ fontSize: '52px', marginBottom: '16px' }}>🔍</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>No drivers found</p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', fontWeight: 600 }}>{drivers.length} driver{drivers.length !== 1 ? 's' : ''} found</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {drivers.map(driver => {
                const avail = driver.profile?.availability || 'immediate';
                const exp = driver.profile?.experience ?? 0;
                const location = driver.profile?.location || '';
                const langs = (driver.profile?.languages || []).join(', ');
                const isVerified = driver.profile?.kycStatus === 'verified';
                return (
                  <div key={driver._id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '52px', height: '52px', background: '#f0f9ff', border: '2px solid #e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {driver.avatar
                          ? <img src={driver.avatar} alt={driver.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '22px', fontWeight: 700, color: '#0284c7' }}>{driver.name[0].toUpperCase()}</span>}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{driver.name}</p>
                          {isVerified && <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '999px', padding: '2px 8px' }}>✅ Verified</span>}
                        </div>
                        {location && (
                          <p style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            <MapPin size={11} /> {location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '999px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        {exp} yr{exp !== 1 ? 's' : ''} exp
                      </span>
                      <span style={{ padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: AVAIL_COLORS[avail] }}>
                        {AVAIL_LABELS[avail] || avail}
                      </span>
                    </div>

                    {/* Bio */}
                    {driver.profile?.bio && (
                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {driver.profile.bio}
                      </p>
                    )}

                    {/* Languages */}
                    {langs && (
                      <p style={{ fontSize: '12px', color: '#64748b' }}>
                        <span style={{ fontWeight: 600, color: '#374151' }}>Languages: </span>{langs}
                      </p>
                    )}

                    {/* Contact */}
                    {driver.phone && (
                      <a href={`tel:${driver.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '10px', color: '#0284c7', fontWeight: 700, fontSize: '13px', textDecoration: 'none', marginTop: 'auto' }}>
                        📞 {driver.phone}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
