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

        // 1. Check hardcoded users first
        if (email === 'admin@menaharia.com' && password === 'admin123') {
            mockUser = { id: 'u-admin', name: 'System Admin', email, role: 'admin' };
        } else if (email === 'op@selambus.com' && password === 'op123') {
            mockUser = { id: 'u-op', name: 'Selam Bus Ops', email, role: 'operator', operatorId: 'OP-001' };
        } else if (email === 'user@example.com' && password === 'user123') {
            mockUser = { id: 'u-1', name: 'Abebe Kebede', email, role: 'traveller' };
        }

        // 2. If not found in hardcoded, check localStorage "database"
        if (!mockUser) {
            const usersDb = JSON.parse(localStorage.getItem('menaharia_users_db') || '[]');
            const foundUser = usersDb.find(u => u.email === email && u.password === password);
            if (foundUser) {
                // Return user without password
                const { password: _, ...safeUser } = foundUser;
                mockUser = safeUser;
            }
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

        // Save to "database"
        const usersDb = JSON.parse(localStorage.getItem('menaharia_users_db') || '[]');
        usersDb.push(newUser);
        localStorage.setItem('menaharia_users_db', JSON.stringify(usersDb));

        // Auto-login after signup
        // Remove password from session user for better practice, though essentially mocked here
        const { password: _, ...safeUser } = newUser;
        setUser(safeUser);
        localStorage.setItem('menaharia_user', JSON.stringify(safeUser));

        return { success: true, message: 'Account created successfully!' };
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
