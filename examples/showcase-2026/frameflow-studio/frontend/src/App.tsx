import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectCreatePage from './pages/ProjectCreatePage';
import ProjectEditPage from './pages/ProjectEditPage';
import AssetListPage from './pages/AssetListPage';
import AssetDetailPage from './pages/AssetDetailPage';
import AssetCreatePage from './pages/AssetCreatePage';
import AssetEditPage from './pages/AssetEditPage';
import ClientListPage from './pages/ClientListPage';
import ClientDetailPage from './pages/ClientDetailPage';
import ClientCreatePage from './pages/ClientCreatePage';
import ClientEditPage from './pages/ClientEditPage';
import ReviewDetailPage from './pages/ReviewDetailPage';
import ReviewCreatePage from './pages/ReviewCreatePage';
import ReviewEditPage from './pages/ReviewEditPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import CustomerCreatePage from './pages/CustomerCreatePage';
import CustomerEditPage from './pages/CustomerEditPage';
import ReportDetailPage from './pages/ReportDetailPage';
import ReportCreatePage from './pages/ReportCreatePage';
import ReportEditPage from './pages/ReportEditPage';
import FileAssetListPage from './pages/FileAssetListPage';
import FileAssetDetailPage from './pages/FileAssetDetailPage';
import FileAssetCreatePage from './pages/FileAssetCreatePage';
import FileAssetEditPage from './pages/FileAssetEditPage';
import ProjetosWorkspacePage from './pages/ProjetosWorkspacePage';
import RevisaoWorkspacePage from './pages/RevisaoWorkspacePage';
import ClientesWorkspacePage from './pages/ClientesWorkspacePage';
import RelatoriosEAnalisesWorkspacePage from './pages/RelatoriosEAnalisesWorkspacePage';
import ArquivosWorkspacePage from './pages/ArquivosWorkspacePage';




function App() {
  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />

        <Route path="/projects" element={<Layout><ProjetosWorkspacePage /></Layout>} />
        <Route path="/projects/new" element={<Layout><ProjectCreatePage /></Layout>} />
        <Route path="/projects/:id/edit" element={<Layout><ProjectEditPage /></Layout>} />
        <Route path="/projects/:id" element={<Layout><ProjectDetailPage /></Layout>} />
        <Route path="/assets" element={<Layout><AssetListPage /></Layout>} />
        <Route path="/assets/new" element={<Layout><AssetCreatePage /></Layout>} />
        <Route path="/assets/:id/edit" element={<Layout><AssetEditPage /></Layout>} />
        <Route path="/assets/:id" element={<Layout><AssetDetailPage /></Layout>} />
        <Route path="/clients" element={<Layout><ClientListPage /></Layout>} />
        <Route path="/clients/new" element={<Layout><ClientCreatePage /></Layout>} />
        <Route path="/clients/:id/edit" element={<Layout><ClientEditPage /></Layout>} />
        <Route path="/clients/:id" element={<Layout><ClientDetailPage /></Layout>} />
        <Route path="/reviews" element={<Layout><RevisaoWorkspacePage /></Layout>} />
        <Route path="/reviews/new" element={<Layout><ReviewCreatePage /></Layout>} />
        <Route path="/reviews/:id/edit" element={<Layout><ReviewEditPage /></Layout>} />
        <Route path="/reviews/:id" element={<Layout><ReviewDetailPage /></Layout>} />
        <Route path="/customers" element={<Layout><ClientesWorkspacePage /></Layout>} />
        <Route path="/customers/new" element={<Layout><CustomerCreatePage /></Layout>} />
        <Route path="/customers/:id/edit" element={<Layout><CustomerEditPage /></Layout>} />
        <Route path="/customers/:id" element={<Layout><CustomerDetailPage /></Layout>} />
        <Route path="/reports" element={<Layout><RelatoriosEAnalisesWorkspacePage /></Layout>} />
        <Route path="/reports/new" element={<Layout><ReportCreatePage /></Layout>} />
        <Route path="/reports/:id/edit" element={<Layout><ReportEditPage /></Layout>} />
        <Route path="/reports/:id" element={<Layout><ReportDetailPage /></Layout>} />
        <Route path="/file-assets" element={<Layout><FileAssetListPage /></Layout>} />
        <Route path="/file-assets/new" element={<Layout><FileAssetCreatePage /></Layout>} />
        <Route path="/file-assets/:id/edit" element={<Layout><FileAssetEditPage /></Layout>} />
        <Route path="/file-assets/:id" element={<Layout><FileAssetDetailPage /></Layout>} />
        <Route path="/files" element={<Layout><ArquivosWorkspacePage /></Layout>} />
        </Routes>
      
    </Router>
  );
}

export default App;