import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import ButtonLoading from "../components/ButtonLoading";
import Spinner from "../components/Spinner";

// Configure axios with base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || "";
const api = axios.create({
  baseURL: API_URL,
});

function CreateGift() {
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [audio, setAudio] = useState(null);
  const [audioMode, setAudioMode] = useState("upload"); // 'upload' or 'record'
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAudioProcessing, setIsAudioProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [isQrLoading, setIsQrLoading] = useState(false);
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Photo must be under 5MB");
        return;
      }
      setIsPhotoUploading(true);
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setIsPhotoUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    document.getElementById("photo-upload").value = "";
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Audio must be under 10MB");
        return;
      }
      setAudio(file);
      setRecordedAudio(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioFile = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
        });
        setAudio(audioFile);
        setRecordedAudio(URL.createObjectURL(audioBlob));
        setIsAudioProcessing(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError("Could not access microphone. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsAudioProcessing(true);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const handleRemoveAudio = () => {
    setAudio(null);
    setRecordedAudio(null);
    document.getElementById("audio-upload").value = "";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("recipientName", recipientName);
    formData.append("senderName", senderName);
    formData.append("message", message);
    if (photo) formData.append("photo", photo);
    if (audio) formData.append("audio", audio);

    try {
      const response = await api.post("/api/giftmessages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(await getAuthHeaders()),
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(progress);
        },
      });
      setIsQrLoading(true);
      setQrCode(response.data.qrCodeUrl);
      setIsQrLoading(false);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to create gift message",
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `gift-qr-${recipientName}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f3]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              Create Gift Message
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {qrCode ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-green-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Gift Message Created!
              </h2>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed whitespace-normal break-words">
                Scan this QR code to view the gift message.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 inline-block mb-6 relative">
              {isQrLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                  <Spinner size="lg" />
                </div>
              )}
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleDownloadQR}
                disabled={isQrLoading}
                className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download QR Code
              </button>
              <button
                onClick={() => {
                  setQrCode(null);
                  setRecipientName("");
                  setSenderName("");
                  setMessage("");
                  setPhoto(null);
                  setAudio(null);
                }}
                disabled={isQrLoading}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Another
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              New Gift Message
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Who is this gift for?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sender Name *
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Who is sending this gift?"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={4}
                  placeholder="Write your heartfelt message here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo (Optional)
                </label>
                {photoPreview ? (
                  <div className="relative">
                    {isPhotoUploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                        <Spinner size="lg" />
                      </div>
                    )}
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`cursor-pointer ${loading ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <svg
                        className="w-12 h-12 mx-auto text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-600">Click to upload a photo</p>
                      <p className="text-gray-400 text-sm mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Note (Optional)
                </label>

                {/* Audio Mode Toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setAudioMode("upload")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                      audioMode === "upload"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioMode("record")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                      audioMode === "record"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Record
                  </button>
                </div>

                {audioMode === "upload" ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-500 transition">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioChange}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      {audio ? (
                        <div>
                          <p className="text-gray-800 font-medium">
                            {audio.name}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            Click to change
                          </p>
                        </div>
                      ) : (
                        <div>
                          <svg
                            className="w-12 h-12 mx-auto text-gray-400 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                            />
                          </svg>
                          <p className="text-gray-600">
                            Click to upload a voice note
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            MP3, WAV, M4A up to 10MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {isAudioProcessing ? (
                      <div className="space-y-4">
                        <Spinner size="lg" className="mx-auto" />
                        <p className="text-gray-600">Processing audio...</p>
                      </div>
                    ) : isRecording ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-red-500 font-medium">
                            Recording...
                          </span>
                          <span className="text-gray-600">
                            {formatTime(recordingTime)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition"
                        >
                          Stop Recording
                        </button>
                      </div>
                    ) : recordedAudio ? (
                      <div className="space-y-4">
                        <audio
                          controls
                          src={recordedAudio}
                          className="w-full"
                        />
                        <div className="flex gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setRecordedAudio(null);
                              setAudio(null);
                            }}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition"
                          >
                            Remove
                          </button>
                          <button
                            type="button"
                            onClick={startRecording}
                            className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
                          >
                            Record Again
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startRecording}
                        disabled={loading}
                        className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                        </svg>
                        Start Recording
                      </button>
                    )}
                  </div>
                )}
              </div>

              <ButtonLoading
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadProgress > 0
                  ? `Uploading... ${uploadProgress}%`
                  : "Create Gift Message"}
              </ButtonLoading>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default CreateGift;
