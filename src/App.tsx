import { useState, useEffect } from 'react';
import './index.css';

type ViewType = 'dock' | 'settings';
type StatusType = 'info' | 'success' | 'error';

interface Secrets {
  supabaseUrl: string;
  supabaseKey: string;
  cfAccountId: string;
  cfApiToken: string;
  cfKvNamespace: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

// Type guard for window.api
declare global {
  interface Window {
    api: {
      getSecrets: () => Promise<Secrets>;
      saveSecrets: (secrets: Secrets) => Promise<{ success: boolean }>;
      supabaseSync: () => Promise<ApiResponse>;
      cloudflareSync: () => Promise<ApiResponse>;
    };
  }
}

function App() {
  const [view, setView] = useState<ViewType>('dock');
  const [secrets, setSecrets] = useState<Secrets>({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    cfAccountId: '',
    cfApiToken: '',
    cfKvNamespace: '',
  });
  const [status, setStatus] = useState<{ text: string; type: StatusType }>({
    text: 'Ready',
    type: 'info',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.api.getSecrets().then((s) => setSecrets((prev) => ({ ...prev, ...s })));
  }, []);

  const runSync = async (type: 'supabase' | 'cloudflare') => {
    setLoading(true);
    setStatus({ text: `Syncing ${type}...`, type: 'info' });
    const res =
      type === 'supabase'
        ? await window.api.supabaseSync()
        : await window.api.cloudflareSync();
    setStatus({ text: res.message, type: res.success ? 'success' : 'error' });
    setLoading(false);
    setTimeout(() => setStatus({ text: 'Ready', type: 'info' }), 4000);
  };

  if (view === 'settings') {
    return (
      <div className="dock settings-view">
        <div className="input-group">
          <input
            type="text"
            placeholder="Supabase URL"
            value={secrets.supabaseUrl}
            onChange={(e) =>
              setSecrets({ ...secrets, supabaseUrl: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Supabase Key"
            value={secrets.supabaseKey}
            onChange={(e) =>
              setSecrets({ ...secrets, supabaseKey: e.target.value })
            }
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            placeholder="CF Account ID"
            value={secrets.cfAccountId}
            onChange={(e) =>
              setSecrets({ ...secrets, cfAccountId: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="CF API Token"
            value={secrets.cfApiToken}
            onChange={(e) =>
              setSecrets({ ...secrets, cfApiToken: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="CF KV Namespace"
            value={secrets.cfKvNamespace}
            onChange={(e) =>
              setSecrets({ ...secrets, cfKvNamespace: e.target.value })
            }
          />
        </div>
        <div className="actions">
          <button
            onClick={async () => {
              await window.api.saveSecrets(secrets);
              setView('dock');
            }}
          >
            Save
          </button>
          <button onClick={() => setView('dock')} className="secondary">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dock">
      <div className="logo">G-DOCK</div>
      <div className="buttons">
        <button
          onClick={() => runSync('supabase')}
          disabled={loading}
          className={loading ? 'loading' : ''}
        >
          Supabase
        </button>
        <button
          onClick={() => runSync('cloudflare')}
          disabled={loading}
          className={loading ? 'loading' : ''}
        >
          Cloudflare
        </button>
        <button onClick={() => setView('settings')} className="icon-btn">
          ⚙️
        </button>
      </div>
      <div className={`status-bar ${status.type}`}>{status.text}</div>
    </div>
  );
}

export default App;
