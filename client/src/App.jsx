import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateGift from "./pages/CreateGift.jsx";
import GiftView from "./pages/GiftView.jsx";
import SubscriptionRequired from "./pages/SubscriptionRequired.jsx";
import Profile from "./pages/Profile.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminUserDetail from "./pages/AdminUserDetail.jsx";
import SubscriptionGuard from "./components/SubscriptionGuard.jsx";
import AdminGuard from "./components/AdminGuard.jsx";

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login/*" element={<Login />} />
          <Route path="/signup/*" element={<Signup />} />
          <Route
            path="/subscription-required"
            element={<SubscriptionRequired />}
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          {/* Protected routes with subscription check */}
          <Route
            path="/dashboard"
            element={
              <SubscriptionGuard>
                <Dashboard />
              </SubscriptionGuard>
            }
          />
          <Route
            path="/create"
            element={
              <SubscriptionGuard>
                <CreateGift />
              </SubscriptionGuard>
            }
          />

          {/* Admin routes with admin check */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminUsers />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/users/:userId"
            element={
              <AdminGuard>
                <AdminUserDetail />
              </AdminGuard>
            }
          />

          {/* Public route */}
          <Route path="/gift/:slug" element={<GiftView />} />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
