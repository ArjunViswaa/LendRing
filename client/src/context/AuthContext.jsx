import { createContext, useState } from 'react';
import * as authApi from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    function saveSession(token, loggedInUser) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
    }

    async function login(email, password) {
        const { token, user: loggedInUser } = await authApi.login(email, password);
        saveSession(token, loggedInUser);
        return loggedInUser;
    }

    async function register(details) {
        const { token, user: newUser } = await authApi.register(details);
        saveSession(token, newUser);
        return newUser;
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}