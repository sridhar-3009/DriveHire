import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toaster from './components/Toast';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Wishlist from './pages/Wishlist';
import Applications from './pages/Applications';
import PostJob from './pages/PostJob';
import ManageJobs from './pages/ManageJobs';
import Applicants from './pages/Applicants';
import Profile from './pages/Profile';
import About from './pages/About';
import KYC from './pages/KYC';
import Admin from './pages/Admin';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Drivers from './pages/Drivers';
import useStore from './store/useStore';

export default function App() {
  const { initAuth } = useStore();

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Toaster />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/manage-jobs" element={<ManageJobs />} />
            <Route path="/applicants/:jobId" element={<Applicants />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/kyc" element={<KYC />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={
              <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
                <div>
                  <p style={{ fontSize: '56px', marginBottom: '16px' }}>🚧</p>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>Page Not Found</h2>
                  <Link to="/" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>← Go home</Link>
                </div>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
