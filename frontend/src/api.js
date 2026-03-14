const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("fundtank_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

const api = {
  // Auth
  register: (body) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request("/auth/me"),

  // Pitches
  getPitches: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/pitches?${query}`);
  },
  getPitch: (id) => request(`/pitches/${id}`),
  createPitch: (body) =>
    request("/pitches", { method: "POST", body: JSON.stringify(body) }),
  updatePitch: (id, body) =>
    request(`/pitches/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deletePitch: (id) => request(`/pitches/${id}`, { method: "DELETE" }),
  votePitch: (id, vote) =>
    request(`/pitches/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ vote }),
    }),
  getLeaderboard: () => request("/pitches/leaderboard"),

  // Investments
  getMyInvestments: () => request("/investments"),
  getUserInvestments: (userId) => request(`/investments/user/${userId}`),
  getInvestment: (id) => request(`/investments/${id}`),
  createInvestment: (body) =>
    request("/investments", { method: "POST", body: JSON.stringify(body) }),
  updateInvestment: (id, body) =>
    request(`/investments/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteInvestment: (id) => request(`/investments/${id}`, { method: "DELETE" }),
  getAnalytics: () => request("/investments/analytics/summary"),

  // Users
  getUser: (id) => request(`/users/${id}`),
  updateProfile: (body) =>
    request("/users/profile", { method: "PUT", body: JSON.stringify(body) }),
  getInvestorLeaderboard: () => request("/users/leaderboard"),

  // Comments
  getComments: (pitchId) => request(`/comments/pitch/${pitchId}`),
  createComment: (body) =>
    request("/comments", { method: "POST", body: JSON.stringify(body) }),
  updateComment: (id, body) =>
    request(`/comments/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteComment: (id) => request(`/comments/${id}`, { method: "DELETE" }),
};

export default api;
