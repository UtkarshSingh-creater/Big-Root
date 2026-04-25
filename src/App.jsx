import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// AUTH
import CollegeSelect from "./pages/CollegeSelect.jsx";
import RoleSelect from "./pages/auth/RoleSelect.jsx";
import Login from "./pages/auth/Login.jsx";

// DASHBOARDS
import StudentDashboard from "./pages/dashboard/StudentDashboard.jsx";
import FacultyDashboard from "./pages/dashboard/FacultyDashboard.jsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.jsx";
import AlumniDashboard from "./pages/dashboard/AlumniDashboard.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Networking from "./pages/network/Networking.jsx";
import Messaging from "./pages/messaging/Messaging.jsx";
import Profile from "./pages/profile/Profile.jsx";
import PublicProfile from "./pages/profile/PublicProfile.jsx";
import Opportunities from "./pages/opportunities/Opportunities.jsx";
import Events from "./pages/events/Events.jsx";

/* =========================
   🔒 Protected Route
========================= */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Prevent crash if token is "null" string
  if (!token || token === "null" || token === "undefined") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================
   🚀 APP
========================= */
export default function App() {
  return (
    <>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#151f24',
          color: '#e2e8f0',
          border: '1px solid rgba(16,185,129,0.2)',
        }
      }} />
      <BrowserRouter>
        <Routes>

        {/* STEP 1 */}
        <Route path="/" element={<CollegeSelect />} />

        {/* STEP 2 */}
        <Route path="/role" element={<RoleSelect />} />

        {/* STEP 3 */}
        <Route path="/login" element={<Login />} />

        {/* AUTH EXTRAS */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ================= DASHBOARDS ================= */}

        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/alumni"
          element={
            <ProtectedRoute>
              <AlumniDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/faculty"
          element={
            <ProtectedRoute>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= APP FEATURES ================= */}
        
        <Route
          path="/network"
          element={
            <ProtectedRoute>
              <Networking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messaging"
          element={
            <ProtectedRoute>
              <Messaging />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <PublicProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
    </>
  );
}