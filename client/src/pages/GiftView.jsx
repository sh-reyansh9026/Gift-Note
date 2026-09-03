import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AudioPlayer from "../components/AudioPlayer";
import Spinner from "../components/Spinner";

function GiftView() {
  const { slug } = useParams();
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchGift();
  }, [slug]);

  const fetchGift = async () => {
    try {
      const response = await axios.get(`/api/giftmessages/${slug}`);
      setGift(response.data);
    } catch (error) {
      setError("Gift message not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner
            size="xl"
            className="mx-auto mb-4 border-rose-300 border-t-rose-500"
          />
          <p className="text-gray-600 font-medium">Opening your gift...</p>
        </div>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 text-center max-w-md border border-white/50">
          <div className="text-6xl mb-4">💐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3 font-['Inter']">
            Gift Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This gift message could not be found. It may have been deleted or
            the link might be incorrect.
          </p>
        </div>
      </div>
    );
  }

  const seller = gift.sellerId;
  const shouldShowReadMore = gift.message && gift.message.length > 180;
  const messagePreview = shouldShowReadMore
    ? `${gift.message.slice(0, 180).trim()}...`
    : gift.message;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-rose-200/30 rounded-full blur-3xl" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl" />

      {/* Main Content Container */}
      <div
        className={`relative z-10 w-full max-w-5xl mx-auto px-4 py-2 sm:py-6 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Business Branding Header */}
        <div className="text-center mb-4 px-2">
          {seller.logo && (
            <img
              src={seller.logo}
              alt={seller.businessName}
              className="w-16 h-16 rounded-full mx-auto mb-3 object-cover shadow-lg border-4 border-white"
            />
          )}
          <p className="text-rose-600 font-medium text-sm tracking-wide uppercase mb-1">
            A gift from
          </p>
          <h1 className="text-2xl font-bold text-gray-800 font-['Inter'] break-words">
            {seller.businessName}
          </h1>
        </div>

        {/* Gift Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-10 border border-white/60 w-full overflow-hidden">
          {/* Recipient Heading */}
          <div className="text-center mb-8 px-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 font-['Inter'] break-words">
              A message for {gift.recipientName}
            </h2>
            <p className="text-gray-500 font-medium break-words">
              From {gift.senderName}
            </p>
          </div>

          {(gift.photoUrl || gift.message) && (
            <div className="mb-8 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center">
              {/* Polaroid Photo */}
              {gift.photoUrl && (
                <div className="flex justify-center px-2">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="bg-white p-3 sm:p-4 rounded-lg shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300 w-full max-w-md mx-auto md:max-w-none text-left"
                  >
                    <img
                      src={gift.photoUrl}
                      alt="Gift photo"
                      className="w-full h-auto max-h-[420px] object-contain rounded"
                    />
                  </button>
                </div>
              )}

              {/* Message Card with Handwritten Font */}
              {gift.message && (
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 sm:p-6 shadow-inner border border-rose-100 overflow-hidden min-h-[220px] flex flex-col justify-center">
                  <p className="text-xl sm:text-2xl lg:text-3xl text-gray-800 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere font-['Caveat'] w-full line-clamp-3">
                    {messagePreview}
                  </p>

                  {shouldShowReadMore && (
                    <button
                      type="button"
                      onClick={() => setShowMessageModal(true)}
                      className="mt-4 inline-flex self-start items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-rose-600"
                    >
                      Read more
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Custom Audio Player */}
          {gift.audioUrl && (
            <div className="mb-8">
              <AudioPlayer src={gift.audioUrl} />
            </div>
          )}

          {/* Shop More Button */}
          {seller.instagramLink && (
            <div className="text-center">
              <a
                href={seller.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-['Inter']"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Shop more from {seller.businessName}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm font-['Inter']">
          <p>Created with 💝 using GiftNote</p>
        </div>
      </div>

      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-gray-800 font-['Inter']">
                Full message
              </h3>
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-4 sm:p-6">
              <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere text-lg leading-relaxed text-gray-800 font-['Caveat'] sm:text-2xl">
                {gift.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {showImageModal && gift.photoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-4 shadow-2xl sm:p-5">
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
            >
              Close
            </button>
            <img
              src={gift.photoUrl}
              alt="Gift photo enlarged"
              className="max-h-[80vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GiftView;
