// Error Boundary Component
// Catches JavaScript errors anywhere in the child component tree

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icons } from './Icons';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = { hasError: false, error: null };

    constructor(props: Props) {
        super(props);
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development only
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught:', error, errorInfo);
        }
        // TODO: Send to error tracking service (Sentry, etc.)
    }

    handleRestart = () => {
        // Clear error state and reload
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-full flex flex-col items-center justify-center bg-black text-white p-6 text-center">
                    {/* Glow background */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Error Icon */}
                        <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-6">
                            <Icons.AlertTriangle size={40} className="text-red-400" />
                        </div>

                        <h1 className="text-2xl font-bold mb-2">Что-то пошло не так</h1>
                        <p className="text-white/60 mb-8 max-w-xs">
                            Произошла непредвиденная ошибка. Пожалуйста, перезапустите приложение.
                        </p>

                        <button
                            onClick={this.handleRestart}
                            className="px-8 py-4 bg-[#00D4AA] text-black font-bold rounded-2xl hover:bg-[#00D4AA]/90 transition active:scale-95"
                        >
                            Перезапустить
                        </button>

                        {/* Error details (dev only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-8 p-4 bg-white/5 rounded-xl text-left max-w-sm overflow-auto">
                                <p className="text-xs text-red-400 font-mono break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
