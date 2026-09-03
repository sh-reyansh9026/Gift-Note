import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set up axios interceptor for subscription expired errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.error === "SUBSCRIPTION_EXPIRED") {
          // Clear auth and redirect to subscription required
          localStorage.removeItem("token");
          setUser(null);
          setSubscriptionStatus(null);
          window.location.href = "/subscription-required";
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSubscriptionStatus(null);
        return;
      }
      setSubscriptionLoading(true);
      const response = await axios.get("/api/subscription/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      setSubscriptionStatus(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      setUser(response.data.seller);
      // Set subscription status to null initially so guard will fetch it
      setSubscriptionStatus(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (businessName, email, password, instagramLink) => {
    try {
      const response = await axios.post("/api/auth/signup", {
        businessName,
        email,
        password,
        instagramLink,
      });
      localStorage.setItem("token", response.data.token);
      setUser(response.data.seller);
      // Set subscription status to null initially so guard will fetch it
      setSubscriptionStatus(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Signup failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSubscriptionStatus(null);
  };

  const loginWithToken = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      await fetchUser();
      await fetchSubscriptionStatus();
    }
  };

  const updateUser = (updatedUser) => {
    setUser((currentUser) => ({ ...currentUser, ...updatedUser }));
  };

  const value = {
    user,
    loading,
    subscriptionStatus,
    subscriptionLoading,
    fetchSubscriptionStatus,
    login,
    signup,
    logout,
    updateUser,
    loginWithToken,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
