export {};

declare global {
  interface Window {
    api: {
      getSecrets: () => Promise<any>;
      saveSecrets: (secrets: any) => Promise<void>;
      supabaseSync: () => Promise<{ success: boolean; message: string }>;
      cloudflareSync: () => Promise<{ success: boolean; message: string }>;
    };
  }
}