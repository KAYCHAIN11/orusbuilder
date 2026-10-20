import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

import ObraDetailPage from './pages/ObraDetailPage';
import ObraCreatePage from './pages/ObraCreatePage';
import ObraEditPage from './pages/ObraEditPage';
import EmprestimoDetailPage from './pages/EmprestimoDetailPage';
import EmprestimoCreatePage from './pages/EmprestimoCreatePage';
import EmprestimoEditPage from './pages/EmprestimoEditPage';
import DevolucaoListPage from './pages/DevolucaoListPage';
import DevolucaoDetailPage from './pages/DevolucaoDetailPage';
import DevolucaoCreatePage from './pages/DevolucaoCreatePage';
import DevolucaoEditPage from './pages/DevolucaoEditPage';
import ReservaDetailPage from './pages/ReservaDetailPage';
import ReservaCreatePage from './pages/ReservaCreatePage';
import ReservaEditPage from './pages/ReservaEditPage';
import MultaDetailPage from './pages/MultaDetailPage';
import MultaCreatePage from './pages/MultaCreatePage';
import MultaEditPage from './pages/MultaEditPage';
import CatalogoDeObrasWorkspacePage from './pages/CatalogoDeObrasWorkspacePage';
import EmprestimosComPrazoWorkspacePage from './pages/EmprestimosComPrazoWorkspacePage';
import DevolucaoWorkspacePage from './pages/DevolucaoWorkspacePage';
import ReservasWorkspacePage from './pages/ReservasWorkspacePage';
import CalculoAutomaticoDeMultasWorkspacePage from './pages/CalculoAutomaticoDeMultasWorkspacePage';



function App() {
  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />

        <Route path="/obras" element={<Layout><CatalogoDeObrasWorkspacePage /></Layout>} />
        <Route path="/obras/new" element={<Layout><ObraCreatePage /></Layout>} />
        <Route path="/obras/:id/edit" element={<Layout><ObraEditPage /></Layout>} />
        <Route path="/obras/:id" element={<Layout><ObraDetailPage /></Layout>} />
        <Route path="/emprestimos" element={<Layout><EmprestimosComPrazoWorkspacePage /></Layout>} />
        <Route path="/emprestimos/new" element={<Layout><EmprestimoCreatePage /></Layout>} />
        <Route path="/emprestimos/:id/edit" element={<Layout><EmprestimoEditPage /></Layout>} />
        <Route path="/emprestimos/:id" element={<Layout><EmprestimoDetailPage /></Layout>} />
        <Route path="/devolucaos" element={<Layout><DevolucaoListPage /></Layout>} />
        <Route path="/devolucaos/new" element={<Layout><DevolucaoCreatePage /></Layout>} />
        <Route path="/devolucaos/:id/edit" element={<Layout><DevolucaoEditPage /></Layout>} />
        <Route path="/devolucaos/:id" element={<Layout><DevolucaoDetailPage /></Layout>} />
        <Route path="/reservas" element={<Layout><ReservasWorkspacePage /></Layout>} />
        <Route path="/reservas/new" element={<Layout><ReservaCreatePage /></Layout>} />
        <Route path="/reservas/:id/edit" element={<Layout><ReservaEditPage /></Layout>} />
        <Route path="/reservas/:id" element={<Layout><ReservaDetailPage /></Layout>} />
        <Route path="/multas" element={<Layout><CalculoAutomaticoDeMultasWorkspacePage /></Layout>} />
        <Route path="/multas/new" element={<Layout><MultaCreatePage /></Layout>} />
        <Route path="/multas/:id/edit" element={<Layout><MultaEditPage /></Layout>} />
        <Route path="/multas/:id" element={<Layout><MultaDetailPage /></Layout>} />
        <Route path="/devolucao" element={<Layout><DevolucaoWorkspacePage /></Layout>} />
        </Routes>
      
    </Router>
  );
}

export default App;