import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Save token to localStorage
      localStorage.setItem("token", token);
      // Fetch user data using the token
      loginWithToken()
        .then(() => {
          navigate("/dashboard");
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          navigate("/login?error=oauth_failed");
        });
    } else {
      // No token found, redirect to login with error

      navigate("/login?error=oauth_failed");
    }
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-[#0f1b2d] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
}

export default OAuthSuccess;
