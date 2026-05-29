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

    const login = async (emailOrPhone, password) => {
        // Simulation of login logic
        // Mocking role detection based on email/phone for testing
        let mockUser = null;

        // 1. Check hardcoded users first (allow both email and phone)
        const isAdmin = emailOrPhone === 'admin@menaharia.com' || emailOrPhone === '0900000000' || emailOrPhone === '+251900000000';
        const isOperator = emailOrPhone === 'op@selambus.com' || emailOrPhone === '0911111111' || emailOrPhone === '+251911111111';
        const isUser = emailOrPhone === 'user@example.com' || emailOrPhone === '0922222222' || emailOrPhone === '+251922222222';

        if (isAdmin && password === 'admin123') {
            mockUser = { id: 'u-admin', name: 'System Admin', email: 'admin@menaharia.com', phone: '+251900000000', role: 'admin' };
        } else if (isOperator && password === 'op123') {
            mockUser = { id: 'u-op', name: 'Selam Bus Ops', email: 'op@selambus.com', phone: '+251911111111', role: 'operator', operatorId: 'OP-001' };
        } else if (isUser && password === 'user123') {
            mockUser = { id: 'u-1', name: 'Abebe Kebede', email: 'user@example.com', phone: '+251922222222', role: 'traveller' };
        }

        // 2. If not found in hardcoded, check localStorage "database"
        if (!mockUser) {
            const usersDb = JSON.parse(localStorage.getItem('menaharia_users_db') || '[]');
            const foundUser = usersDb.find(u => 
                (u.email === emailOrPhone || u.phone === emailOrPhone) && u.password === password
            );
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
            return { success: false, message: 'Invalid email, phone number, or password' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('menaharia_user');
    };

    const signup = async (userData) => {
        // Simulation of registration
        const usersDb = JSON.parse(localStorage.getItem('menaharia_users_db') || '[]');

        // Check if phone number is already registered
        if (userData.phone) {
            const phoneExists = usersDb.some(u => u.phone === userData.phone);
            if (phoneExists) {
                return { success: false, message: 'This phone number is already registered' };
            }
        }

        // Check if email is already registered (if provided)
        if (userData.email) {
            const emailExists = usersDb.some(u => u.email === userData.email);
            if (emailExists) {
                return { success: false, message: 'This email address is already registered' };
            }
        }

        const newUser = {
            id: `u-${Math.floor(Math.random() * 1000)}`,
            ...userData,
            role: 'traveller' // Default role for new signups
        };

        // Save to "database"
        usersDb.push(newUser);
        localStorage.setItem('menaharia_users_db', JSON.stringify(usersDb));

        // Auto-login after signup
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
