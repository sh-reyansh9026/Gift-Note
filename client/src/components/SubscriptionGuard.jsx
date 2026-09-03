import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import PageLoader from "./PageLoader.jsx";

const SubscriptionGuard = ({ children }) => {
  const {
    user,
    loading,
    subscriptionStatus,
    subscriptionLoading,
    fetchSubscriptionStatus,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch subscription status if user is authenticated and we haven't fetched yet
    if (user && !subscriptionStatus && !subscriptionLoading) {
      fetchSubscriptionStatus();
    }
  }, [user, subscriptionStatus, subscriptionLoading, fetchSubscriptionStatus]);

  useEffect(() => {
    // Redirect to subscription required page if subscription is not active or doesn't exist
    if (subscriptionStatus && subscriptionStatus.status !== "active") {
      navigate("/subscription-required", { replace: true });
    }
  }, [subscriptionStatus, navigate]);

  // Wait for the token-based user restoration before deciding whether to redirect.
  if (loading) {
    return <PageLoader />;
  }

  // If no user, don't block - let auth routes handle it
  if (!user) {
    return children;
  }

  // Show loader while checking subscription
  if (subscriptionLoading) {
    return <PageLoader />;
  }

  // If we have subscription status and it's active, render children
  if (subscriptionStatus && subscriptionStatus.status === "active") {
    return children;
  }

  // If subscription status exists but is not active, the useEffect will handle redirect
  // Return null briefly to allow the redirect to happen
  if (subscriptionStatus) {
    return null;
  }

  // If no subscription status yet, show loader
  return <PageLoader />;
};

export default SubscriptionGuard;
