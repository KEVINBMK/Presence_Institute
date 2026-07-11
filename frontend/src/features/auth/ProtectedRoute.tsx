import { Navigate, useLocation } from 'react-router-dom';
import type { DemoRole } from './authTypes';
import { useAuth } from './useAuth';

interface ProtectedRouteProps {
  role: DemoRole;
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ role, children, redirectTo = '/connexion' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-anthracite-muted">
        Vérification de la session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  if (user.role !== role) {
    if (user.role === 'RECEPTION') {
      return <Navigate to="/reception" replace />;
    }
    if (user.role === 'PERSONNEL') {
      return <Navigate to="/personnel" replace />;
    }
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <h1 className="font-serif text-xl text-institution">Accès non autorisé</h1>
        <p className="mt-2 text-sm text-anthracite-muted">
          Votre compte n&apos;a pas accès à cette interface.
        </p>
      </div>
    );
  }

  return children;
}
