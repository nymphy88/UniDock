import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('api', {
  getSecrets: () => ipcRenderer.invoke('get-secrets'),
  saveSecrets: (secrets) => ipcRenderer.invoke('save-secrets', secrets),
  supabaseSync: () => ipcRenderer.invoke('supabase-sync'),
  cloudflareSync: () => ipcRenderer.invoke('cloudflare-sync'),
});
