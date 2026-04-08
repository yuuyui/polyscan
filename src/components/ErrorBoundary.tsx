import { Component } from "react"
import type { ReactNode, ErrorInfo } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen bg-bg-base flex items-center justify-center">
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-4xl text-over-text">error</span>
            <h1 className="font-mono text-sm text-text-primary uppercase tracking-widest">Something went wrong</h1>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-sm bg-primary text-on-primary hover:bg-primary-hover transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="ml-2 px-4 py-2 text-xs font-mono font-bold uppercase rounded-sm border border-border-default text-text-muted hover:text-text-primary transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
