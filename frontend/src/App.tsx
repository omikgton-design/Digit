import RootApp from "./root/RootApp";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastProvider";
import { LanguageProvider } from "./i18n/LanguageContext";

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ToastProvider>
          <RootApp />
        </ToastProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
