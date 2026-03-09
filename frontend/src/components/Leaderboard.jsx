import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import "../styles/Leaderboard.css";

function Leaderboard() {
  const [tab, setTab] = useState("startups");
  const [pitches, setPitches] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (tab === "startups") {
      api
        .getLeaderboard()
        .then(setPitches)
        .finally(() => setLoading(false));
    } else {
      api
        .getInvestorLeaderboard()
        .then(setInvestors)
        .finally(() => setLoading(false));
    }
  }, [tab]);

  return (
    <div className="leaderboard-page">
      <div className="container">
        <div className="page-header">
          <h1>Leaderboard</h1>
          <p>Top startups and investors in the tank</p>
        </div>

        <div className="leaderboard-tabs">
          <button
            className={`leaderboard-tab ${tab === "startups" ? "active" : ""}`}
            onClick={() => setTab("startups")}
          >
            Top Startups
          </button>
          <button
            className={`leaderboard-tab ${tab === "investors" ? "active" : ""}`}
            onClick={() => setTab("investors")}
          >
            Top Investors
          </button>
        </div>

        {loading ? (
          <div className="empty-state loading-pulse">Loading...</div>
        ) : tab === "startups" ? (
          <div className="card fade-in">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Startup</th>
                  <th>Category</th>
                  <th>Funding</th>
                  <th>Fund Votes</th>
                  <th>Approval</th>
                </tr>
              </thead>
              <tbody>
                {pitches.map((pitch, i) => {
                  const approval =
                    pitch.fundVotes + pitch.passVotes > 0
                      ? (
                          (pitch.fundVotes /
                            (pitch.fundVotes + pitch.passVotes)) *
                          100
                        ).toFixed(0)
                      : 0;
                  return (
                    <tr key={pitch._id}>
                      <td className={`rank-cell ${i < 3 ? "top-3" : ""}`}>
                        #{i + 1}
                      </td>
                      <td>
                        <Link
                          to={`/pitches/${pitch._id}`}
                          className="leader-name"
                        >
                          {pitch.name}
                        </Link>
                      </td>
                      <td>
                        <span className="badge badge-cyan">
                          {pitch.category}
                        </span>
                      </td>
                      <td className="leader-value" style={{ color: "var(--accent-cyan)" }}>
                        ${pitch.totalFunding.toLocaleString()}
                      </td>
                      <td className="leader-value" style={{ color: "var(--accent-green)" }}>
                        {pitch.fundVotes}
                      </td>
                      <td className="leader-value">{approval}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card fade-in">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Investor</th>
                  <th>Strategy</th>
                  <th>Total Returns</th>
                  <th>Picks</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((inv, i) => (
                  <tr key={inv._id}>
                    <td className={`rank-cell ${i < 3 ? "top-3" : ""}`}>
                      #{i + 1}
                    </td>
                    <td>
                      <Link
                        to={`/users/${inv._id}`}
                        className="leader-name"
                      >
                        {inv.displayName}
                      </Link>
                    </td>
                    <td
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {inv.strategy || "No strategy set"}
                    </td>
                    <td className="leader-value" style={{ color: "var(--accent-green)" }}>
                      ${inv.totalReturns.toLocaleString()}
                    </td>
                    <td className="leader-value">{inv.successfulPicks}</td>
                    <td>
                      <span
                        className={`badge ${
                          inv.riskPreference === "aggressive"
                            ? "badge-pink"
                            : inv.riskPreference === "moderate"
                            ? "badge-amber"
                            : "badge-green"
                        }`}
                      >
                        {inv.riskPreference}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
