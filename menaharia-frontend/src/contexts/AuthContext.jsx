import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved user on mount
        // const savedUser = localStorage.getItem('menaharia_user');
        // if (savedUser) {
        //     setUser(JSON.parse(savedUser));
        // }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        // Simulation of login logic
        // Mocking role detection based on email for testing
        let mockUser = null;

        if (email === 'admin@menaharia.com' && password === 'admin123') {
            mockUser = { id: 'u-admin', name: 'System Admin', email, role: 'admin' };
        } else if (email === 'op@selambus.com' && password === 'op123') {
            mockUser = { id: 'u-op', name: 'Selam Bus Ops', email, role: 'operator' };
        } else if (email === 'user@example.com' && password === 'user123') {
            mockUser = { id: 'u-1', name: 'Abebe Kebede', email, role: 'traveller' };
        }

        if (mockUser) {
            setUser(mockUser);
            localStorage.setItem('menaharia_user', JSON.stringify(mockUser));
            return { success: true, user: mockUser };
        } else {
            return { success: false, message: 'Invalid email or password' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('menaharia_user');
    };

    const signup = async (userData) => {
        // Simulation of registration
        const newUser = {
            id: `u-${Math.floor(Math.random() * 1000)}`,
            ...userData,
            role: 'traveller' // Default role for new signups
        };
        // In a real app, this would be a POST request
        return { success: true, message: 'Account created successfully! Please sign in.' };
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
