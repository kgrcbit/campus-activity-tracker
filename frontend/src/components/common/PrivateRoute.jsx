import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import BaseLayout from '../layout/BaseLayout'; 

const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Renders the BaseLayout wrapper, and the requested child route (e.g., DashboardPage) 
  return isAuthenticated ? (
    <BaseLayout>
      <Outlet /> 
    </BaseLayout>
  ) : (
    // If not authenticated, redirect to the login page
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;