const BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('drivehire_token');

async function req(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register:      (body) => req('/auth/register', { method: 'POST', body }),
  login:         (body) => req('/auth/login',    { method: 'POST', body }),
  me:            ()     => req('/auth/me'),
  updateProfile: (body) => req('/auth/profile',  { method: 'PATCH', body }),

  // Jobs
  getJobs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req(`/jobs${qs ? `?${qs}` : ''}`);
  },
  getJob:          (id)   => req(`/jobs/${id}`),
  postJob:         (body) => req('/jobs', { method: 'POST', body }),
  employerJobs:    ()     => req('/jobs/employer/mine'),
  updateJobStatus: (id, status) => req(`/jobs/${id}/status`, { method: 'PATCH', body: { status } }),

  // Applications
  apply:         (jobId)       => req('/applications', { method: 'POST', body: { jobId } }),
  myApps:        ()            => req('/applications/mine'),
  jobApplicants: (jobId)       => req(`/applications/job/${jobId}`),
  updateApp:     (id, status)  => req(`/applications/${id}`, { method: 'PATCH', body: { status } }),
};
