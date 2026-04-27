"use client";

import React, { ErrorInfo, ReactNode } from "react";
import { logError } from "@/lib/error-logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, { componentStack: errorInfo.componentStack });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="error-boundary-fallback"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#f9fafb",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              backgroundColor: "white",
              borderRadius: "0.5rem",
              padding: "2rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "#1f2937",
              }}
            >
              Oops! Something went wrong
            </h1>
            <p
              style={{
                fontSize: "1rem",
                marginBottom: "1.5rem",
                color: "#6b7280",
              }}
            >
              We encountered an unexpected error. Our team has been notified, and we&apos;re working
              to fix it.
            </p>

            {this.state.error && (
              <details
                style={{
                  marginBottom: "1.5rem",
                  textAlign: "left",
                  backgroundColor: "#f3f4f6",
                  padding: "1rem",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                }}
              >
                <summary style={{ fontWeight: "600", color: "#374151" }}>Error details</summary>
                <pre
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleRetry}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.375rem",
                border: "none",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2563eb";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#3b82f6";
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
