import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: JSX.Element; admin?: boolean }> = ({
  children,
  admin = false,
}) => {
  const { user, admin: adminUser } = useAuth();

  if (admin && !adminUser) return <Navigate to="/admin/login" replace />;
  if (!admin && !user) return <Navigate to="/login" replace />;

  return children;
};
