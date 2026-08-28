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
        <div className="mx-auto mt-4 max-w-4xl rounded-2xl border border-[#f15a29]/45 bg-white p-8 text-center shadow-lg dark:bg-[#32373f]">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f15a29]/12 text-xl font-bold text-[#c13f17] dark:bg-[#f15a29]/20 dark:text-[#ff9a78]" aria-hidden="true">!</div>
          <p className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">We couldn’t calculate this view</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-200">The calculator encountered an unexpected problem. Your client information has not been changed.</p>
          <div className="mx-auto mt-4 max-w-2xl rounded-lg border border-[#f15a29]/25 bg-[#f15a29]/8 px-4 py-3 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c13f17] dark:text-[#ff9a78]">Error details</p>
            <p className="mt-1 break-words text-xs leading-relaxed text-slate-700 dark:text-slate-200">{this.state.error.message}</p>
          </div>
          <button
            className="mt-5 rounded-md border border-[#188a89] bg-[#188a89] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#147776] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] focus-visible:ring-offset-2"
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
