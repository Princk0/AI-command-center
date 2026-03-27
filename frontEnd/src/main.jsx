import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'monospace',
          color: '#f87171',
          backgroundColor: '#0f172a',
          minHeight: '100vh',
        }}>
          <h1 style={{ fontSize: '20px', marginBottom: '16px' }}>
            Something went wrong
          </h1>
          <pre style={{
            padding: '16px',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px',
            lineHeight: '1.6',
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <p style={{ color: '#94a3b8', marginTop: '16px', fontSize: '14px' }}>
            Check the browser console (F12) for more details.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
