import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ModuleErrorBoundary extends React.Component<Props, State> {
  props: Props;
  state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`[ModuleErrorBoundary] Error en módulo "${this.props.moduleName || 'Desconocido'}":`, error, errorInfo);
  }

  handleRetry = () => {
    (this as any).setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-4 bg-white rounded-3xl border border-red-200 text-slate-700 shadow-sm space-y-4 max-w-xl mx-auto text-center">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Error en {this.props.moduleName || 'Módulo'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ocurrió un problema temporal al renderizar este componente. El resto del sistema continúa operativo.
            </p>
          </div>

          {this.state.error && (
            <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 text-[11px] font-mono text-red-600 overflow-x-auto">
              {this.state.error.message}
            </div>
          )}

          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar Módulo</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
