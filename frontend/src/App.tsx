import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes/router';
import { queryClient } from './util/shared/config';
import { MathJaxContext } from 'better-react-mathjax';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Suspense>
      <MathJaxContext>
        <RouterProvider router={router} />
      </MathJaxContext>
    </Suspense>
  </QueryClientProvider>
);

export default App;
