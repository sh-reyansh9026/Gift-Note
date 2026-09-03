import { Link } from "react-router-dom";
import { SUBSCRIPTION_PLANS, CONTACT_INFO } from "../config/subscription.js";

const SubscriptionRequired = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center p-4">
      <div className="w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Subscription Required
          </h1>
          <p className="text-xl text-gray-600">
            Choose a plan to unlock all features and start creating beautiful
            gift messages
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#e6e2df] hover:border-[#0f1b2d] transition-all duration-300 hover:shadow-xl"
            >
              <h3 className="text-2xl font-bold text-[#0f1b2d] mb-2">
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-800">
                  ₹{plan.price}
                </span>
                <span className="text-gray-500">/{plan.duration}</span>
              </div>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <a
                href={CONTACT_INFO.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors duration-200"
              >
                Subscribe via WhatsApp
              </a>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            How to Subscribe
          </h2>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#e9edf2] rounded-full flex items-center justify-center">
                <span className="text-[#0f1b2d] font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Choose Your Plan
                </h3>
                <p className="text-gray-600">
                  Select the subscription plan that works best for you from the
                  options above.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#e9edf2] rounded-full flex items-center justify-center">
                <span className="text-[#0f1b2d] font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Contact Us</h3>
                <p className="text-gray-600">
                  Reach out to us via WhatsApp or Instagram to complete your
                  payment. We accept UPI payments for quick and secure
                  transactions.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#e9edf2] rounded-full flex items-center justify-center">
                <span className="text-[#0f1b2d] font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Get Activated
                </h3>
                <p className="text-gray-600">
                  Once payment is confirmed, your subscription will be activated
                  immediately and you can start using all features.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Contact Information
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={CONTACT_INFO.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp: {CONTACT_INFO.whatsapp.display}</span>
              </a>

              <a
                href={CONTACT_INFO.instagram.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-[#0f1b2d] hover:bg-[#172a45] text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram: {CONTACT_INFO.instagram.handle}</span>
              </a>

              <a
                href={CONTACT_INFO.email.link}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Email: {CONTACT_INFO.email.address}</span>
              </a>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-[#0f1b2d] hover:text-[#52637a] font-medium"
            >
              Already have a subscription? Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequired;
