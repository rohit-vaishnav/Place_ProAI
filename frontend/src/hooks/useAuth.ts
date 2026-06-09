import { useState, useEffect, useCallback } from "react";
import * as authApi from "../api/auth";
import { AuthUser } from "../api/auth";
import { getToken } from "../api/client";

const USER_KEY = "placely_cur_user";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(!!getToken());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [currentUser]);

  const restoreSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return null;
    }
    try {
      const user = await authApi.getMe();
      setCurrentUser(user);
      setError(null);
      return user;
    } catch {
      authApi.logout();
      setCurrentUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getToken() && !currentUser) {
      restoreSession();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, restoreSession]);

  const login = async (email: string, password: string) => {
    setError(null);
    const { user } = await authApi.login(email, password);
    setCurrentUser(user);
    return user;
  };

  const register = async (payload: Parameters<typeof authApi.register>[0]) => {
    setError(null);
    const { user } = await authApi.register(payload);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
  };

  return {
    currentUser,
    isLoading,
    error,
    setError,
    login,
    register,
    logout,
    restoreSession,
    setCurrentUser,
  };
}
