import { addMonths } from "date-fns";

/**
 * Calculate new end date for subscription renewal
 * @param {Object} existingSubscription - Existing subscription object with endDate
 * @param {Number} planDurationInMonths - Number of months to add
 * @param {Date} currentDate - Current date (defaults to new Date())
 * @returns {Date} New end date
 */
export function calculateNewEndDate(
  existingSubscription,
  planDurationInMonths,
  currentDate = new Date(),
) {
  // If existing subscription exists and is still active (endDate > current date)
  if (
    existingSubscription &&
    existingSubscription.endDate &&
    new Date(existingSubscription.endDate) > currentDate
  ) {
    // Extend from the existing future expiry
    return addMonths(
      new Date(existingSubscription.endDate),
      planDurationInMonths,
    );
  } else {
    // No subscription or expired - start fresh from today
    return addMonths(currentDate, planDurationInMonths);
  }
}

/**
 * Check if subscription is currently active
 * @param {Object} subscription - Subscription object with endDate
 * @returns {Boolean} True if subscription is active
 */
export function isSubscriptionActive(subscription) {
  if (!subscription || !subscription.endDate) {
    return false;
  }
  return new Date(subscription.endDate) > new Date();
}

/**
 * Return the shared backend status object for a seller subscription
 * @param {Object|null} subscription
 * @returns {{hasSubscription:boolean, status:'active'|'expired'|'none', plan:string|null, startDate:Date|null, endDate:Date|null, isActive:boolean, daysRemaining:number}}
 */
export function getSubscriptionStatus(subscription, currentDate = new Date()) {
  if (!subscription || !subscription.endDate) {
    return {
      hasSubscription: false,
      status: "none",
      plan: null,
      startDate: null,
      endDate: null,
      isActive: false,
      daysRemaining: 0,
    };
  }

  const endDate = new Date(subscription.endDate);
  const isActive = endDate > currentDate;
  const daysRemaining = isActive
    ? Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    hasSubscription: true,
    status: isActive ? "active" : "expired",
    plan: subscription.plan || null,
    startDate: subscription.startDate ? new Date(subscription.startDate) : null,
    endDate,
    isActive,
    daysRemaining,
  };
}
