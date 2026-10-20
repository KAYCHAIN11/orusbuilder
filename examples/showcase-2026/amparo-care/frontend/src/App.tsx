import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PatientDetailPage from './pages/PatientDetailPage';
import PatientCreatePage from './pages/PatientCreatePage';
import PatientEditPage from './pages/PatientEditPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import AppointmentCreatePage from './pages/AppointmentCreatePage';
import AppointmentEditPage from './pages/AppointmentEditPage';
import ClinicalRecordListPage from './pages/ClinicalRecordListPage';
import ClinicalRecordDetailPage from './pages/ClinicalRecordDetailPage';
import ClinicalRecordCreatePage from './pages/ClinicalRecordCreatePage';
import ClinicalRecordEditPage from './pages/ClinicalRecordEditPage';
import ProfessionalListPage from './pages/ProfessionalListPage';
import ProfessionalDetailPage from './pages/ProfessionalDetailPage';
import ProfessionalCreatePage from './pages/ProfessionalCreatePage';
import ProfessionalEditPage from './pages/ProfessionalEditPage';
import NotificationDetailPage from './pages/NotificationDetailPage';
import NotificationCreatePage from './pages/NotificationCreatePage';
import NotificationEditPage from './pages/NotificationEditPage';
import RoleListPage from './pages/RoleListPage';
import RoleDetailPage from './pages/RoleDetailPage';
import RoleCreatePage from './pages/RoleCreatePage';
import RoleEditPage from './pages/RoleEditPage';
import AgendaWorkspacePage from './pages/AgendaWorkspacePage';
import PacientesWorkspacePage from './pages/PacientesWorkspacePage';
import NotificacoesWorkspacePage from './pages/NotificacoesWorkspacePage';
import PapeisEPermissoesWorkspacePage from './pages/PapeisEPermissoesWorkspacePage';

const previewMode = import.meta.env.VITE_ORUS_PREVIEW_MODE === 'true';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center bg-[rgb(var(--orus-page))] text-[rgb(var(--orus-muted))]">Carregando...</div>;
  return previewMode || isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>} />
          <Route path="/login" element={previewMode ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/register" element={previewMode ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/patients" element={<ProtectedRoute><Layout><PacientesWorkspacePage /></Layout></ProtectedRoute>} />
        <Route path="/patients/new" element={<ProtectedRoute><Layout><PatientCreatePage /></Layout></ProtectedRoute>} />
        <Route path="/patients/:id/edit" element={<ProtectedRoute><Layout><PatientEditPage /></Layout></ProtectedRoute>} />
        <Route path="/patients/:id" element={<ProtectedRoute><Layout><PatientDetailPage /></Layout></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Layout><AgendaWorkspacePage /></Layout></ProtectedRoute>} />
        <Route path="/appointments/new" element={<ProtectedRoute><Layout><AppointmentCreatePage /></Layout></ProtectedRoute>} />
        <Route path="/appointments/:id/edit" element={<ProtectedRoute><Layout><AppointmentEditPage /></Layout></ProtectedRoute>} />
        <Route path="/appointments/:id" element={<ProtectedRoute><Layout><AppointmentDetailPage /></Layout></ProtectedRoute>} />
        <Route path="/clinical-records" element={<ProtectedRoute><Layout><ClinicalRecordListPage /></Layout></ProtectedRoute>} />
        <Route path="/clinical-records/new" element={<ProtectedRoute><Layout><ClinicalRecordCreatePage /></Layout></ProtectedRoute>} />
        <Route path="/clinical-records/:id/edit" element={<ProtectedRoute><Layout><ClinicalRecordEditPage /></Layout></ProtectedRoute>} />
        <Route path="/clinical-records/:id" element={<ProtectedRoute><Layout><ClinicalRecordDetailPage /></Layout></ProtectedRoute>} />
        <Route path="/professionals" element={<ProtectedRoute><Layout><ProfessionalListPage /></Layout></ProtectedRoute>} />
        <Route path="/professionals/new" element={<ProtectedRoute><Layout><ProfessionalCreatePage /></Layout></ProtectedRoute>} />
        <Route path="/professionals/:id/edit" element={<ProtectedRoute><Layout><ProfessionalEditPage /></Layout></ProtectedRoute>} />
        <Route path="/professionals/:id" element={<ProtectedRoute><Layout><ProfessionalDetailPage /></Layout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Layout><NotificacoesWorkspacePage /></Layout></ProtectedRoute>} />
        <Route path="/notifications/new" element={<ProtectedRoute><Layout><NotificationCreatePage /></Layout></ProtectedRoute>} />
        <Route path="/notifications/:id/edit" element={<ProtectedRoute><Layout><NotificationEditPage /></Layout></ProtectedRoute>} />
        <Route path="/notifications/:id" element={<ProtectedRoute><Layout><NotificationDetailPage /></Layout></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute><Layout><RoleListPage /></Layout></ProtectedRoute>} />
        <Route path="/roles/new" element={<ProtectedRoute><Layout><RoleCreatePage /></Layout></ProtectedRoute>} />
        <Route path="/roles/:id/edit" element={<ProtectedRoute><Layout><RoleEditPage /></Layout></ProtectedRoute>} />
        <Route path="/roles/:id" element={<ProtectedRoute><Layout><RoleDetailPage /></Layout></ProtectedRoute>} />
        <Route path="/access" element={<ProtectedRoute><Layout><PapeisEPermissoesWorkspacePage /></Layout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;