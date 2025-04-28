import { QueryClient } from '@tanstack/react-query';

export const BACKEND = 'http://localhost:5000';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});
