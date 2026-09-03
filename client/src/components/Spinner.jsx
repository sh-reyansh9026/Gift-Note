export default function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-4",
    xl: "w-12 h-12 border-4",
  };

  return (
    <div
      className={`animate-spin rounded-full border-gray-300 border-t-[#0f1b2d] ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
