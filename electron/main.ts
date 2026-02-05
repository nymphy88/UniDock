import { app, BrowserWindow, screen, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const store = new Store();

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = 1200;
  const winHeight = 800;

  const win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
//    x: width - winWidth - 20,
//    y: height - winHeight - 20,
    frame: true,
    transparent: false,
    alwaysOnTop: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.handle('get-secrets', () => store.get('secrets', {}));
ipcMain.handle('save-secrets', (_, secrets) => {
  store.set('secrets', secrets);
  return { success: true };
});

ipcMain.handle('supabase-sync', async () => {
  const secrets = store.get('secrets', {}) as any;
  if (!secrets.supabaseUrl || !secrets.supabaseKey) return { success: false, message: 'Missing URL/Key' };
  try {
    const supabase = createClient(secrets.supabaseUrl, secrets.supabaseKey);
    const { data, error } = await supabase.from('test').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return { success: true, message: 'Connected to Supabase' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Supabase Error' };
  }
});

ipcMain.handle('cloudflare-sync', async () => {
  const secrets = store.get('secrets', {}) as any;
  if (!secrets.cfAccountId || !secrets.cfApiToken || !secrets.cfKvNamespace) return { success: false, message: 'Missing CF Credentials' };
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${secrets.cfAccountId}/storage/kv/namespaces/${secrets.cfKvNamespace}/keys`, {
      headers: { 'Authorization': `Bearer ${secrets.cfApiToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.[0]?.message || 'CF API Error');
    return { success: true, message: `CF OK: ${data.result?.length || 0} keys` };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
