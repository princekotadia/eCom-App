import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return <h1>Loading...</h1>
    }

    if (user) {
        return <Navigate to="/home" replace />
    }

    return children
}

export default PublicRoute