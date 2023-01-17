import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Posts } from './Posts';
import './App.css';

const client = new QueryClient();

function App() {
  return (
    // provide React Query client to App
    <QueryClientProvider client={client}>
      <div className="App">
        <h1>Blog Posts</h1>
        <Posts />
      </div>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
