/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CONTRACT_ADDRESS: string | undefined;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }