export default function Loading() {
  return (
    <div
      className="p-4 flex justify-center"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-6 w-6 border-4 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
