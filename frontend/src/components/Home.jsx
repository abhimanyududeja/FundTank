import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import PitchCard from "./PitchCard.jsx";
import api from "../api.js";
import "../styles/Home.css";

function Home({ user }) {
  const [topPitches, setTopPitches] = useState([]);
  const [stats, setStats] = useState({
    pitches: 0,
    investors: 0,
    totalFunding: 0,
    investments: 0,
  });

  useEffect(() => {
    api
      .getLeaderboard()
      .then((data) => {
        setTopPitches(data.slice(0, 3));
        const totalFunding = data.reduce((s, p) => s + p.totalFunding, 0);
        setStats((prev) => ({ ...prev, totalFunding }));
      })
      .catch(() => {});

    api
      .getPitches({ limit: 1 })
      .then((data) => setStats((prev) => ({ ...prev, pitches: data.total })))
      .catch(() => {});

    api
      .getInvestorLeaderboard()
      .then((data) =>
        setStats((prev) => ({
          ...prev,
          investors: data.length,
          investments: data.reduce((s, u) => s + u.successfulPicks, 0),
        }))
      )
      .catch(() => {});
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <span className="hero-badge">Startup Simulation Platform</span>
          <h1>
            Pitch. Invest.
            <br />
            <span className="gradient-text">Dominate the Tank.</span>
          </h1>
          <p className="hero-subtitle">
            Create startup pitches, allocate virtual capital, compete on
            leaderboards. Like Shark Tank meets a stock market simulation.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/pitches/new" className="btn btn-primary">
                  Create a Pitch
                </Link>
                <Link to="/pitches" className="btn btn-secondary">
                  Browse Startups
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/pitches" className="btn btn-secondary">
                  Explore Pitches
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="card stat-card fade-in">
              <div className="stat-value">{stats.pitches}</div>
              <div className="stat-label">Active Pitches</div>
            </div>
            <div
              className="card stat-card fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="stat-value">{stats.investors}</div>
              <div className="stat-label">Investors</div>
            </div>
            <div
              className="card stat-card fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="stat-value">
                ${(stats.totalFunding / 1000).toFixed(0)}K
              </div>
              <div className="stat-label">Total Funded</div>
            </div>
            <div
              className="card stat-card fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="stat-value">{stats.investments}</div>
              <div className="stat-label">Investments Made</div>
            </div>
          </div>
        </div>
      </section>

      {topPitches.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Top Funded Startups</h2>
              <Link to="/leaderboard" className="btn btn-ghost btn-sm">
                View All
              </Link>
            </div>
            <div className="grid-3">
              {topPitches.map((pitch, i) => (
                <PitchCard key={pitch._id} pitch={pitch} rank={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

Home.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    displayName: PropTypes.string,
  }),
};

export default Home;
