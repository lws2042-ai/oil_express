import { Navigate, Route, Routes } from "react-router-dom";

import { WorkspaceLayout } from "./layouts/WorkspaceLayout";
import { CustomerOrderPage } from "./pages/CustomerOrderPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DeliveriesPage } from "./pages/DeliveriesPage";
import { LandingPage } from "./pages/LandingPage";
import { OrdersPage } from "./pages/OrdersPage";

export default function App() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/delivery" element={<LandingPage page="delivery.html" />} />
    <Route path="/market" element={<LandingPage page="market.html" />} />
    <Route path="/briefing" element={<LandingPage page="briefing.html" />} />
    <Route path="/news" element={<LandingPage page="news.html" />} />
    <Route path="/admin" element={<WorkspaceLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="customers" element={<CustomersPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="deliveries" element={<DeliveriesPage />} />
      <Route path="customer-order" element={<CustomerOrderPage />} />
    </Route>
    <Route path="/customers" element={<Navigate to="/admin/customers" replace />} />
    <Route path="/orders" element={<Navigate to="/admin/orders" replace />} />
    <Route path="/deliveries" element={<Navigate to="/admin/deliveries" replace />} />
    <Route path="/customer-order" element={<Navigate to="/admin/customer-order" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
