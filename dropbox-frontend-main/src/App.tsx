import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./guards/protected-routes";
import PublicedRoute from "./guards/public-routes";
import RootLayout from "./layouts/root-layout";
import Dashboard from "./pages/admin/dashboard";
import Users from "./pages/admin/users";
import Login from "./pages/auth/login";
import Home from "./pages/home";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ChangePassword from "./components/ChangePassword";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicedRoute />}>
        <Route path="" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      {/* <Route path="/verify-otp" element={<VerifyOT />} />
      <Route path="/reset-password" element={<ResetPassword />} /> */}
      </Route>
      <Route path="/app" element={<ProtectedRoute allowedRoles={['user']} />}>
        <Route path="" element={<RootLayout />}>
          <Route path="" element={<Home />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      <Route path="/users" element={<ProtectedRoute allowedRoles={['admin', 'hr']} />}>
        <Route path="" element={<RootLayout />}>
          <Route path="" element={<Users />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* admin dashboard */}
      <Route path="dashboard" element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="" element={<RootLayout />}>
          <Route path="" element={<Dashboard />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Route>

    </Routes>
  );
};

export default App;
