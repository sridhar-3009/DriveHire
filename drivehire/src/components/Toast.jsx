import { create } from 'zustand';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

// Store
export const useToast = create((set, get) => ({
  toasts: [],
  show: (message, type = 'info') => {
    const id = Date.now();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().remove(id), 3500);
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

const ICONS = {
  success: <CheckCircle size={16} />,
  error:   <XCircle size={16} />,
  info:    <Info size={16} />,
};

const COLORS = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  error:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  info:    { bg: '#f0f9ff', border: '#bae6fd', text: '#0284c7' },
};

export default function Toaster() {
  const { toasts, remove } = useToast();
  if (!toasts.length) return null;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
      {toasts.map(t => {
        const c = COLORS[t.type] || COLORS.info;
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', background: c.bg, border: `1.5px solid ${c.border}`,
            borderRadius: '12px', color: c.text, fontSize: '14px', fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)', maxWidth: '320px',
            animation: 'slideIn 0.2s ease', pointerEvents: 'all',
          }}>
            {ICONS[t.type]}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, padding: '0', display: 'flex', opacity: 0.6 }}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
