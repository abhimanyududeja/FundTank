import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import api from "../api.js";
import "../styles/Auth.css";

function Register({ onLogin }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
    strategy: "",
    riskPreference: "moderate",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.register(form);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card fade-in" style={{ maxWidth: "500px" }}>
        <h1>Join FundTank</h1>
        <p className="auth-subtitle">Start with $100,000 virtual capital to invest</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Jane Doe"
                value={form.displayName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="janedoe"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="strategy">Investment Strategy (optional)</label>
            <textarea
              id="strategy"
              name="strategy"
              placeholder="Describe your investing style..."
              value={form.strategy}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label htmlFor="riskPreference">Risk Preference</label>
            <select
              id="riskPreference"
              name="riskPreference"
              value={form.riskPreference}
              onChange={handleChange}
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

Register.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Register;
