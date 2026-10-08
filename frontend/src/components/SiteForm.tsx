import { useEffect, useState } from "react";

import {
  createSite,
  updateSite,
} from "../services/api";

import type { Site } from "../types";

interface SiteFormProps {
  onSiteCreated: (site: Site) => void;
  editingSite?: Site | null;
  onSiteUpdated?: (site: Site) => void;
  onCancelEdit?: () => void;
}

const SiteForm = ({
  onSiteCreated,
  editingSite = null,
  onSiteUpdated,
  onCancelEdit,
}: SiteFormProps) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Planned");
  const [createdBy, setCreatedBy] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (editingSite) {
      setName(editingSite.name);
      setLocation(editingSite.location);
      setStatus(editingSite.status);

      setCreatedBy(
        editingSite.created_by !== null &&
          editingSite.created_by !== undefined
          ? String(editingSite.created_by)
          : ""
      );

      setMessage("");
    } else {
      setName("");
      setLocation("");
      setStatus("Planned");
      setCreatedBy("");
      setMessage("");
    }
  }, [editingSite]);

  const resetForm = () => {
    setName("");
    setLocation("");
    setStatus("Planned");
    setCreatedBy("");
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!name.trim() || !location.trim()) {
      setMessage(
        "Site name and location are required."
      );
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const data = {
        name: name.trim(),
        location: location.trim(),
        status,
        created_by: createdBy
          ? Number(createdBy)
          : null,
      };

      // EDIT
      if (editingSite) {
        const response = await updateSite(
          editingSite.id,
          data
        );

        if (onSiteUpdated) {
          onSiteUpdated(response.data);
        }

        setMessage(
          "Site updated successfully."
        );

        return;
      }

      // CREATE
      const response = await createSite(data);

      onSiteCreated(response.data);

      resetForm();

      setMessage(
        "Site created successfully."
      );
    } catch (error) {
      console.error(
        "Site form error:",
        error
      );

      setMessage(
        editingSite
          ? "Failed to update site."
          : "Failed to create site."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card">

      <h2>
        {editingSite
          ? "Edit Site"
          : "Add New Site"}
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="form-grid">

          {/* Site Name */}
          <div className="form-group">
            <label>Site Name</label>

            <input
              type="text"
              placeholder="Enter site name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Location</label>

            <input
              type="text"
              placeholder="Enter site location"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            />
          </div>

          {/* Status */}
          <div className="form-group">
            <label>Status</label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option value="Planned">
                Planned
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>
          </div>

          {/* Created By */}
          <div className="form-group">
            <label>Created By</label>

            <select
              value={createdBy}
              onChange={(e) =>
                setCreatedBy(e.target.value)
              }
            >
              <option value="">
                Select user
              </option>

              <option value="1">
                Arun Kumar
              </option>

              <option value="2">
                Priya Sharma
              </option>

              <option value="3">
                Rahul Raj
              </option>

              <option value="4">
                Divya S
              </option>

              <option value="5">
                Karthik M
              </option>
            </select>
          </div>

        </div>

        <div className="form-actions">

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? editingSite
                ? "Updating..."
                : "Creating..."
              : editingSite
              ? "Update Site"
              : "Add Site"}
          </button>

          {editingSite && (
            <button
              type="button"
              className="secondary-button"
              onClick={onCancelEdit}
              disabled={submitting}
            >
              Cancel
            </button>
          )}

        </div>

        {message && (
          <p className="form-message">
            {message}
          </p>
        )}

      </form>

    </div>
  );
};

export default SiteForm;