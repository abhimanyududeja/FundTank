import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api.js";
import "../styles/Profile.css";

function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getUser(id), api.getUserInvestments(id)])
      .then(([userData, invData]) => {
        setProfile(userData);
        setInvestments(invData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className="empty-state loading-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>User not found</h3>
        </div>
      </div>
    );
  }

  const initials = profile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>Investor Profile</h1>
        </div>

        <div className="card fade-in" style={{ marginBottom: "24px" }}>
          <div className="profile-header">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <h2>{profile.displayName}</h2>
              <p>@{profile.username}</p>
              <div className="profile-badges">
                <span
                  className={`badge ${
                    profile.riskPreference === "aggressive"
                      ? "badge-pink"
                      : profile.riskPreference === "moderate"
                        ? "badge-amber"
                        : "badge-green"
                  }`}
                >
                  {profile.riskPreference}
                </span>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: "20px" }}>
            <div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Total Invested</span>
                <span
                  className="sidebar-stat-value"
                  style={{ color: "var(--accent-pink)" }}
                >
                  ${profile.totalInvested.toLocaleString()}
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Total Returns</span>
                <span
                  className="sidebar-stat-value"
                  style={{ color: "var(--accent-green)" }}
                >
                  ${profile.totalReturns.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Successful Picks</span>
                <span className="sidebar-stat-value">{profile.successfulPicks}</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Member Since</span>
                <span className="sidebar-stat-value" style={{ fontSize: "0.85rem" }}>
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {profile.strategy && (
            <div>
              <div
                className="sidebar-stat-label"
                style={{ marginBottom: "6px", fontSize: "0.85rem" }}
              >
                Investment Strategy
              </div>
              <p style={{ color: "var(--text-secondary)" }}>{profile.strategy}</p>
            </div>
          )}
        </div>

        <h3 className="pitch-section-title" style={{ marginBottom: "16px" }}>
          Portfolio ({investments.length} investments)
        </h3>

        {investments.length > 0 ? (
          <div className="investment-list">
            {investments.map((inv) => (
              <div className="card investment-item fade-in" key={inv._id}>
                <div className="investment-info">
                  <Link to={`/pitches/${inv.pitchId}`} className="investment-name">
                    {inv.pitchName}
                  </Link>
                  <div className="investment-meta">
                    {inv.notes ||
                      `Invested ${new Date(inv.createdAt).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="investment-amounts">
                  <div className="investment-amount">${inv.amount.toLocaleString()}</div>
                  <div className="investment-return">
                    Est: ${inv.estimatedReturn.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No investments yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
