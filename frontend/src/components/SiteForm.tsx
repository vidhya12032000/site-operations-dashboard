import { useState } from "react";
import { createSite } from "../services/api";
import type { Site } from "../types";

interface SiteFormProps {
  onSiteCreated: (site: Site) => void;
}

const SiteForm = ({ onSiteCreated }: SiteFormProps) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Planned");
  const [createdBy, setCreatedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !location.trim()) {
      setMessage("Site name and location are required.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response = await createSite({
        name: name.trim(),
        location: location.trim(),
        status,
        created_by: createdBy ? Number(createdBy) : null,
      });

      onSiteCreated(response.data);

      setName("");
      setLocation("");
      setStatus("Planned");
      setCreatedBy("");

      setMessage("Site created successfully.");
    } catch (error) {
      console.error("Create site error:", error);
      setMessage("Failed to create site.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Add New Site</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Site Name</label>
            <input
              type="text"
              value={name}
              placeholder="Enter site name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={location}
              placeholder="Enter location"
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Created By</label>
            <select
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
            >
              <option value="">Select user</option>
              <option value="1">Arun Kumar</option>
              <option value="2">Priya Sharma</option>
              <option value="3">Rahul Raj</option>
              <option value="4">Divya S</option>
              <option value="5">Karthik M</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Add Site"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
};

export default SiteForm;