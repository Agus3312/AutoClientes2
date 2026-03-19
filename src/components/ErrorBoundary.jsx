import { Component } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1">Algo salio mal</p>
          <p className="text-xs text-slate-400 dark:text-gray-500 mb-4 max-w-xs">
            {this.state.error?.message || 'Error inesperado'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
