import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes/router';
import { queryClient } from './util/shared/config';
import { MathJaxContext } from 'better-react-mathjax';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MathJaxContext>
      <RouterProvider router={router} />
    </MathJaxContext>
  </QueryClientProvider>
);

export default App;
