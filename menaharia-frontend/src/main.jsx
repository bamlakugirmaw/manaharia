import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Never retry on 4xx — they're client errors, not transient.
            // Always retry up to 2 times on 5xx / network errors.
            retry: (failureCount, error) => {
                const status = error?.response?.status;
                if (status && status >= 400 && status < 500) return false;
                return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            // Never let a failed query crash the render tree.
            // Components receive isError + error and handle it themselves.
            throwOnError: false,
        },
        mutations: {
            retry: false,
            throwOnError: false,
        },
    },
});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </QueryClientProvider>
    </StrictMode>,
);
