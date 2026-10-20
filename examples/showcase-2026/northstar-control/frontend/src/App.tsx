import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

import ShipmentDetailPage from './pages/ShipmentDetailPage';
import ShipmentCreatePage from './pages/ShipmentCreatePage';
import ShipmentEditPage from './pages/ShipmentEditPage';
import DeliveryListPage from './pages/DeliveryListPage';
import DeliveryDetailPage from './pages/DeliveryDetailPage';
import DeliveryCreatePage from './pages/DeliveryCreatePage';
import DeliveryEditPage from './pages/DeliveryEditPage';
import VehicleListPage from './pages/VehicleListPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import VehicleCreatePage from './pages/VehicleCreatePage';
import VehicleEditPage from './pages/VehicleEditPage';
import DriverListPage from './pages/DriverListPage';
import DriverDetailPage from './pages/DriverDetailPage';
import DriverCreatePage from './pages/DriverCreatePage';
import DriverEditPage from './pages/DriverEditPage';
import DeliveryRouteListPage from './pages/DeliveryRouteListPage';
import DeliveryRouteDetailPage from './pages/DeliveryRouteDetailPage';
import DeliveryRouteCreatePage from './pages/DeliveryRouteCreatePage';
import DeliveryRouteEditPage from './pages/DeliveryRouteEditPage';
import TrackingEventListPage from './pages/TrackingEventListPage';
import TrackingEventDetailPage from './pages/TrackingEventDetailPage';
import TrackingEventCreatePage from './pages/TrackingEventCreatePage';
import TrackingEventEditPage from './pages/TrackingEventEditPage';
import RemessasEEntregasWorkspacePage from './pages/RemessasEEntregasWorkspacePage';
import FrotaWorkspacePage from './pages/FrotaWorkspacePage';
import PlanejamentoDeRotasWorkspacePage from './pages/PlanejamentoDeRotasWorkspacePage';
import RastreamentoLogisticoWorkspacePage from './pages/RastreamentoLogisticoWorkspacePage';




function App() {
  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />

        <Route path="/shipments" element={<Layout><RemessasEEntregasWorkspacePage /></Layout>} />
        <Route path="/shipments/new" element={<Layout><ShipmentCreatePage /></Layout>} />
        <Route path="/shipments/:id/edit" element={<Layout><ShipmentEditPage /></Layout>} />
        <Route path="/shipments/:id" element={<Layout><ShipmentDetailPage /></Layout>} />
        <Route path="/deliveries" element={<Layout><DeliveryListPage /></Layout>} />
        <Route path="/deliveries/new" element={<Layout><DeliveryCreatePage /></Layout>} />
        <Route path="/deliveries/:id/edit" element={<Layout><DeliveryEditPage /></Layout>} />
        <Route path="/deliveries/:id" element={<Layout><DeliveryDetailPage /></Layout>} />
        <Route path="/vehicles" element={<Layout><VehicleListPage /></Layout>} />
        <Route path="/vehicles/new" element={<Layout><VehicleCreatePage /></Layout>} />
        <Route path="/vehicles/:id/edit" element={<Layout><VehicleEditPage /></Layout>} />
        <Route path="/vehicles/:id" element={<Layout><VehicleDetailPage /></Layout>} />
        <Route path="/drivers" element={<Layout><DriverListPage /></Layout>} />
        <Route path="/drivers/new" element={<Layout><DriverCreatePage /></Layout>} />
        <Route path="/drivers/:id/edit" element={<Layout><DriverEditPage /></Layout>} />
        <Route path="/drivers/:id" element={<Layout><DriverDetailPage /></Layout>} />
        <Route path="/delivery-routes" element={<Layout><DeliveryRouteListPage /></Layout>} />
        <Route path="/delivery-routes/new" element={<Layout><DeliveryRouteCreatePage /></Layout>} />
        <Route path="/delivery-routes/:id/edit" element={<Layout><DeliveryRouteEditPage /></Layout>} />
        <Route path="/delivery-routes/:id" element={<Layout><DeliveryRouteDetailPage /></Layout>} />
        <Route path="/tracking-events" element={<Layout><TrackingEventListPage /></Layout>} />
        <Route path="/tracking-events/new" element={<Layout><TrackingEventCreatePage /></Layout>} />
        <Route path="/tracking-events/:id/edit" element={<Layout><TrackingEventEditPage /></Layout>} />
        <Route path="/tracking-events/:id" element={<Layout><TrackingEventDetailPage /></Layout>} />
        <Route path="/fleet" element={<Layout><FrotaWorkspacePage /></Layout>} />
        <Route path="/routes" element={<Layout><PlanejamentoDeRotasWorkspacePage /></Layout>} />
        <Route path="/tracking" element={<Layout><RastreamentoLogisticoWorkspacePage /></Layout>} />
        </Routes>
      
    </Router>
  );
}

export default App;