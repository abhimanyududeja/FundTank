import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import api from "../api.js";
import Comments from "./Comments.jsx";
import "../styles/PitchDetail.css";

function PitchDetail({ user, refreshUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investAmount, setInvestAmount] = useState("");
  const [investNotes, setInvestNotes] = useState("");
  const [investError, setInvestError] = useState("");
  const [investLoading, setInvestLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);

  useEffect(() => {
    api
      .getPitch(id)
      .then((data) => setPitch(data))
      .catch(() => navigate("/pitches"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const isAuthor =
    user && pitch && user._id === pitch.authorId.toString();
  const hasVoted =
    user &&
    pitch &&
    pitch.voters.some((v) => v.userId.toString() === user._id);
  const userVote =
    hasVoted
      ? pitch.voters.find((v) => v.userId.toString() === user._id)?.vote
      : null;

  async function handleVote(vote) {
    if (!user) return navigate("/login");
    setVoteLoading(true);
    try {
      const updated = await api.votePitch(id, vote);
      setPitch(updated);
    } catch {
      // Already voted or error
    } finally {
      setVoteLoading(false);
    }
  }

  async function handleInvest(e) {
    e.preventDefault();
    setInvestError("");
    setInvestLoading(true);
    try {
      await api.createInvestment({
        pitchId: id,
        amount: investAmount,
        notes: investNotes,
      });
      setInvestAmount("");
      setInvestNotes("");
      // Refresh pitch data and user budget
      const updated = await api.getPitch(id);
      setPitch(updated);
      if (refreshUser) refreshUser();
    } catch (err) {
      setInvestError(err.message);
    } finally {
      setInvestLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this pitch? This cannot be undone.")) return;
    try {
      await api.deletePitch(id);
      navigate("/pitches");
    } catch {
      // Error handling
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="empty-state loading-pulse">Loading pitch...</div>
      </div>
    );
  }

  if (!pitch) return null;

  const progress = Math.min(
    (pitch.totalFunding / pitch.fundingGoal) * 100,
    100
  );
  const fundRatio =
    pitch.fundVotes + pitch.passVotes > 0
      ? ((pitch.fundVotes / (pitch.fundVotes + pitch.passVotes)) * 100).toFixed(
          0
        )
      : 50;

  return (
    <div className="pitch-detail">
      <div className="container">
        <div className="pitch-detail-header fade-in">
          <div className="pitch-detail-info">
            <span className="badge badge-cyan">{pitch.category}</span>
            <h1>{pitch.name}</h1>
            {pitch.tagline && (
              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
                {pitch.tagline}
              </p>
            )}
            <div className="pitch-detail-meta">
              <span>
                by{" "}
                <Link to={`/users/${pitch.authorId}`}>
                  {pitch.authorName}
                </Link>
              </span>
              <span>
                {new Date(pitch.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {isAuthor && (
            <div className="pitch-detail-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/pitches/${id}/edit`)}
              >
                Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="pitch-detail-grid">
          <div>
            <div className="card fade-in" style={{ marginBottom: "20px" }}>
              <h3 className="pitch-section-title">About this Startup</h3>
              <p className="pitch-description">{pitch.description}</p>
            </div>

            {pitch.budgetBreakdown &&
              Object.keys(pitch.budgetBreakdown).length > 0 && (
                <div className="card fade-in" style={{ animationDelay: "0.1s" }}>
                  <h3 className="pitch-section-title">Budget Breakdown</h3>
                  {Object.entries(pitch.budgetBreakdown).map(([key, val]) => (
                    <div className="budget-item" key={key}>
                      <span className="budget-item-label">{key}</span>
                      <span className="budget-item-value">
                        ${val.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            <div className="card fade-in" style={{ marginTop: "20px", animationDelay: "0.2s" }}>
              <Comments pitchId={id} user={user} />
            </div>
          </div>

          <div>
            <div
              className="card fade-in"
              style={{ marginBottom: "20px", animationDelay: "0.1s" }}
            >
              <h3 className="pitch-section-title">Funding Stats</h3>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Total Funded</span>
                <span
                  className="sidebar-stat-value"
                  style={{ color: "var(--accent-cyan)" }}
                >
                  ${pitch.totalFunding.toLocaleString()}
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Funding Goal</span>
                <span className="sidebar-stat-value">
                  ${pitch.fundingGoal.toLocaleString()}
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Progress</span>
                <span className="sidebar-stat-value">{progress.toFixed(0)}%</span>
              </div>
              <div style={{ marginTop: "12px" }}>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Fund Votes</span>
                <span
                  className="sidebar-stat-value"
                  style={{ color: "var(--accent-green)" }}
                >
                  {pitch.fundVotes}
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Pass Votes</span>
                <span
                  className="sidebar-stat-value"
                  style={{ color: "var(--accent-red)" }}
                >
                  {pitch.passVotes}
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Approval Rate</span>
                <span className="sidebar-stat-value">{fundRatio}%</span>
              </div>

              {user && !isAuthor && !hasVoted && (
                <div className="vote-buttons">
                  <button
                    className="vote-btn vote-btn-fund"
                    onClick={() => handleVote("fund")}
                    disabled={voteLoading}
                  >
                    Fund
                  </button>
                  <button
                    className="vote-btn vote-btn-pass"
                    onClick={() => handleVote("pass")}
                    disabled={voteLoading}
                  >
                    Pass
                  </button>
                </div>
              )}

              {hasVoted && (
                <div
                  className="voted-badge"
                  style={{
                    background:
                      userVote === "fund"
                        ? "var(--accent-green-dim)"
                        : "rgba(248, 113, 113, 0.1)",
                    color:
                      userVote === "fund"
                        ? "var(--accent-green)"
                        : "var(--accent-red)",
                    width: "100%",
                  }}
                >
                  You voted: {userVote === "fund" ? "Fund" : "Pass"}
                </div>
              )}
            </div>

            {user && !isAuthor && (
              <div
                className="card fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <h3 className="pitch-section-title">Invest in {pitch.name}</h3>
                {investError && (
                  <div className="form-error">{investError}</div>
                )}
                <form className="invest-form" onSubmit={handleInvest}>
                  <div className="form-group">
                    <label htmlFor="invest-amount">Amount ($)</label>
                    <input
                      id="invest-amount"
                      type="number"
                      min="1"
                      placeholder="5000"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="invest-notes">Notes (optional)</label>
                    <textarea
                      id="invest-notes"
                      placeholder="Why are you investing?"
                      value={investNotes}
                      onChange={(e) => setInvestNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={investLoading}
                  >
                    {investLoading ? "Investing..." : "Invest"}
                  </button>
                </form>
              </div>
            )}

            {!user && (
              <div className="card" style={{ textAlign: "center", padding: "28px" }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: "14px" }}>
                  Sign in to vote and invest
                </p>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

PitchDetail.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    displayName: PropTypes.string,
    budget: PropTypes.number,
    totalInvested: PropTypes.number,
  }),
  refreshUser: PropTypes.func,
};

export default PitchDetail;
