"use client";
import * as React from "react";

export class ErrorBoundary extends React.Component {
  public state: {
    hasError: boolean;
    error: Error | null;
  } = {
    hasError: false,
    error: null,
  };
  public props: {
    children: React.ReactNode;
  } = {
    children: null,
  };
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
    this.props = props;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.state.error) {
        return (
          <div>
            <h1>Error</h1>
            <p>{this.state.error.message}</p>
            <p style={{ whiteSpace: "pre-wrap" }}>{this.state.error.stack}</p>
          </div>
        );
      }
      return <div>Error</div>;
    }
    return this.props.children;
  }
}

