import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import api from "../api.js";
import "../styles/PitchForm.css";

const CATEGORIES = [
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

function PitchForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    category: "FinTech",
    fundingGoal: "",
    engineering: "",
    marketing: "",
    operations: "",
    talent: "",
    miscellaneous: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.getPitch(id).then((pitch) => {
        setForm({
          name: pitch.name,
          tagline: pitch.tagline || "",
          description: pitch.description,
          category: pitch.category,
          fundingGoal: pitch.fundingGoal.toString(),
          engineering: pitch.budgetBreakdown?.engineering?.toString() || "",
          marketing: pitch.budgetBreakdown?.marketing?.toString() || "",
          operations: pitch.budgetBreakdown?.operations?.toString() || "",
          talent: pitch.budgetBreakdown?.talent?.toString() || "",
          miscellaneous: pitch.budgetBreakdown?.miscellaneous?.toString() || "",
        });
      });
    }
  }, [id, isEdit]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const budgetBreakdown = {};
    if (form.engineering) budgetBreakdown.engineering = parseInt(form.engineering);
    if (form.marketing) budgetBreakdown.marketing = parseInt(form.marketing);
    if (form.operations) budgetBreakdown.operations = parseInt(form.operations);
    if (form.talent) budgetBreakdown.talent = parseInt(form.talent);
    if (form.miscellaneous) budgetBreakdown.miscellaneous = parseInt(form.miscellaneous);

    const body = {
      name: form.name,
      tagline: form.tagline,
      description: form.description,
      category: form.category,
      fundingGoal: form.fundingGoal,
      budgetBreakdown,
    };

    try {
      if (isEdit) {
        await api.updatePitch(id, body);
        navigate(`/pitches/${id}`);
      } else {
        const pitch = await api.createPitch(body);
        navigate(`/pitches/${pitch._id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pitch-form-page">
      <div className="container">
        <div className="page-header">
          <h1>{isEdit ? "Edit Pitch" : "Create a Pitch"}</h1>
          <p>
            {isEdit
              ? "Update your startup pitch"
              : "Share your startup idea with the community"}
          </p>
        </div>

        <div className="card pitch-form-card fade-in">
          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Startup Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. QuickPay"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tagline">Tagline</label>
              <input
                id="tagline"
                name="tagline"
                type="text"
                placeholder="One-liner that captures your vision"
                value={form.tagline}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your startup, the problem it solves, and your go-to-market strategy..."
                value={form.description}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fundingGoal">Funding Goal ($)</label>
                <input
                  id="fundingGoal"
                  name="fundingGoal"
                  type="number"
                  min="1000"
                  placeholder="100000"
                  value={form.fundingGoal}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Budget Breakdown (optional)</label>
              <div className="budget-fields">
                <div className="form-group">
                  <input
                    name="engineering"
                    type="number"
                    placeholder="Engineering"
                    value={form.engineering}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <input
                    name="marketing"
                    type="number"
                    placeholder="Marketing"
                    value={form.marketing}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <input
                    name="operations"
                    type="number"
                    placeholder="Operations"
                    value={form.operations}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <input
                    name="talent"
                    type="number"
                    placeholder="Talent"
                    value={form.talent}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <input
                    name="miscellaneous"
                    type="number"
                    placeholder="Miscellaneous"
                    value={form.miscellaneous}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Update Pitch" : "Create Pitch"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

PitchForm.propTypes = {
  user: PropTypes.object,
};

export default PitchForm;
