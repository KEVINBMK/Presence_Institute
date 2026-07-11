import { Navigate, Route, Routes } from 'react-router-dom';
import { InternalLayout } from '../components/layout/InternalLayout';
import { PublicLayout } from '../components/layout/PublicLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { PersonnelPage } from '../features/personnel/PersonnelPage';
import { HomePage } from '../features/public/HomePage';
import { ReceptionPage } from '../features/reception/ReceptionPage';
import { SuiviRendezVousPage } from '../features/usager/SuiviRendezVousPage';
import { UsagerPage } from '../features/usager/UsagerPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="usager" element={<UsagerPage />} />
        <Route path="suivi-rendez-vous" element={<SuiviRendezVousPage />} />
        <Route path="usager/suivi" element={<Navigate to="/suivi-rendez-vous" replace />} />
        <Route path="connexion" element={<LoginPage />} />
      </Route>

      <Route element={<InternalLayout />}>
        <Route
          path="reception"
          element={
            <ProtectedRoute role="RECEPTION">
              <ReceptionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="personnel"
          element={
            <ProtectedRoute role="PERSONNEL">
              <PersonnelPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
