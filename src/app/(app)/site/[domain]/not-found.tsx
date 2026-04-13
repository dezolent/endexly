import Link from "next/link";

export default function TenantNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <p className="text-7xl font-bold text-gray-200 mb-6">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-8">
          This page doesn&apos;t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
