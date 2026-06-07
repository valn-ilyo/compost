// Vite client type declarations -- ambient types for import.meta.env and asset imports
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
declare module "vuetify/styles" {
  const styles: unknown;
  export default styles;
}
