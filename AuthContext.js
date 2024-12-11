import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const [loginError, setLoginError] = useState('');

    const login = async (email, password) => {
        try {
            const response = await fetch('http://177.44.248.17:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('Status:', response.status);

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                // Login bem-sucedido
                setIsAuthenticated(true);
                setAuthToken(data.token);
                setLoginError('');
                // Salvar o token no armazenamento local para persistência
                await AsyncStorage.setItem('authToken', data.token);
                return true;
            } else {
                // Exibe erro de autenticação
                setLoginError(data.errors?.email?.[0] || 'Erro de login. Verifique as credenciais.');
                return false;
            }
        } catch (error) {
            setLoginError('Erro ao conectar à API.');
            return false;
        }
    };

    const logout = async () => {
        setIsAuthenticated(false);
        setAuthToken(null);
        await AsyncStorage.removeItem('authToken');
    };

    const loadToken = async () => {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
            setIsAuthenticated(true);
            setAuthToken(storedToken);
        }
    };

    React.useEffect(() => {
        loadToken();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loginError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
