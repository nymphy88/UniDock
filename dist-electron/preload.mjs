"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  getSecrets: () => electron.ipcRenderer.invoke("get-secrets"),
  saveSecrets: (secrets) => electron.ipcRenderer.invoke("save-secrets", secrets),
  supabaseSync: () => electron.ipcRenderer.invoke("supabase-sync"),
  cloudflareSync: () => electron.ipcRenderer.invoke("cloudflare-sync")
});
