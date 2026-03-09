import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import PitchCard from "./PitchCard.jsx";
import api from "../api.js";
import "../styles/PitchList.css";

const CATEGORIES = [
  "all",
  "FinTech",
  "HealthTech",
  "EdTech",
  "GreenTech",
  "AI/ML",
  "SaaS",
  "E-Commerce",
  "Social Media",
  "Gaming",
  "FoodTech",
  "Logistics",
  "Real Estate",
];

function PitchList() {
  const [pitches, setPitches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12, sort };
    if (category !== "all") params.category = category;
    if (search) params.search = search;

    api
      .getPitches(params)
      .then((data) => {
        setPitches(data.pitches);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, category, sort, search]);

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  return (
    <div className="pitch-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Browse Startups</h1>
          <p>{total} pitches in the tank</p>
        </div>

        <div className="pitch-filters">
          <input
            type="text"
            placeholder="Search pitches..."
            value={search}
            onChange={handleSearch}
          />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="funding">Most Funded</option>
            <option value="votes">Most Votes</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state loading-pulse">Loading pitches...</div>
        ) : pitches.length === 0 ? (
          <div className="empty-state">
            <h3>No pitches found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className="pitch-grid">
              {pitches.map((pitch) => (
                <PitchCard key={pitch._id} pitch={pitch} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

PitchList.propTypes = {
  user: PropTypes.object,
};

export default PitchList;
