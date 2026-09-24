import { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "Unknown render error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application render error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error-page">
          <div className="container">
            <div className="app-error-card">
              <h1>Мэдээлэл харуулахад алдаа гарлаа</h1>
              <p>Хуудсыг дахин ачаалаад үзнэ үү.</p>
              {this.state.message ? <code>{this.state.message}</code> : null}
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
