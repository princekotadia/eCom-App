import { createContext, useContext, useEffect, useState } from "react";
import axiosInstn from "../axiosCalls/axios";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axiosInstn.get("/customers/me")
            .then((res) => {
                setUser(res.data.customer)
            })
            .catch((err) => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    const logout = async () => {
        try {
            await axiosInstn.post("/customers/logout")
        } finally {
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)