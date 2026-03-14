import { useState } from "react";
import PropTypes from "prop-types";
import api from "../api.js";
import "../styles/Profile.css";

function Profile({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    displayName: user.displayName,
    strategy: user.strategy || "",
    riskPreference: user.riskPreference || "moderate",
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile(form);
      setUser(updated);
      setEditing(false);
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
  }

  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const available = user.budget - user.totalInvested;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>My Profile</h1>
        </div>

        <div className="card fade-in" style={{ marginBottom: "24px" }}>
          <div className="profile-header">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <h2>{user.displayName}</h2>
              <p>@{user.username}</p>
              <div className="profile-badges">
                <span
                  className={`badge ${
                    user.riskPreference === "aggressive"
                      ? "badge-pink"
                      : user.riskPreference === "moderate"
                        ? "badge-amber"
                        : "badge-green"
                  }`}
                >
                  {user.riskPreference}
                </span>
                <span className="badge badge-cyan">
                  ${available.toLocaleString()} available
                </span>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: "20px" }}>
            <div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Total Budget</span>
                <span
                  className="sidebar-stat-value"
                  style={{ color: "var(--accent-cyan)" }}
                >
                  ${user.budget.toLocaleString()}
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Total Invested</span>
                <span
                  className="sidebar-stat-value"
                  style={{ color: "var(--accent-pink)" }}
                >
                  ${user.totalInvested.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Total Returns</span>
                <span
                  className="sidebar-stat-value"
                  style={{ color: "var(--accent-green)" }}
                >
                  ${user.totalReturns.toLocaleString()}
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Successful Picks</span>
                <span className="sidebar-stat-value">{user.successfulPicks}</span>
              </div>
            </div>
          </div>

          {user.strategy && (
            <div style={{ marginBottom: "20px" }}>
              <div
                className="sidebar-stat-label"
                style={{ marginBottom: "6px", fontSize: "0.85rem" }}
              >
                Investment Strategy
              </div>
              <p style={{ color: "var(--text-secondary)" }}>{user.strategy}</p>
            </div>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {editing && (
          <div className="card profile-edit-form fade-in">
            <h3 className="pitch-section-title">Edit Profile</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="edit-displayName">Display Name</label>
                <input
                  id="edit-displayName"
                  name="displayName"
                  type="text"
                  value={form.displayName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-strategy">Investment Strategy</label>
                <textarea
                  id="edit-strategy"
                  name="strategy"
                  value={form.strategy}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your investing approach..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-risk">Risk Preference</label>
                <select
                  id="edit-risk"
                  name="riskPreference"
                  value={form.riskPreference}
                  onChange={handleChange}
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

Profile.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    strategy: PropTypes.string,
    riskPreference: PropTypes.string,
    budget: PropTypes.number.isRequired,
    totalInvested: PropTypes.number.isRequired,
    totalReturns: PropTypes.number.isRequired,
    successfulPicks: PropTypes.number.isRequired,
  }).isRequired,
  setUser: PropTypes.func.isRequired,
};

export default Profile;
