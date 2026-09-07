import { createContext, useEffect, useState } from "react";
import { api } from "../lib/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const data = await api.login(credentials);
    setUser(data.user);
  }

  async function register(details) {
    const data = await api.register(details);
    setUser(data.user);
  }

  async function logout() {
    await api.logout();
    setUser(null);
  }

  async function updatePreferences(preferences) {
    const data = await api.updatePreferences(preferences);
    setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updatePreferences }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth } from "../hooks/useAuth";

