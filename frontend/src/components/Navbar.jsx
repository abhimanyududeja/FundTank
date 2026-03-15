// Authors: Abhimanyu Dudeja, Kashish Rahulbhai Khatri
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/Navbar.css";

function Navbar({ user, onLogout }) {
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path ? "nav-link active" : "nav-link";
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">FT</span>
          FundTank
        </Link>

        <div className="navbar-links">
          <Link to="/pitches" className={isActive("/pitches")}>
            Pitches
          </Link>
          <Link to="/leaderboard" className={isActive("/leaderboard")}>
            Leaderboard
          </Link>

          {user ? (
            <>
              <Link to="/pitches/new" className={isActive("/pitches/new")}>
                Create Pitch
              </Link>
              <Link to="/portfolio" className={isActive("/portfolio")}>
                Portfolio
              </Link>
              <Link to="/profile" className={isActive("/profile")}>
                Profile
              </Link>
              <div className="nav-user">
                <span className="nav-budget">
                  ${(user.budget - user.totalInvested).toLocaleString()}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={onLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive("/login")}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    displayName: PropTypes.string,
    budget: PropTypes.number,
    totalInvested: PropTypes.number,
  }),
  onLogout: PropTypes.func.isRequired,
};

export default Navbar;
