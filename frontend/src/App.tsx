import RootApp from "./root/RootApp";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastProvider";

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <RootApp />
      </ToastProvider>
    </ErrorBoundary>
  );
}
