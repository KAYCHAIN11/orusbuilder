import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

import JobOpeningListPage from './pages/JobOpeningListPage';
import JobOpeningDetailPage from './pages/JobOpeningDetailPage';
import JobOpeningCreatePage from './pages/JobOpeningCreatePage';
import JobOpeningEditPage from './pages/JobOpeningEditPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import CandidateCreatePage from './pages/CandidateCreatePage';
import CandidateEditPage from './pages/CandidateEditPage';
import ApplicationListPage from './pages/ApplicationListPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import ApplicationCreatePage from './pages/ApplicationCreatePage';
import ApplicationEditPage from './pages/ApplicationEditPage';
import InterviewDetailPage from './pages/InterviewDetailPage';
import InterviewCreatePage from './pages/InterviewCreatePage';
import InterviewEditPage from './pages/InterviewEditPage';
import ReportDetailPage from './pages/ReportDetailPage';
import ReportCreatePage from './pages/ReportCreatePage';
import ReportEditPage from './pages/ReportEditPage';
import VagasWorkspacePage from './pages/VagasWorkspacePage';
import CandidatosWorkspacePage from './pages/CandidatosWorkspacePage';
import ProcessoSeletivoWorkspacePage from './pages/ProcessoSeletivoWorkspacePage';
import EntrevistasWorkspacePage from './pages/EntrevistasWorkspacePage';
import RelatoriosEAnalisesWorkspacePage from './pages/RelatoriosEAnalisesWorkspacePage';



function App() {
  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />

        <Route path="/job-openings" element={<Layout><JobOpeningListPage /></Layout>} />
        <Route path="/job-openings/new" element={<Layout><JobOpeningCreatePage /></Layout>} />
        <Route path="/job-openings/:id/edit" element={<Layout><JobOpeningEditPage /></Layout>} />
        <Route path="/job-openings/:id" element={<Layout><JobOpeningDetailPage /></Layout>} />
        <Route path="/candidates" element={<Layout><CandidatosWorkspacePage /></Layout>} />
        <Route path="/candidates/new" element={<Layout><CandidateCreatePage /></Layout>} />
        <Route path="/candidates/:id/edit" element={<Layout><CandidateEditPage /></Layout>} />
        <Route path="/candidates/:id" element={<Layout><CandidateDetailPage /></Layout>} />
        <Route path="/applications" element={<Layout><ApplicationListPage /></Layout>} />
        <Route path="/applications/new" element={<Layout><ApplicationCreatePage /></Layout>} />
        <Route path="/applications/:id/edit" element={<Layout><ApplicationEditPage /></Layout>} />
        <Route path="/applications/:id" element={<Layout><ApplicationDetailPage /></Layout>} />
        <Route path="/interviews" element={<Layout><EntrevistasWorkspacePage /></Layout>} />
        <Route path="/interviews/new" element={<Layout><InterviewCreatePage /></Layout>} />
        <Route path="/interviews/:id/edit" element={<Layout><InterviewEditPage /></Layout>} />
        <Route path="/interviews/:id" element={<Layout><InterviewDetailPage /></Layout>} />
        <Route path="/reports" element={<Layout><RelatoriosEAnalisesWorkspacePage /></Layout>} />
        <Route path="/reports/new" element={<Layout><ReportCreatePage /></Layout>} />
        <Route path="/reports/:id/edit" element={<Layout><ReportEditPage /></Layout>} />
        <Route path="/reports/:id" element={<Layout><ReportDetailPage /></Layout>} />
        <Route path="/jobs" element={<Layout><VagasWorkspacePage /></Layout>} />
        <Route path="/hiring" element={<Layout><ProcessoSeletivoWorkspacePage /></Layout>} />
        </Routes>
      
    </Router>
  );
}

export default App;