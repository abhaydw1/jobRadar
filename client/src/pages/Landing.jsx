import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="flex flex-col items-center gap-6 py-16 text-center">
      <h1 className="text-3xl font-semibold sm:text-4xl">
        Stop checking career pages every day.
      </h1>
      <p className="max-w-xl text-gray-600 dark:text-gray-400">
        JobRadar watches job sources for you and tells you when something new
        and relevant to you shows up.
      </p>
      <div className="flex gap-3">
        <Link
          to="/register"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Get started
        </Link>
        <Link
          to="/login"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Log in
        </Link>
      </div>
    </section>
  );
}
