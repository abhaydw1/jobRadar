import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function hasNoPreferences(preferences) {
  if (!preferences) return true;
  return (
    preferences.roles.length === 0 &&
    preferences.locations.length === 0 &&
    preferences.experienceLevels.length === 0 &&
    preferences.skills.length === 0
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome, {user?.name}.</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Your job matches will show up here once preferences and ingestion are
        set up.
      </p>

      {hasNoPreferences(user?.preferences) && (
        <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900">
          You haven't set your job preferences yet.{" "}
          <Link to="/preferences" className="font-medium underline">
            Set them now
          </Link>{" "}
          so we know what to look for.
        </div>
      )}
    </div>
  );
}
