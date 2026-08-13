// A small reusable loading spinner. `size` controls its diameter (Tailwind
// width/height class), used anywhere we're waiting on data or a redirect.
export default function Spinner({ size = "h-8 w-8", className = "" }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${size} ${className} animate-spin rounded-full border-4 border-gray-200 border-t-red-600`}
    />
  );
}
