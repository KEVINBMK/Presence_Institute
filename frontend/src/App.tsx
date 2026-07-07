import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/ui/ToastProvider';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}
