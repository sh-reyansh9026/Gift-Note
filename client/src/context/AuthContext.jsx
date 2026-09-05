import { createContext, useContext, useEffect, useState } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";
const api = axios.create({ baseURL: API_URL, timeout: 15000 });
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const getAuthHeaders = async () => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUser = async () => {
    try {
      const response = await api.get("/api/auth/me", {
        headers: await getAuthHeaders(),
      });
      setUser(response.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) fetchUser();
    else setUser(null);
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.error === "SUBSCRIPTION_EXPIRED") {
          setSubscriptionStatus(null);
          window.location.href = "/subscription-required";
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const fetchSubscriptionStatus = async () => {
    if (!isSignedIn) {
      setSubscriptionStatus(null);
      return;
    }
    try {
      setSubscriptionLoading(true);
      const response = await api.get("/api/subscription/status", {
        headers: await getAuthHeaders(),
      });
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      setSubscriptionStatus(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSubscriptionStatus(null);
    signOut();
  };

  const updateUser = (updatedUser) => {
    setUser((currentUser) => ({ ...currentUser, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: !isLoaded || (isSignedIn && !user),
        subscriptionStatus,
        subscriptionLoading,
        fetchSubscriptionStatus,
        getAuthHeaders,
        logout,
        updateUser,
        isAuthenticated: Boolean(isSignedIn && user),
        isAdmin: user?.isAdmin || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { api };
