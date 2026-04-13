import Link from "next/link";

export default function TenantNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Site Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The site you&apos;re looking for doesn&apos;t exist or hasn&apos;t been
          set up yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          Go to Endexly
        </Link>
      </div>
    </div>
  );
}
