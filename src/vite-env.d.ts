/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_SOCKET_SERVER_URL: string;
    [key: string]: string;
  };
}
