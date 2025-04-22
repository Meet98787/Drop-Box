import { logoutUser } from "@/api/auth";
import { createContext, ReactNode, useState } from "react";

interface User {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "hr" | "user";
    createdAt: string;
}

export interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

// Define props for AuthProvider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext < AuthContextType > ({user: null, setUser: () => {}, logout: () => {}});

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState < User | null > (null)

    // useEffect(() => {
    //     if (user) {
    //         localStorage.setItem('userId', user._id);
    //         localStorage.setItem('info', user.role)
    //     }
    // }, [user])

    const logout = async () => {
        const success = await logoutUser();
        if (success) {
          setUser(null);
          window.location.href = "/"; 
        }
      };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
