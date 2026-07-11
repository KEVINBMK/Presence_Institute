import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/ui/ToastProvider';
import { AuthProvider } from './features/auth/AuthProvider';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
