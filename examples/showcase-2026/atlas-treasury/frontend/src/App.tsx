import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

import TransactionDetailPage from './pages/TransactionDetailPage';
import TransactionCreatePage from './pages/TransactionCreatePage';
import TransactionEditPage from './pages/TransactionEditPage';
import AccountListPage from './pages/AccountListPage';
import AccountDetailPage from './pages/AccountDetailPage';
import AccountCreatePage from './pages/AccountCreatePage';
import AccountEditPage from './pages/AccountEditPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import InvoiceCreatePage from './pages/InvoiceCreatePage';
import InvoiceEditPage from './pages/InvoiceEditPage';
import BudgetListPage from './pages/BudgetListPage';
import BudgetDetailPage from './pages/BudgetDetailPage';
import BudgetCreatePage from './pages/BudgetCreatePage';
import BudgetEditPage from './pages/BudgetEditPage';
import NotificationDetailPage from './pages/NotificationDetailPage';
import NotificationCreatePage from './pages/NotificationCreatePage';
import NotificationEditPage from './pages/NotificationEditPage';
import RoleListPage from './pages/RoleListPage';
import RoleDetailPage from './pages/RoleDetailPage';
import RoleCreatePage from './pages/RoleCreatePage';
import RoleEditPage from './pages/RoleEditPage';
import PaymentDetailPage from './pages/PaymentDetailPage';
import PaymentCreatePage from './pages/PaymentCreatePage';
import PaymentEditPage from './pages/PaymentEditPage';
import MovimentacoesWorkspacePage from './pages/MovimentacoesWorkspacePage';
import FaturasWorkspacePage from './pages/FaturasWorkspacePage';
import NotificacoesWorkspacePage from './pages/NotificacoesWorkspacePage';
import PapeisEPermissoesWorkspacePage from './pages/PapeisEPermissoesWorkspacePage';
import PagamentosWorkspacePage from './pages/PagamentosWorkspacePage';




function App() {
  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />

        <Route path="/transactions" element={<Layout><MovimentacoesWorkspacePage /></Layout>} />
        <Route path="/transactions/new" element={<Layout><TransactionCreatePage /></Layout>} />
        <Route path="/transactions/:id/edit" element={<Layout><TransactionEditPage /></Layout>} />
        <Route path="/transactions/:id" element={<Layout><TransactionDetailPage /></Layout>} />
        <Route path="/accounts" element={<Layout><AccountListPage /></Layout>} />
        <Route path="/accounts/new" element={<Layout><AccountCreatePage /></Layout>} />
        <Route path="/accounts/:id/edit" element={<Layout><AccountEditPage /></Layout>} />
        <Route path="/accounts/:id" element={<Layout><AccountDetailPage /></Layout>} />
        <Route path="/invoices" element={<Layout><FaturasWorkspacePage /></Layout>} />
        <Route path="/invoices/new" element={<Layout><InvoiceCreatePage /></Layout>} />
        <Route path="/invoices/:id/edit" element={<Layout><InvoiceEditPage /></Layout>} />
        <Route path="/invoices/:id" element={<Layout><InvoiceDetailPage /></Layout>} />
        <Route path="/budgets" element={<Layout><BudgetListPage /></Layout>} />
        <Route path="/budgets/new" element={<Layout><BudgetCreatePage /></Layout>} />
        <Route path="/budgets/:id/edit" element={<Layout><BudgetEditPage /></Layout>} />
        <Route path="/budgets/:id" element={<Layout><BudgetDetailPage /></Layout>} />
        <Route path="/notifications" element={<Layout><NotificacoesWorkspacePage /></Layout>} />
        <Route path="/notifications/new" element={<Layout><NotificationCreatePage /></Layout>} />
        <Route path="/notifications/:id/edit" element={<Layout><NotificationEditPage /></Layout>} />
        <Route path="/notifications/:id" element={<Layout><NotificationDetailPage /></Layout>} />
        <Route path="/roles" element={<Layout><RoleListPage /></Layout>} />
        <Route path="/roles/new" element={<Layout><RoleCreatePage /></Layout>} />
        <Route path="/roles/:id/edit" element={<Layout><RoleEditPage /></Layout>} />
        <Route path="/roles/:id" element={<Layout><RoleDetailPage /></Layout>} />
        <Route path="/payments" element={<Layout><PagamentosWorkspacePage /></Layout>} />
        <Route path="/payments/new" element={<Layout><PaymentCreatePage /></Layout>} />
        <Route path="/payments/:id/edit" element={<Layout><PaymentEditPage /></Layout>} />
        <Route path="/payments/:id" element={<Layout><PaymentDetailPage /></Layout>} />
        <Route path="/access" element={<Layout><PapeisEPermissoesWorkspacePage /></Layout>} />
        </Routes>
      
    </Router>
  );
}

export default App;