import React, { ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '1.5rem', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '28rem', width: '100%', backgroundColor: '#ffffff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <div style={{ width: '3rem', height: '3rem', backgroundColor: '#fee2e2', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#dc2626', fontSize: '1.5rem' }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
              Algo no cargó correctamente
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'Se produjo un error inesperado al inicializar la aplicación.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ backgroundColor: '#059669', color: '#ffffff', fontWeight: 600, padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
