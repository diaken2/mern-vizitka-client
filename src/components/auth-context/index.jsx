import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ⬅️ новое

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false); // ⬅️ после инициализации
  }, []);

  const login = async (username, password) => {
    const res = await fetch('https://mern-vizitka.vercel.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const userData = {
      id: data.userId,
      username: data.username,
      role: data.role,
    };

    setUser(userData);
    setToken('dummy-token'); // можешь заменить на реальный токен, если нужен

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', 'dummy-token');

    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
