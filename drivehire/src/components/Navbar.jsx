import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Truck, Bell, User, LogOut, CheckCheck, Briefcase, Star } from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';

function NotificationPanel({ onClose }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getNotifications()
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAll = async () => {
    await api.markAllRead();
    setNotes(n => n.map(x => ({ ...x, read: true })));
  };

  const handleClick = async (note) => {
    if (!note.read) {
      await api.markOneRead(note._id);
      setNotes(n => n.map(x => x._id === note._id ? { ...x, read: true } : x));
    }
    if (note.link) { navigate(note.link); onClose(); }
  };

  const unread = notes.filter(n => !n.read).length;

  const TYPE_ICONS = {
    application: '👤',
    status:      '🚌',
    job:         '💼',
  };

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
      width: '340px', background: '#fff', border: '1.5px solid #e2e8f0',
      borderRadius: '18px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
      zIndex: 999, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Notifications</p>
          {unread > 0 && (
            <span style={{ padding: '2px 8px', background: '#0ea5e9', color: '#fff', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAll} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Loading...</div>
        ) : notes.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>No notifications yet</p>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note._id}
              onClick={() => handleClick(note)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '12px 18px', cursor: note.link ? 'pointer' : 'default',
                background: note.read ? '#fff' : '#f0f9ff',
                borderBottom: '1px solid #f8fafc',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (note.link) e.currentTarget.style.background = note.read ? '#f8fafc' : '#e0f2fe'; }}
              onMouseLeave={e => { e.currentTarget.style.background = note.read ? '#fff' : '#f0f9ff'; }}
            >
              <div style={{ width: '36px', height: '36px', background: note.read ? '#f8fafc' : '#e0f2fe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                {TYPE_ICONS[note.type] || '🔔'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: note.read ? '#475569' : '#0f172a', fontWeight: note.read ? 400 : 600, lineHeight: 1.4, marginBottom: '3px' }}>
                  {note.message}
                </p>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {new Date(note.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!note.read && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ea5e9', flexShrink: 0, marginTop: '5px' }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);

  // Fetch unread count
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const fetch = () => api.getNotifications()
      .then(notes => setUnreadCount(notes.filter(n => !n.read).length))
      .catch(() => {});
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  const navLinks = user
    ? user.role === 'driver'
      ? [
          { to: '/dashboard',    label: 'Dashboard' },
          { to: '/jobs',         label: 'Find Jobs' },
          { to: '/applications', label: 'Applications' },
          { to: '/wishlist',     label: 'Saved' },
          { to: '/kyc',          label: 'KYC' },
          { to: '/profile',      label: 'Profile' },
        ]
      : [
          { to: '/dashboard',   label: 'Dashboard' },
          { to: '/post-job',    label: 'Post Job' },
          { to: '/manage-jobs', label: 'My Jobs' },
          { to: '/drivers',     label: 'Search Drivers' },
          { to: '/profile',     label: 'Profile' },
        ]
    : [
        { to: '/jobs',  label: 'Find Jobs' },
        { to: '/about', label: 'About' },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', background: '#0ea5e9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Truck style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Drive<span style={{ color: '#0ea5e9' }}>Hire</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden-mobile">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.15s',
                background: isActive(link.to) ? '#f0f9ff' : 'transparent',
                color: isActive(link.to) ? '#0284c7' : '#475569',
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden-mobile">
            {user ? (
              <>
                {/* Notification bell */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowNotif(v => !v)}
                    style={{ position: 'relative', padding: '8px', background: showNotif ? '#f0f9ff' : 'none', border: showNotif ? '1px solid #bae6fd' : 'none', cursor: 'pointer', borderRadius: '8px', color: '#64748b', display: 'flex' }}
                  >
                    <Bell style={{ width: '20px', height: '20px' }} />
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute', top: '4px', right: '4px',
                        minWidth: '16px', height: '16px', background: '#ef4444',
                        borderRadius: '999px', border: '2px solid #fff',
                        fontSize: '9px', fontWeight: 700, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 3px',
                      }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px', borderLeft: '1px solid #e2e8f0' }}>
                  <div style={{ width: '34px', height: '34px', background: '#f0f9ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e0f2fe' }}>
                    <User style={{ width: '16px', height: '16px', color: '#0284c7' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>{user.name}</p>
                    <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>{user.role}</p>
                  </div>
                  <button onClick={handleLogout} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                    <LogOut style={{ width: '15px', height: '15px' }} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#475569', textDecoration: 'none', borderRadius: '8px' }}>
                  Sign In
                </Link>
                <Link to="/register" style={{ padding: '9px 18px', background: '#0ea5e9', color: '#fff', fontSize: '14px', fontWeight: 600, borderRadius: '9px', textDecoration: 'none', boxShadow: '0 1px 3px rgba(14,165,233,0.3)' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} style={{ display: 'none', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', borderRadius: '8px' }} className="show-mobile">
            {open ? <X style={{ width: '22px', height: '22px' }} /> : <Menu style={{ width: '22px', height: '22px' }} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: '1px solid #f1f5f9', background: '#fff', padding: '12px 24px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} style={{
                padding: '12px 14px', borderRadius: '10px', fontSize: '15px', fontWeight: 500,
                textDecoration: 'none', color: isActive(link.to) ? '#0284c7' : '#334155',
                background: isActive(link.to) ? '#f0f9ff' : 'transparent',
              }}>
                {link.label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '8px', paddingTop: '12px', display: 'flex', gap: '8px' }}>
              {user ? (
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', border: 'none', background: '#fef2f2', color: '#ef4444', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, width: '100%' }}>
                  <LogOut style={{ width: '16px', height: '16px' }} /> Sign Out
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} style={{ flex: 1, padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 500, border: '1px solid #e2e8f0', borderRadius: '10px', color: '#334155', textDecoration: 'none' }}>Sign In</Link>
                  <Link to="/register" onClick={() => setOpen(false)} style={{ flex: 1, padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600, background: '#0ea5e9', color: '#fff', borderRadius: '10px', textDecoration: 'none' }}>Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .hidden-mobile { display: flex !important; } .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
      `}</style>
    </nav>
  );
}
