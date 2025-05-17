import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes/router';
import { queryClient } from './util/shared/config';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Suspense>
      <RouterProvider router={router} />
    </Suspense>
  </QueryClientProvider>
);

export default App;
