import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getSites,
  getSummary,
  updateSite,
  deleteSite,
} from "../services/api";

import type { Site, Summary } from "../types";

import SiteForm from "../components/SiteForm";
import InstallationSection from "../components/InstallationSection";

const Dashboard = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Edit state
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editStatus, setEditStatus] = useState("Planned");
  const [editCreatedBy, setEditCreatedBy] = useState("");

  const [updating, setUpdating] = useState(false);

  // Reference for edit form
  const editSiteFormRef = useRef<HTMLDivElement | null>(null);

  // Refresh summary
  const refreshSummary = async () => {
    try {
      const response = await getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error("Summary refresh error:", error);
    }
  };

  // Load dashboard
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [sitesResponse, summaryResponse] =
          await Promise.all([
            getSites(),
            getSummary(),
          ]);

        setSites(sitesResponse.data);
        setSummary(summaryResponse.data);
      } catch (error) {
        console.error("Dashboard loading error:", error);

        setError(
          "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Scroll to edit form when editing starts
  useEffect(() => {
    if (editingSite) {
      editSiteFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [editingSite]);

  // Filter sites
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        site.name
          .toLowerCase()
          .includes(searchText) ||
        site.location
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        site.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    sites,
    search,
    statusFilter,
  ]);

  // Start editing
  const handleEdit = (site: Site) => {
    setEditingSite(site);

    setEditName(site.name);
    setEditLocation(site.location);
    setEditStatus(site.status);

    setEditCreatedBy(
      site.created_by !== null
        ? String(site.created_by)
        : ""
    );
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSite(null);

    setEditName("");
    setEditLocation("");
    setEditStatus("Planned");
    setEditCreatedBy("");
  };

  // Update site
  const handleUpdateSite = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!editingSite) {
      return;
    }

    if (
      !editName.trim() ||
      !editLocation.trim()
    ) {
      alert(
        "Site name and location are required."
      );

      return;
    }

    try {
      setUpdating(true);

      const response = await updateSite(
        editingSite.id,
        {
          name: editName.trim(),
          location: editLocation.trim(),
          status: editStatus,
          created_by: editCreatedBy
            ? Number(editCreatedBy)
            : null,
        }
      );

      // Update site in UI
      setSites((currentSites) =>
        currentSites.map((site) =>
          site.id === editingSite.id
            ? {
                ...site,
                ...response.data,
              }
            : site
        )
      );

      // Refresh dashboard summary
      await refreshSummary();

      alert(
        "Site updated successfully."
      );

      // Close edit form
      handleCancelEdit();
    } catch (error) {
      console.error(
        "Update site error:",
        error
      );

      alert(
        "Failed to update site."
      );
    } finally {
      setUpdating(false);
    }
  };

  // Delete site
  const handleDelete = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this site?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSite(id);

      setSites((currentSites) =>
        currentSites.filter(
          (site) => site.id !== id
        )
      );

      // Refresh summary after delete
      await refreshSummary();

      alert(
        "Site deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete site error:",
        error
      );

      alert(
        "Failed to delete site."
      );
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="page-message">
        Loading dashboard...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="page-message error">
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1>
            Site Operations Dashboard
          </h1>

          <p>
            Monitor sites and installation
            activities.
          </p>
        </div>
      </div>

      {/* Summary */}
     {/* Summary */}
{summary && (
  <div className="summary-grid">

    <div className="summary-card">
      <h3>Total Sites</h3>
      <strong>{summary.totalSites}</strong>
    </div>

    <div className="summary-card">
      <h3>Active Sites</h3>
      <strong>{summary.activeSites}</strong>
    </div>

    <div className="summary-card">
      <h3>Planned Sites</h3>
      <strong>{summary.plannedSites}</strong>
    </div>

    <div className="summary-card">
      <h3>Completed Sites</h3>
      <strong>{summary.completedSites}</strong>
    </div>

    <div className="summary-card">
      <h3>Total Installations</h3>
      <strong>
        {summary.totalInstallations}
      </strong>
    </div>

    <div className="summary-card">
      <h3>Pending Installations</h3>
      <strong>
        {summary.pendingInstallations}
      </strong>
    </div>

    <div className="summary-card">
      <h3>In Progress Installations</h3>
      <strong>
        {summary.inProgressInstallations}
      </strong>
    </div>

    <div className="summary-card">
      <h3>Completed Installations</h3>
      <strong>
        {summary.completedInstallations}
      </strong>
    </div>

  </div>
)}

      {/* Add Site */}
      <SiteForm
        onSiteCreated={(newSite) => {
          setSites((currentSites) => [
            newSite,
            ...currentSites,
          ]);
        }}
      />

      {/* Edit Site */}
      {editingSite && (
        <div
          className="form-card"
          ref={editSiteFormRef}
        >
          <h2>Edit Site</h2>

          <form
            onSubmit={handleUpdateSite}
          >
            <div className="form-grid">

              {/* Site Name */}
              <div className="form-group">
                <label>
                  Site Name
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(
                      e.target.value
                    )
                  }
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label>
                  Location
                </label>

                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) =>
                    setEditLocation(
                      e.target.value
                    )
                  }
                />
              </div>

              {/* Status */}
              <div className="form-group">
                <label>
                  Status
                </label>

                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(
                      e.target.value
                    )
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
                <label>
                  Created By
                </label>

                <select
                  value={editCreatedBy}
                  onChange={(e) =>
                    setEditCreatedBy(
                      e.target.value
                    )
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

            {/* Update */}
            <button
              type="submit"
              disabled={updating}
            >
              {updating
                ? "Updating..."
                : "Update Site"}
            </button>

            {/* Cancel */}
            <button
              type="button"
              className="secondary-button"
              onClick={
                handleCancelEdit
              }
            >
              Cancel
            </button>

          </form>
        </div>
      )}

      {/* Sites */}
      <div className="sites-section">

        <div className="section-header">

          <div>
            <h2>Sites</h2>

            <span>
              {filteredSites.length} sites
            </span>
          </div>

          <div className="filters">

            <input
              type="text"
              placeholder="Search site or location..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Planned">
                Planned
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>

          </div>
        </div>

        {/* Sites Table */}
        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Site Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredSites.length > 0 ? (

                filteredSites.map(
                  (site) => (
                    <tr key={site.id}>

                      <td>
                        {site.id}
                      </td>

                      <td>
                        {site.name}
                      </td>

                      <td>
                        {site.location}
                      </td>

                      <td>
                        {site.status}
                      </td>

                      <td>
                        {site.created_by_name ||
                          "N/A"}
                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              handleEdit(
                                site
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                site.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign:
                        "center",
                    }}
                  >
                    No sites found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Installations */}
      <InstallationSection
        onSummaryRefresh={
          refreshSummary
        }
      />

    </div>
  );
};

export default Dashboard;