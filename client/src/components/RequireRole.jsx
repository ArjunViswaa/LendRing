import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function RequireRole({ role, children }) {
    const { user } = useAuth();

    if (user.role !== role) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

export default RequireRole;