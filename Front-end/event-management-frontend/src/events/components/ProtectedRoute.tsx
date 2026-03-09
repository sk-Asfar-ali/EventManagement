import { Navigate, useLocation } from 'react-router-dom';
import { useAuth,type Role } from '../context/AuthContext';

export default function ProtectedRoute({
  children, allowedRoles,
}: { children: React.ReactNode; allowedRoles?: Role[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return (
    <div className="page-loader">
      <span className="page-loader-ring" />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}