/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** @deprecated Prefer VITE_API_BASE_URL */
  readonly VITE_API_BASE_URL_LOCAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
