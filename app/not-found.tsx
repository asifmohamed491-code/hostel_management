import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f7fd] px-4 text-center">
      <div className="sa-dashboard-card flex max-w-md flex-col items-center rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
        <h1 className="text-6xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-bold text-heading">Page Not Found</h2>
        <p className="mt-2 text-sm text-heading/55">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glass transition-all hover:bg-primary-dark"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

