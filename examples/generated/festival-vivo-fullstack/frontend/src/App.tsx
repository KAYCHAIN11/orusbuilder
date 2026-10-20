import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

import EventDetailPage from './pages/EventDetailPage';
import EventCreatePage from './pages/EventCreatePage';
import EventEditPage from './pages/EventEditPage';
import EventSessionListPage from './pages/EventSessionListPage';
import EventSessionDetailPage from './pages/EventSessionDetailPage';
import EventSessionCreatePage from './pages/EventSessionCreatePage';
import EventSessionEditPage from './pages/EventSessionEditPage';
import TicketDetailPage from './pages/TicketDetailPage';
import TicketCreatePage from './pages/TicketCreatePage';
import TicketEditPage from './pages/TicketEditPage';
import AttendeeListPage from './pages/AttendeeListPage';
import AttendeeDetailPage from './pages/AttendeeDetailPage';
import AttendeeCreatePage from './pages/AttendeeCreatePage';
import AttendeeEditPage from './pages/AttendeeEditPage';
import CheckInListPage from './pages/CheckInListPage';
import CheckInDetailPage from './pages/CheckInDetailPage';
import CheckInCreatePage from './pages/CheckInCreatePage';
import CheckInEditPage from './pages/CheckInEditPage';
import ProgramacaoDeEventosWorkspacePage from './pages/ProgramacaoDeEventosWorkspacePage';
import IngressosEInscricoesWorkspacePage from './pages/IngressosEInscricoesWorkspacePage';
import CredenciamentoWorkspacePage from './pages/CredenciamentoWorkspacePage';



function App() {
  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />

        <Route path="/events" element={<Layout><ProgramacaoDeEventosWorkspacePage /></Layout>} />
        <Route path="/events/new" element={<Layout><EventCreatePage /></Layout>} />
        <Route path="/events/:id/edit" element={<Layout><EventEditPage /></Layout>} />
        <Route path="/events/:id" element={<Layout><EventDetailPage /></Layout>} />
        <Route path="/event-sessions" element={<Layout><EventSessionListPage /></Layout>} />
        <Route path="/event-sessions/new" element={<Layout><EventSessionCreatePage /></Layout>} />
        <Route path="/event-sessions/:id/edit" element={<Layout><EventSessionEditPage /></Layout>} />
        <Route path="/event-sessions/:id" element={<Layout><EventSessionDetailPage /></Layout>} />
        <Route path="/tickets" element={<Layout><IngressosEInscricoesWorkspacePage /></Layout>} />
        <Route path="/tickets/new" element={<Layout><TicketCreatePage /></Layout>} />
        <Route path="/tickets/:id/edit" element={<Layout><TicketEditPage /></Layout>} />
        <Route path="/tickets/:id" element={<Layout><TicketDetailPage /></Layout>} />
        <Route path="/attendees" element={<Layout><AttendeeListPage /></Layout>} />
        <Route path="/attendees/new" element={<Layout><AttendeeCreatePage /></Layout>} />
        <Route path="/attendees/:id/edit" element={<Layout><AttendeeEditPage /></Layout>} />
        <Route path="/attendees/:id" element={<Layout><AttendeeDetailPage /></Layout>} />
        <Route path="/check-ins" element={<Layout><CheckInListPage /></Layout>} />
        <Route path="/check-ins/new" element={<Layout><CheckInCreatePage /></Layout>} />
        <Route path="/check-ins/:id/edit" element={<Layout><CheckInEditPage /></Layout>} />
        <Route path="/check-ins/:id" element={<Layout><CheckInDetailPage /></Layout>} />
        <Route path="/check-in" element={<Layout><CredenciamentoWorkspacePage /></Layout>} />
        </Routes>
      
    </Router>
  );
}

export default App;