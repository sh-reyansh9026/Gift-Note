import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import ButtonLoading from "../components/ButtonLoading.jsx";
import Skeleton from "../components/Skeleton.jsx";

// Configure axios with base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || "";
const api = axios.create({
  baseURL: API_URL,
});

const EMPTY_PROFILE = {
  _id: "",
  name: "",
  businessName: "",
  email: "",
  logo: "",
  instagramLink: "",
  whatsappNumber: "",
  accentColor: "#7c3aed",
  oauthProvider: null,
  subscription: {
    status: "none",
    hasSubscription: false,
    plan: null,
    startDate: null,
    endDate: null,
    isActive: false,
    daysRemaining: 0,
  },
};

const planLabels = {
  "1_month": "1 Month Plan",
  "3_months": "3 Months Plan",
  "1_year": "1 Year Plan",
};

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPlanLabel(plan) {
  return planLabels[plan] || plan || "No Plan";
}

function getStatusStyles(status) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700 border border-green-200";
    case "expired":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
}

function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser, getAuthHeaders } =
    useAuth();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    instagramLink: "",
    whatsappNumber: "",
    accentColor: "#7c3aed",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/seller/profile", {
        headers: await getAuthHeaders(),
      });

      const nextProfile = response.data;
      setProfile(nextProfile);
      setForm({
        name: nextProfile.name || "",
        businessName: nextProfile.businessName || "",
        instagramLink: nextProfile.instagramLink || "",
        whatsappNumber: nextProfile.whatsappNumber || "",
        accentColor: nextProfile.accentColor || "#7c3aed",
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to load profile info.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setSaving(true);

    try {
      const response = await api.put("/api/seller/profile", form, {
        headers: await getAuthHeaders(),
      });

      setProfile((prev) => ({
        ...prev,
        ...response.data.seller,
        subscription: prev.subscription,
      }));
      setForm({
        name: response.data.seller.name || "",
        businessName: response.data.seller.businessName || "",
        instagramLink: response.data.seller.instagramLink || "",
        whatsappNumber: response.data.seller.whatsappNumber || "",
        accentColor: response.data.seller.accentColor || "#7c3aed",
      });
      updateUser({
        businessName: response.data.seller.businessName,
        name: response.data.seller.name,
      });
      setSuccessMessage("Profile updated successfully");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to save profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);
    setLogoLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await api.put("/api/seller/profile/logo", formData, {
        headers: {
          ...(await getAuthHeaders()),
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile((prev) => ({
        ...prev,
        logo: response.data.logo,
      }));
      setSuccessMessage("Business logo updated successfully");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to upload logo");
    } finally {
      setLogoLoading(false);
      event.target.value = "";
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setSuccessMessage("");
    setPasswordLoading(true);

    try {
      await api.put("/api/seller/password", passwordForm, {
        headers: await getAuthHeaders(),
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setSuccessMessage("Password changed successfully");
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Failed to update password",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f3] px-4 py-8">
        <div className="w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-2xl shadow-sm p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-12 w-full mb-3" />
                <Skeleton className="h-12 w-full mb-3" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isGoogleUser = profile.oauthProvider === "google";
  const subscriptionStatus = profile.subscription?.status || "none";
  const isActiveSubscription = profile.subscription?.isActive;

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#1b2135]">
      <header className="border-b border-[#e6e2df] bg-[#f5f5f3]">
        <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-[1.7rem] font-medium tracking-[-0.06em] text-[#1b2135]"
            >
              GIFT NOTE
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/create")}
                className="hidden rounded-lg bg-[#0f1b2d] px-4 py-2.5 text-[0.8rem] font-medium uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(15,27,45,0.14)] transition hover:bg-[#172a45] sm:inline-flex"
              >
                Create New Gift Message
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#d9d1cf] bg-gradient-to-br from-[#f5d9d7] via-[#efe5de] to-[#dfe7ee] shadow-sm transition hover:scale-[1.02]"
                aria-label="Go to dashboard"
              >
                <span className="text-sm font-semibold text-[#2d2c3a]">
                  {user?.businessName?.charAt(0)?.toUpperCase() || "L"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-medium tracking-[-0.06em] text-[#1b2135] lg:text-[4rem]">
              Profile
            </h1>
            <p className="mt-2 text-[1.05rem] text-[#5c5c5c]">
              Manage your account and business details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center rounded-xl border border-[#2a2b2f] bg-transparent px-5 py-3 text-[0.9rem] font-medium text-[#1b2135] transition hover:bg-white"
          >
            Dashboard
          </button>
        </div>

        <div className="border-b border-[#2b2a2d]" />

        {(successMessage || errorMessage) && (
          <div
            className={`mt-8 rounded-xl border px-4 py-3 ${successMessage ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}
          >
            {successMessage || errorMessage}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
          <div className="space-y-6">
            <section className="rounded-[1.5rem] border border-[#e9e2df] bg-[#f8f7f6] p-5 shadow-[0_4px_12px_rgba(15,27,45,0.03)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-[1.05rem] font-medium text-[#1b2135]">
                  Account Info
                </h2>
                {isGoogleUser && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe8f4] bg-[#edf4ff] px-2.5 py-1 text-[0.72rem] font-medium text-[#4668a6]">
                    <span className="text-[0.7rem]">◌</span>
                    Signed in with Google
                  </span>
                )}
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="mb-2 block text-[0.72rem] font-medium uppercase tracking-[0.13em] text-[#5c5c5c]">
                    Seller Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleProfileFieldChange}
                    className="w-full rounded-lg border border-[#dfe2e5] bg-white px-3 py-2.5 text-[0.97rem] text-[#1b2135] outline-none transition focus:border-[#8aa5c5] focus:ring-2 focus:ring-[#eaf1fb]"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[0.72rem] font-medium uppercase tracking-[0.13em] text-[#5c5c5c]">
                    Email
                  </label>
                  <input
                    value={profile.email || ""}
                    readOnly
                    className="w-full rounded-lg border border-[#e5e5e5] bg-[#f1f3f5] px-3 py-2.5 text-[0.96rem] text-[#6a6f7a]"
                  />
                </div>

                <ButtonLoading
                  type="submit"
                  loading={saving}
                  className="w-full rounded-xl bg-[#0f1b2d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172a45]"
                >
                  Save account info
                </ButtonLoading>
              </form>
            </section>

            <section className="rounded-[1.5rem] border border-[#e9e2df] bg-[#f8f7f6] p-5 shadow-[0_4px_12px_rgba(15,27,45,0.03)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-[1.05rem] font-medium text-[#1b2135]">
                  Subscription Status
                </h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.72rem] font-semibold capitalize ${getStatusStyles(subscriptionStatus)}`}
                >
                  {subscriptionStatus === "none"
                    ? "No Subscription"
                    : subscriptionStatus}
                </span>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => navigate("/subscription-required")}
                  className="w-full rounded-xl bg-[#0f1b2d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172a45]"
                >
                  Renew Subscription
                </button>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#f2f0ee] p-3.5">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#5c5c5c]">
                      Plan
                    </p>
                    <p className="mt-2 text-[0.96rem] font-medium text-[#1b2135]">
                      {formatPlanLabel(profile.subscription?.plan)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#f2f0ee] p-3.5">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#5c5c5c]">
                      Status
                    </p>
                    <p className="mt-2 text-[0.96rem] font-medium text-[#1b2135]">
                      {subscriptionStatus === "none"
                        ? "No Subscription"
                        : subscriptionStatus === "active"
                          ? "Active"
                          : "Expired"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#f2f0ee] p-3.5">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#5c5c5c]">
                      Start Date
                    </p>
                    <p className="mt-2 text-[0.9rem] text-[#1b2135]">
                      {formatDate(profile.subscription?.startDate)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#f2f0ee] p-3.5">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#5c5c5c]">
                      End Date
                    </p>
                    <p className="mt-2 text-[0.9rem] text-[#1b2135]">
                      {formatDate(profile.subscription?.endDate)}
                    </p>
                  </div>
                </div>

                {subscriptionStatus === "active" && (
                  <p className="text-sm text-[#4b5a6d]">
                    {profile.subscription?.daysRemaining || 0} days remaining
                  </p>
                )}

                {subscriptionStatus !== "active" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Your subscription has expired — contact us to renew
                    <a
                      href="/subscription-required"
                      className="ml-2 font-semibold underline"
                    >
                      Review options
                    </a>
                  </div>
                )}
              </div>
            </section>

            {!isGoogleUser && (
              <section className="rounded-[1.5rem] border border-[#e9e2df] bg-[#f8f7f6] p-5 shadow-[0_4px_12px_rgba(15,27,45,0.03)]">
                <h2 className="mb-5 text-[1.05rem] font-medium text-[#1b2135]">
                  Change Password
                </h2>

                {passwordError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[0.72rem] font-medium uppercase tracking-[0.13em] text-[#5c5c5c]">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#dfe2e5] bg-white px-3 py-2.5 outline-none transition focus:border-[#8aa5c5] focus:ring-2 focus:ring-[#eaf1fb]"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[0.72rem] font-medium uppercase tracking-[0.13em] text-[#5c5c5c]">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#dfe2e5] bg-white px-3 py-2.5 outline-none transition focus:border-[#8aa5c5] focus:ring-2 focus:ring-[#eaf1fb]"
                      placeholder="New password"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[0.72rem] font-medium uppercase tracking-[0.13em] text-[#5c5c5c]">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmNewPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmNewPassword: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#dfe2e5] bg-white px-3 py-2.5 outline-none transition focus:border-[#8aa5c5] focus:ring-2 focus:ring-[#eaf1fb]"
                      placeholder="Confirm password"
                    />
                  </div>

                  <ButtonLoading
                    type="submit"
                    loading={passwordLoading}
                    className="w-full rounded-lg border border-[#dfe2e5] bg-white px-4 py-3 text-sm font-semibold text-[#1b2135] transition hover:bg-[#f2f4f5]"
                  >
                    Update password
                  </ButtonLoading>
                </form>
              </section>
            )}
          </div>

          <section className="rounded-[1.5rem] border border-[#e9e2df] bg-[#f8f7f6] p-5 shadow-[0_4px_12px_rgba(15,27,45,0.03)]">
            <h2 className="mb-5 text-[1.05rem] font-medium text-[#1b2135]">
              Business Details
            </h2>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="mb-2 block text-[0.72rem] font-medium uppercase tracking-[0.13em] text-[#5c5c5c]">
                  Business Name
                </label>
                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleProfileFieldChange}
                  className="w-full rounded-lg border border-[#dfe2e5] bg-white px-3 py-2.5 text-[0.97rem] text-[#1b2135] outline-none transition focus:border-[#8aa5c5] focus:ring-2 focus:ring-[#eaf1fb]"
                  placeholder="Your business name"
                />
              </div>

              <div>
                <label className="mb-2 block text-[0.72rem] font-medium uppercase tracking-[0.13em] text-[#5c5c5c]">
                  Business Logo
                </label>
                <div className="flex items-center gap-4 rounded-xl border border-[#dfe2e5] bg-[#f2f0ee] p-3">
                  {profile.logo ? (
                    <img
                      src={profile.logo}
                      alt="Business logo"
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#dfe2e5] text-sm font-medium text-[#4f5868]">
                      A
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="block w-full cursor-pointer rounded-lg border border-[#dfe2e5] bg-[#f7f7f7] px-3 py-2 text-sm text-[#1b2135] transition hover:bg-white">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-base">+</span>
                        Choose File
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-[0.72rem] text-[#5c5c5c]">
                      Recommended: square image, under 5MB
                    </p>
                  </div>
                </div>
                {logoLoading && (
                  <p className="mt-2 text-sm text-[#4d5c76]">
                    Uploading logo...
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[0.72rem] font-medium uppercase tracking-[0.13em] text-[#5c5c5c]">
                    Instagram Handle / Link
                  </label>
                  <input
                    name="instagramLink"
                    value={form.instagramLink}
                    onChange={handleProfileFieldChange}
                    className="w-full rounded-lg border border-[#dfe2e5] bg-white px-3 py-2.5 text-[0.97rem] text-[#1b2135] outline-none transition focus:border-[#8aa5c5] focus:ring-2 focus:ring-[#eaf1fb]"
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[0.72rem] font-medium uppercase tracking-[0.13em] text-[#5c5c5c]">
                    WhatsApp / Contact Number
                  </label>
                  <input
                    name="whatsappNumber"
                    value={form.whatsappNumber}
                    onChange={handleProfileFieldChange}
                    className="w-full rounded-lg border border-[#dfe2e5] bg-white px-3 py-2.5 text-[0.97rem] text-[#1b2135] outline-none transition focus:border-[#8aa5c5] focus:ring-2 focus:ring-[#eaf1fb]"
                    placeholder="+1 555 123 4567"
                  />
                </div>
              </div>

              <ButtonLoading
                type="submit"
                loading={saving}
                className="w-full rounded-xl bg-[#0f1b2d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172a45]"
              >
                Save business details
              </ButtonLoading>
            </form>
          </section>
        </div>

        <section className="mt-8 rounded-[1.5rem] border border-[#e9e2df] bg-[#f8f7f6] p-4 shadow-[0_4px_12px_rgba(15,27,45,0.03)]">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[1rem] font-medium text-[#1b2135]">
                Sign out of your account
              </p>
              <p className="text-sm text-[#5c5c5c]">
                You can sign back in anytime.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[#dfe2e5] bg-white px-4 py-2.5 text-sm font-semibold text-[#1b2135] transition hover:bg-[#f5f5f3]"
            >
              Logout
            </button>
          </div>
        </section>
      </main>

      <footer className="mt-10 border-t border-[#e6e2df] bg-[#f5f5f3]">
        <div className="mx-auto flex max-w-[1260px] flex-col gap-4 px-4 py-6 text-sm text-[#4c4f5d] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-[1.35rem] font-medium tracking-[-0.06em] text-[#1b2135]"
          >
            GIFT NOTE
          </button>

          <div className="text-[0.7rem] uppercase tracking-[0.12em] text-[#4d4d4d]">
            © 2026 GIFT NOTE. ALL RIGHTS RESERVED.
          </div>

          {/* <div className="flex flex-wrap items-center gap-5 text-[0.7rem] uppercase tracking-[0.12em] text-[#4d4d4d]">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Contact Us</span>
          </div> */}
        </div>
      </footer>
    </div>
  );
}

export default Profile;
