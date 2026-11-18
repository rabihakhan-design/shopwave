import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sw_auth'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) localStorage.setItem('sw_auth', JSON.stringify(auth));
    else localStorage.removeItem('sw_auth');
  }, [auth]);

  // Get a new access token with the refresh token (POST /auth/refresh).
  const refresh = async () => {
    if (!auth?.refreshToken) throw new Error('No refresh token');
    const d = await api.refreshSession(auth.refreshToken);
    setAuth((a) => ({ ...a, accessToken: d.accessToken, refreshToken: d.refreshToken || a.refreshToken }));
    return d.accessToken;
  };

  // Runs fn(token). If the token expired, refreshes once and retries; otherwise logs the user out.
  const withAuth = async (fn) => {
    try {
      return await fn(auth.accessToken);
    } catch (e) {
      if (e.status !== 401 && e.status !== 403) throw e;
      try {
        return await fn(await refresh());
      } catch {
        setAuth(null);
        throw new Error('Your session expired. Please log in again.');
      }
    }
  };

  // Validate a stored session once on startup.
  useEffect(() => {
    if (!auth) return;
    withAuth(api.getMe).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    setAuth(data);
    return data;
  };
  const logout = () => setAuth(null);

  return (
    <AuthContext.Provider value={{ user: auth, token: auth?.accessToken, login, logout, withAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
