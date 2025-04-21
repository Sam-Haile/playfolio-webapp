import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // ✅ Now it exists!

const Spinner = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="w-8 h-8 border-4 border-primaryPurple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return  <Spinner />; // Optionally, you can show a loading spinner here
    if (!user) return <Navigate to="/signup" replace />;
    
    return children;
};

export default ProtectedRoute;
