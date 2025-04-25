import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './util/student/httpStudent';
import { router } from './routes/router';
import { FirstNameProvider } from '@/util/shared/Contexts.jsx';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirstNameProvider>
      <RouterProvider router={router} />
    </FirstNameProvider>
  </QueryClientProvider>
);

export default App;
