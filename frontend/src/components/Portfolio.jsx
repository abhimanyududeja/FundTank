// Author: Abhimanyu Dudeja
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import api from "../api.js";
import "../styles/Portfolio.css";

function Portfolio({ user: _user, refreshUser }) {
  const [investments, setInvestments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [invData, analyticsData] = await Promise.all([
        api.getMyInvestments(),
        api.getAnalytics(),
      ]);
      setInvestments(invData);
      setAnalytics(analyticsData);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  function requestWithdraw(investmentId, pitchName) {
    setConfirmModal({
      message: `Withdraw your investment from ${pitchName}?`,
      onConfirm: () => handleWithdraw(investmentId),
    });
  }

  async function handleWithdraw(investmentId) {
    setConfirmModal(null);
    try {
      await api.deleteInvestment(investmentId);
      loadData();
      if (refreshUser) refreshUser();
    } catch {
      // Error
    }
  }

  function startEdit(inv) {
    setEditingId(inv._id);
    setEditNotes(inv.notes || "");
    setEditAmount(inv.amount.toString());
  }

  async function handleUpdate(investmentId) {
    try {
      await api.updateInvestment(investmentId, {
        notes: editNotes,
        amount: editAmount,
      });
      setEditingId(null);
      loadData();
      if (refreshUser) refreshUser();
    } catch {
      // Error
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="empty-state loading-pulse">Loading portfolio...</div>
      </div>
    );
  }

  const maxBarValue = analytics?.categoryBreakdown
    ? Math.max(...Object.values(analytics.categoryBreakdown), 1)
    : 1;

  return (
    <div className="portfolio-page">
      <div className="container">
        <div className="page-header">
          <h1>My Portfolio</h1>
          <p>Track your investments and returns</p>
        </div>

        {analytics && (
          <div className="portfolio-stats">
            <div className="card portfolio-stat-card fade-in">
              <div
                className="portfolio-stat-value"
                style={{ color: "var(--accent-cyan)" }}
              >
                {analytics.totalInvestments}
              </div>
              <div className="portfolio-stat-label">Investments</div>
            </div>
            <div
              className="card portfolio-stat-card fade-in"
              style={{ animationDelay: "0.05s" }}
            >
              <div
                className="portfolio-stat-value"
                style={{ color: "var(--accent-pink)" }}
              >
                ${analytics.totalInvested.toLocaleString()}
              </div>
              <div className="portfolio-stat-label">Invested</div>
            </div>
            <div
              className="card portfolio-stat-card fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div
                className="portfolio-stat-value"
                style={{ color: "var(--accent-green)" }}
              >
                ${analytics.totalEstimatedReturns.toLocaleString()}
              </div>
              <div className="portfolio-stat-label">Est. Returns</div>
            </div>
            <div
              className="card portfolio-stat-card fade-in"
              style={{ animationDelay: "0.15s" }}
            >
              <div
                className="portfolio-stat-value"
                style={{
                  color: analytics.roi > 0 ? "var(--accent-green)" : "var(--accent-red)",
                }}
              >
                {analytics.roi}%
              </div>
              <div className="portfolio-stat-label">ROI</div>
            </div>
          </div>
        )}

        {analytics?.categoryBreakdown &&
          Object.keys(analytics.categoryBreakdown).length > 0 && (
            <div
              className="card portfolio-chart fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <h3 className="pitch-section-title">Investment by Category</h3>
              <div className="chart-bars">
                {Object.entries(analytics.categoryBreakdown).map(([cat, amount]) => (
                  <div className="chart-bar-group" key={cat}>
                    <div className="chart-bar-value">${(amount / 1000).toFixed(1)}K</div>
                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.max((amount / maxBarValue) * 100, 8)}%`,
                      }}
                      title={`${cat}: $${amount.toLocaleString()}`}
                    />
                    <span className="chart-bar-label">{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        <h3 className="pitch-section-title" style={{ marginBottom: "16px" }}>
          Your Investments ({investments.length})
        </h3>

        {investments.length === 0 ? (
          <div className="empty-state">
            <h3>No investments yet</h3>
            <p style={{ marginBottom: "16px" }}>
              Browse pitches and start building your portfolio.
            </p>
            <Link to="/pitches" className="btn btn-primary">
              Browse Pitches
            </Link>
          </div>
        ) : (
          <div className="investment-list">
            {investments.map((inv) => (
              <div className="card investment-item fade-in" key={inv._id}>
                <div className="investment-info">
                  <Link to={`/pitches/${inv.pitchId}`} className="investment-name">
                    {inv.pitchName || inv.pitch?.name || "Unknown Pitch"}
                  </Link>
                  <div className="investment-meta">
                    {inv.notes && <span>{inv.notes}</span>}
                    {!inv.notes && (
                      <span>Invested {new Date(inv.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {editingId === inv._id ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      style={{ width: "100px" }}
                      min="1"
                    />
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notes"
                      style={{ width: "150px" }}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleUpdate(inv._id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="investment-amounts">
                      <div className="investment-amount">
                        ${inv.amount.toLocaleString()}
                      </div>
                      <div className="investment-return" style={{ position: "relative" }}>
                        Est: ${inv.estimatedReturn.toLocaleString()}{" "}
                        <span
                          title={`Your $${inv.amount.toLocaleString()} investment could return $${inv.estimatedReturn.toLocaleString()}. The ${inv.returnMultiplier}x multiplier is based on the startup's approval rate and funding progress.`}
                          style={{ cursor: "help", borderBottom: "1px dotted var(--text-muted)" }}
                        >
                          ({inv.returnMultiplier}x)
                        </span>
                      </div>
                    </div>
                    <div className="investment-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => startEdit(inv)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          requestWithdraw(
                            inv._id,
                            inv.pitchName || inv.pitch?.name || "this pitch"
                          )
                        }
                      >
                        Withdraw
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Withdrawal</h3>
            <p>{confirmModal.message}</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmModal.onConfirm}>
                Withdraw
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirmModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Portfolio.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    budget: PropTypes.number,
    totalInvested: PropTypes.number,
  }).isRequired,
  refreshUser: PropTypes.func,
};

export default Portfolio;
