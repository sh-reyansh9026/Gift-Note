import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { SUBSCRIPTION_PLANS } from "../config/subscription.js";
import PageLoader from "../components/PageLoader.jsx";
import Spinner from "../components/Spinner.jsx";

const AdminUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activating, setActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [newEndDate, setNewEndDate] = useState(null);

  // Activation form state
  const [selectedPlan, setSelectedPlan] = useState("1_month");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    fetchUserDetails();
  }, [isAdmin, navigate, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
      setError("");
    } catch (error) {
      setError("Failed to fetch user details");
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateSubscription = async (e) => {
    e.preventDefault();
    try {
      setActivating(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/admin/users/${userId}/activate`,
        {
          plan: selectedPlan,
          amount: parseFloat(amount),
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setNewEndDate(response.data.subscription.endDate);
      setActivationSuccess(true);

      // Refresh user details after activation
      setTimeout(() => {
        fetchUserDetails();
        setActivationSuccess(false);
        setNewEndDate(null);
        setAmount("");
        setNotes("");
      }, 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to activate subscription";
      setError(errorMessage);
      console.error(
        "Error activating subscription:",
        error.response?.data || error,
      );
    } finally {
      setActivating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      none: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.none}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <button
            onClick={() => navigate("/admin")}
            className="mt-4 text-[#0f1b2d] hover:text-[#52637a]"
          >
            Back to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="text-[#0f1b2d] hover:text-[#52637a] mb-4 inline-block"
            >
              ← Back to Users
            </button>
            <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {activationSuccess && newEndDate && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500">
            <p className="text-green-700">
              Subscription activated successfully! New end date:{" "}
              {formatDate(newEndDate)}
            </p>
          </div>
        )}

        {/* User Information */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              User Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Business Name
                </p>
                <p className="mt-1 text-lg text-gray-900">
                  {userData.user.businessName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-lg text-gray-900">
                  {userData.user.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Instagram</p>
                <p className="mt-1 text-lg text-gray-900">
                  {userData.user.instagramLink || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Member Since
                </p>
                <p className="mt-1 text-lg text-gray-900">
                  {formatDate(userData.user.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="mt-1">
                  {userData.user.isAdmin ? (
                    <span className="px-2 py-1 bg-[#e9edf2] text-[#0f1b2d] text-xs rounded-full">
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      User
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Subscription */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Current Subscription
            </h2>
          </div>
          <div className="p-6">
            {userData.subscription ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Plan</p>
                  <p className="mt-1 text-lg text-gray-900">
                    {userData.subscription.plan.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1">
                    {getStatusBadge(userData.subscription.status)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="mt-1 text-lg text-gray-900">
                    {formatDate(userData.subscription.endDate)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No active subscription</p>
            )}
          </div>
        </div>

        {/* Activate/Renew Subscription */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Activate/Renew Subscription
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleActivateSubscription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Plan
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter amount received"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Add any notes about this payment"
                />
              </div>

              <button
                type="submit"
                disabled={activating}
                className="w-full px-6 py-3 bg-[#0f1b2d] text-white rounded-lg hover:bg-[#172a45] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {activating ? (
                  <>
                    <Spinner />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  "Confirm & Activate"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userData.payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No payment history
                    </td>
                  </tr>
                ) : (
                  userData.payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.plan.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.subscriptionStartDate)} -{" "}
                        {formatDate(payment.subscriptionEndDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.verifiedBy
                          ? payment.verifiedBy.businessName
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {payment.notes || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
