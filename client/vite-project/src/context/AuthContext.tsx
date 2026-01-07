// // client/src/context/AuthContext.js
// import React, { createContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import { backendURL } from '../utils/env';
// import { useNavigate } from 'react-router-dom';

// const API_URL = `${backendURL}/api/auth`;

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {

//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [successMsg, setSuccessMsg] = useState(null); // Add a new state for success message

// // src/context/AuthContext.js
// useEffect(() => {
//   const loadUser = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (token) {
//         const config = {
//           headers: {
//             'Content-Type': 'application/json',
//             'x-auth-token': token,
//           },
//         };

//         const res = await axios.get(`${API_URL}/user`, config);
//         setUser(res.data);
//         setIsAuthenticated(true);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   loadUser();
// }, []);

// // src/context/AuthContext.js
// const login = async (formData) => {
//   try {
//     const res = await axios.post(`${API_URL}/login`, formData);
//     localStorage.setItem('token', res.data.token);
//     setIsAuthenticated(true);
//     setError(null);
//     await loadUser(); // Load user data after successful login
//     navigate('/dashboard');
//   } catch (err) {
//     setError(err.response.data.msg || 'An error occurred during login');
//     console.error('Login error:', err);
//   }
// };

// const register = async (formData) => {
//   try {
//     const res = await axios.post(`${API_URL}/register`, formData);
//     localStorage.setItem('token', res.data.token);
//     setIsAuthenticated(true);
//     setError(null);
//     setSuccessMsg('Registration successful! Redirecting...');
//     await loadUser(); // Load user data after successful registration
//     navigate('/onboarding');
//   } catch (err) {
//     setError(err.response.data.msg || 'An error occurred during registration');
//     console.error('Registration error:', err);
//   }
// };

// const loadUser = async () => {
//   try {
//     const token = localStorage.getItem('token');
//     if (token) {
//       const config = {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-auth-token': token,
//         },
//       };

//       const res = await axios.get(`${API_URL}/user`, config);
//       setUser(res.data);
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//     value={{ user, isAuthenticated, loading, login, register, logout, error, successMsg }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// client/vite-project/src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { backendURL } from '../utils/env';
import { useNavigate } from 'react-router-dom';

const API_URL = `${backendURL}/api/auth`;

// Define types
interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  successMsg: string | null;
  login: (formData: { email: string; password: string }) => Promise<void>;
  register: (formData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  clearSuccessMsg: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  successMsg: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
  clearSuccessMsg: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        };

        const res = await axios.get(`${API_URL}/user`, config);
        setUser(res.data);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Error loading user:', err);
      // If token is invalid, clear it
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData: { email: string; password: string }) => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/login`, formData);
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      await loadUser();
      setSuccessMsg('Login successful! Redirecting...');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.msg || 'An error occurred during login';
      setError(errorMsg);
      console.error('Login error:', err);
      throw err; // Re-throw to allow component to handle if needed
    }
  };

  const register = async (formData: { name: string; email: string; password: string }) => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/register`, formData);
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      await loadUser();
      setSuccessMsg('Registration successful! Redirecting...');
      navigate('/onboarding');
    } catch (err: any) {
      const errorMsg = err.response?.data?.msg || 'An error occurred during registration';
      setError(errorMsg);
      console.error('Registration error:', err);
      throw err; // Re-throw to allow component to handle if needed
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
    setSuccessMsg(null);
    navigate('/');
  };

  const clearError = () => setError(null);
  const clearSuccessMsg = () => setSuccessMsg(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        successMsg,
        login,
        register,
        logout,
        clearError,
        clearSuccessMsg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};