import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('React Error Boundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-card">
            <div className="error-icon" aria-hidden>⚠️</div>
            <h2>Algo salió mal</h2>
            <p className="error-message">
              {this.props.message || 'Ha ocurrido un error inesperado. Por favor, intenta recargar la página.'}
            </p>
            <div className="error-actions">
              <button className="btn primary" onClick={() => window.location.reload()}>
                Recargar página
              </button>
              <button className="btn" onClick={this.handleReset}>
                Intentar de nuevo
              </button>
            </div>
            {this.state.error?.message && (
              <details className="error-details">
                <summary>Detalles técnicos</summary>
                <pre>{this.state.error.message}</pre>
                {this.state.errorInfo?.componentStack && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}