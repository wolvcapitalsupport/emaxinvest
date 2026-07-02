import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { supabase, base44 } from "@/api/base44Client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const loadUser = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const u = await base44.auth.me();
      setUser(u);
      setIsAuthenticated(!!u);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(error);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        setAuthChecked(true);
        return;
      }

      // Re-resolve via base44.auth.me() so the UserProfile.role fallback
      // (used for admins without auth metadata) is not skipped.
      loadUser();
    });

    return () => listener.subscription.unsubscribe();
  }, [loadUser]);

  const checkUserAuth = async () => {
    await loadUser();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authChecked,
        authError,
        checkUserAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
