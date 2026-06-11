const codespaceName = import.meta.env.VITE_CODESPACE_NAME || '';
export const API_BASE = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000';
