/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECT_ACCESS_KEY: string;
  readonly VITE_WAAS_CONFIG_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_APPLE_CLIENT_ID: string;
  readonly VITE_CHAINS: string;
  readonly VITE_DEFAULT_CHAIN: string;
  readonly VITE_ITEMS_CONTRACT_ADDRESS: string;
  readonly VITE_ITEMS_CONTRACT2_ADDRESS: string;
  readonly VITE_PACK_CONTRACT_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
