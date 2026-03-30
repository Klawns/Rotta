'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';

interface Props {
  children: ReactNode;
  message?: string;
}

interface State {
  hasError: boolean;
}

class ErrorBoundaryClass extends Component<Props & { onReset: () => void }, State> {
  constructor(props: Props & { onReset: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('QueryErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.props.onReset();
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[200px] rounded-[2rem] border border-red-500/10 bg-red-500/5 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Ops! Algo deu errado</h3>
            <p className="text-sm text-slate-400 max-w-[250px] mx-auto">
              {this.props.message || 'Ocorreu um erro ao carregar os dados.'}
            </p>
          </div>
          <Button
            onClick={this.handleReset}
            variant="outline"
            className="border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest gap-2"
          >
            <RotateCcw className="w-3 h-3" />
            Tentar Novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function QueryErrorBoundary(props: Props) {
  const { reset } = useQueryErrorResetBoundary();
  return <ErrorBoundaryClass {...props} onReset={reset} />;
}
