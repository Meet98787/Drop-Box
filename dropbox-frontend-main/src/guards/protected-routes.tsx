import { getUserProfile } from "@/api/auth";
import { AuthContext, AuthContextType } from "@/context/AuthContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState < boolean | null > (null);
  const [userRole, setUserRole] = useState < string | null > (null);

  const { setUser } = useContext(AuthContext) as AuthContextType;

  const fetchUser = useCallback(
    async () => {
      try {
        const profile = await getUserProfile(); // Fetch the user profile from API
        setUser(profile); // Set user
        setIsAuthenticated(true);
        setUserRole(profile?.role); // Set user role
      } catch (error) {
        setIsAuthenticated(false);
      }
    }, [setUser, userRole])


  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isAuthenticated === null) return <div>Loading...</div>;


  // Check if the current user role matches the allowed roles for the route
  if (!allowedRoles.includes(userRole!)) {
    return <Navigate to="/" />; // Redirect to home if not authorized
  }

  return <Outlet />; // Render the children routes if authorized
};

export default ProtectedRoute;
