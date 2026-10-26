// src/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { error: null, info: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding:20 }}>
          <h2 style={{ color:'#b91c1c' }}>Something broke</h2>
          <p><strong>Error:</strong> {String(this.state.error)}</p>
          <details style={{ whiteSpace:'pre-wrap' }}>{this.state.info?.componentStack}</details>
          <div style={{ marginTop:12 }}>
            <button onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
