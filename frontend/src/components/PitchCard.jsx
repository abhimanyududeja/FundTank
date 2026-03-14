import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/PitchCard.css";

const CATEGORY_COLORS = {
  FinTech: "cyan",
  HealthTech: "pink",
  EdTech: "amber",
  GreenTech: "green",
  "AI/ML": "cyan",
  SaaS: "pink",
  "E-Commerce": "amber",
  "Social Media": "green",
  Gaming: "cyan",
  FoodTech: "pink",
  Logistics: "amber",
  "Real Estate": "green",
};

function PitchCard({ pitch, rank }) {
  const navigate = useNavigate();
  const progress = Math.min((pitch.totalFunding / pitch.fundingGoal) * 100, 100);
  const colorClass = CATEGORY_COLORS[pitch.category] || "cyan";

  return (
    <div
      className="card pitch-card fade-in"
      onClick={() => navigate(`/pitches/${pitch._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/pitches/${pitch._id}`);
      }}
    >
      {rank && <div className="pitch-card-rank">#{rank}</div>}
      <span className={`badge badge-${colorClass} pitch-card-category`}>
        {pitch.category}
      </span>
      <h3>{pitch.name}</h3>
      <p className="pitch-card-tagline">{pitch.tagline || pitch.description}</p>

      <div className="pitch-card-stats">
        <div className="pitch-card-stat">
          <span className="pitch-card-stat-value">
            ${pitch.totalFunding.toLocaleString()}
          </span>
          <span className="pitch-card-stat-label">Funded</span>
        </div>
        <div className="pitch-card-stat">
          <span className="pitch-card-stat-value">{pitch.fundVotes}</span>
          <span className="pitch-card-stat-label">Fund Votes</span>
        </div>
        <div className="pitch-card-stat">
          <span className="pitch-card-stat-value">{pitch.passVotes}</span>
          <span className="pitch-card-stat-label">Pass</span>
        </div>
      </div>

      <div className="pitch-card-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="pitch-card-author">by {pitch.authorName}</div>
    </div>
  );
}

PitchCard.propTypes = {
  pitch: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    tagline: PropTypes.string,
    category: PropTypes.string.isRequired,
    totalFunding: PropTypes.number.isRequired,
    fundingGoal: PropTypes.number.isRequired,
    fundVotes: PropTypes.number.isRequired,
    passVotes: PropTypes.number.isRequired,
    authorName: PropTypes.string.isRequired,
  }).isRequired,
  rank: PropTypes.number,
};

export default PitchCard;
