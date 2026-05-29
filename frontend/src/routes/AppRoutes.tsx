import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { PersonnelPage } from '../features/personnel/PersonnelPage';
import { ReceptionPage } from '../features/reception/ReceptionPage';
import { UsagerPage } from '../features/usager/UsagerPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/reception" replace />} />
        <Route path="usager" element={<UsagerPage />} />
        <Route path="reception" element={<ReceptionPage />} />
        <Route path="personnel" element={<PersonnelPage />} />
      </Route>
    </Routes>
  );
}
