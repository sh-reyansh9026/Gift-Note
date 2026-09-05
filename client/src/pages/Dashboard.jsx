import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";
import Skeleton from "../components/Skeleton.jsx";

function Dashboard() {
  const [giftMessages, setGiftMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    user,
    isAuthenticated,
    isAdmin,
    loading: authLoading,
    getAuthHeaders,
  } = useAuth();
  const navigate = useNavigate();

  // Configure axios with base URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL || "";
  const api = axios.create({
    baseURL: API_URL,
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchGiftMessages();
  }, [authLoading, isAuthenticated, navigate]);

  const fetchGiftMessages = async () => {
    try {
      setError(null);
      const response = await api.get("/api/giftmessages", {
        headers: await getAuthHeaders(),
      });
      setGiftMessages(response.data);
    } catch (error) {
      console.error("Error fetching gift messages:", error);
      setError(
        "Failed to load gift messages. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this gift message?"))
      return;

    try {
      await api.delete(`/api/giftmessages/${id}`, {
        headers: await getAuthHeaders(),
      });
      fetchGiftMessages();
    } catch (error) {
      console.error("Error deleting gift message:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f3]">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="text-2xl font-bold text-gray-800"
                >
                  GiftNote
                </button>
                <p className="text-gray-600 text-sm">{user?.businessName}</p>
              </div>
              <div className="flex gap-4 items-center">
                {isAdmin && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="text-[#0f1b2d] hover:text-[#52637a] font-medium"
                  >
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={() => navigate("/profile")}
                  className="text-[#0f1b2d] hover:text-[#52637a] font-medium"
                >
                  Profile
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Gift Messages
            </h2>
            <Skeleton className="w-48 h-12 rounded-lg" />
          </div>

          {/* Skeleton Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <Skeleton variant="card" />
                <div className="p-5">
                  <Skeleton variant="title" className="mb-3" />
                  <Skeleton variant="text" className="mb-4" />
                  <Skeleton variant="text" className="w-24 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="flex-1 h-10 rounded-lg" />
                    <Skeleton className="w-10 h-10 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#1b2135] flex flex-col">
      <header className="border-b border-[#e6e2df] bg-[#f5f5f3]">
        <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-[1.7rem] font-medium tracking-[-0.05em] font-['Playfair_Display'] text-[#1b2135]"
            >
              GIFT NOTE
            </button>

            <div className="flex items-center gap-4">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="text-sm font-medium text-[#0f1b2d] transition hover:text-[#52637a]"
                >
                  Admin Panel
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#d9d1cf]"
                aria-label="Open profile"
              >
                <div className="h-11 w-11 overflow-hidden rounded-full border border-[#d9d1cf] bg-gradient-to-br from-[#f5d9d7] via-[#efe5de] to-[#dfe7ee] shadow-sm transition hover:scale-[1.02]">
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#2d2c3a]">
                    {user?.businessName?.charAt(0)?.toUpperCase() || "L"}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-5xl font-semibold tracking-[-0.06em] text-[#1b2135] lg:text-[4.2rem] lg:leading-[0.95]">
              Your Gift Messages
            </h2>
            <p className="mt-4 max-w-[42rem] text-lg leading-relaxed text-[#4d4d4d]">
              Manage and review your personalized digital gifts. Each creation
              is securely stored and ready to be shared.
            </p>
          </div>

          <button
            onClick={() => navigate("/create")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f1b2d] px-7 py-4 text-base font-medium text-white shadow-[0_10px_30px_rgba(15,27,45,0.18)] transition hover:bg-[#172a45]"
          >
            <span className="text-2xl leading-none">+</span>
            Create New Gift Message
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center">
            <div className="mb-4 text-red-400">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-800">
              Something went wrong
            </h3>
            <p className="mb-6 text-gray-600">{error}</p>
            <button
              onClick={fetchGiftMessages}
              className="rounded-lg bg-[#0f1b2d] px-6 py-3 font-semibold text-white transition hover:bg-[#172a45]"
            >
              Retry
            </button>
          </div>
        ) : giftMessages.length === 0 ? (
          <div className="rounded-2xl border border-[#e8e2df] bg-[#f3f0ef] p-12 text-center">
            <div className="mb-4 text-[#b7b0ad]">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-800">
              You haven't created any gift messages yet
            </h3>
            <p className="mb-6 text-gray-600">
              Let's create your first one and spread some joy!
            </p>
            <button
              onClick={() => navigate("/create")}
              className="rounded-lg bg-[#0f1b2d] px-6 py-3 font-semibold text-white transition hover:bg-[#172a45]"
            >
              Create Gift Message
            </button>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr_320px]">
            {giftMessages.slice(0, 2).map((gift) => (
              <div
                key={gift._id}
                className="overflow-hidden rounded-[1.5rem] border border-[#e8e2df] bg-[#f7f5f5] shadow-[0_6px_18px_rgba(24,26,32,0.04)]"
              >
                <div className="border-b border-[#e8e2df] bg-[#f3f3f1] p-2">
                  <div className="mb-2 flex items-center gap-1.5 px-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#d8d1cf]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#d8d1cf]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#d8d1cf]" />
                  </div>
                  {gift.photoUrl ? (
                    <div className="overflow-hidden rounded-[0.9rem] bg-[#0b1130] shadow-inner">
                      <img
                        src={gift.photoUrl}
                        alt="Gift"
                        className="h-44 w-full object-contain bg-white"
                      />
                    </div>
                  ) : (
                    <div className="flex h-44 items-center justify-center rounded-[0.9rem] border border-dashed border-[#d5d1cf] bg-[#f0efee] text-[#7d7a78]">
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-[#8a8a8a] shadow-sm">
                          +
                        </div>
                        <p className="text-sm font-medium">No image</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.75rem] uppercase tracking-[0.12em] text-[#7a7a7a]">
                        To:
                      </p>
                      <h3 className="text-[1.2rem] font-medium text-[#1b2135]">
                        {gift.recipientName}
                      </h3>
                    </div>
                    <span className="text-[0.72rem] text-[#7a7a7a]">
                      {formatDate(gift.createdAt)}
                    </span>
                  </div>

                  <p className="text-[0.95rem] text-[#4d4d4d]">
                    From: {gift.senderName}
                  </p>

                  <div className="flex items-center justify-between pt-3">
                    <button
                      onClick={() =>
                        window.open(`/gift/${gift.uniqueSlug}`, "_blank")
                      }
                      className="inline-flex items-center gap-2 text-[0.88rem] font-medium text-[#1b2135]"
                    >
                      <span className="text-base">◌</span>
                      View QR
                    </button>

                    <button
                      onClick={() => handleDelete(gift._id)}
                      className="flex h-10 w-10 items-center justify-center rounded-md border border-[#e4d9d4] bg-[#fff5f3] text-red-500 transition hover:bg-red-50"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => navigate("/create")}
              className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.5rem] border border-[#e8e2df] bg-[#f3f1f0] p-6 text-center shadow-[0_6px_18px_rgba(24,26,32,0.02)] transition hover:bg-[#f0efee]"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#dfe2e5] bg-[#f8f8f8] text-4xl text-[#1b2135]">
                +
              </div>
              <h3 className="text-[1.05rem] font-medium text-[#1b2135]">
                Create New
              </h3>
              <p className="mt-2 max-w-[10rem] text-[0.98rem] leading-relaxed text-[#4d4d4d]">
                Design a new custom gift message for someone special.
              </p>
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-[#e6e2df] bg-[#f5f5f3]">
        <div className="mx-auto flex max-w-[1260px] flex-col gap-4 px-4 py-6 text-sm text-[#4c4f5d] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-[1.35rem] font-medium tracking-[-0.06em] text-[#1b2135]"
          >
            GIFT NOTE
          </button>

          {/* <div className="flex flex-wrap items-center gap-5 text-[#4d4d4d]">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Contact Us</span>
          </div> */}

          <div className="text-[#4d4d4d]">
            © 2026 GIFT NOTE. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
