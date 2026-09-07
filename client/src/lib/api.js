const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong.");
  }

  return data;
}

export const api = {
  register: (body) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),
  getMe: () => request("/api/users/me"),
  updatePreferences: (preferences) =>
    request("/api/users/me/preferences", {
      method: "PATCH",
      body: JSON.stringify(preferences),
    }),
  // page and limit are optional; server defaults to page=1, limit=50
  getJobs: ({ page = 1, limit = 50 } = {}) =>
    request(`/api/jobs?page=${page}&limit=${limit}`),
  getJob: (id) => request(`/api/jobs/${id}`),
  // Admin endpoints
  getAdminStats: () => request("/api/admin/stats"),
  triggerIngest: () => request("/api/admin/ingest", { method: "POST" }),
};
