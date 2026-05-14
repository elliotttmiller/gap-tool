import * as React from "react"

interface State {
  error: Error | null
}

/**
 * Error boundary that catches runtime errors inside module calculation/rendering
 * and shows a recoverable fallback rather than a full white-screen crash.
 * Wrap the <Outlet /> in ScenarioDetail (and optionally individual module pages).
 */
export class ModuleErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-8 text-center">
          <p className="text-lg font-semibold text-red-100">Calculation error</p>
          <p className="mt-2 text-sm text-red-300/70">{this.state.error.message}</p>
          <button
            className="mt-4 rounded-md px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
