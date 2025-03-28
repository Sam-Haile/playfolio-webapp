import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // ✅ Now it exists!

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <p className="text-center text-white">Loading...</p>;
    if (!user) return <Navigate to="/signup" replace />;
    
    return children;
};

export default ProtectedRoute;
