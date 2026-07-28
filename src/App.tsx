import { Route, Routes } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AppointmentDetailsPage from "./screens/AppointmentDetailsPage";
import AppointmentsPage from "./screens/AppointmentsPage";
import DocumentsPage from "./screens/DocumentsPage";
import HomePage from "./screens/HomePage";
import LoginPage from "./screens/LoginPage";
import ProfilePage from "./screens/ProfilePage";
import RegisterPage from "./screens/RegisterPage";
import UsersPage from "./screens/UsersPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}

export default App;
