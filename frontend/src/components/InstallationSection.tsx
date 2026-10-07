import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createInstallation,
  getInstallations,
  getSites,
  updateInstallation,
  deleteInstallation,
} from "../services/api";

import type {
  Installation,
  Site,
} from "../types";

const formatDateForInput = (
  date: string | null
) => {
  if (!date) {
    return "";
  }

  return date.slice(0, 10);
};

interface InstallationSectionProps {
  onSummaryRefresh: () => Promise<void>;
}

const InstallationSection = ({
  onSummaryRefresh,
}: InstallationSectionProps) => {

  const [installations, setInstallations] =
    useState<Installation[]>([]);

  const [sites, setSites] =
    useState<Site[]>([]);

  // Form state
  const [siteId, setSiteId] =
    useState("");

  const [installationType, setInstallationType] =
    useState("");

  const [status, setStatus] =
    useState("Pending");

  const [assignedTo, setAssignedTo] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [completionDate, setCompletionDate] =
    useState("");

  // Loading / submit
  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // Edit
  const [editingInstallation, setEditingInstallation] =
    useState<Installation | null>(null);

  const editFormRef =
    useRef<HTMLDivElement | null>(null);

  // Search and filter
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  // Load installations and sites
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          installationResponse,
          sitesResponse,
        ] = await Promise.all([
          getInstallations(),
          getSites(),
        ]);

        setInstallations(
          installationResponse.data
        );

        setSites(
          sitesResponse.data
        );
      } catch (error) {
        console.error(
          "Installation loading error:",
          error
        );

        setMessage(
          "Failed to load installation data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Scroll to Edit form
  useEffect(() => {
    if (editingInstallation) {
      editFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [editingInstallation]);

  // Filter installations
  const filteredInstallations = useMemo(() => {
    return installations.filter(
      (installation) => {

        const searchText =
          search.toLowerCase();

        const matchesSearch =
          installation.site_name
            ?.toLowerCase()
            .includes(searchText) ||

          installation.installation_type
            .toLowerCase()
            .includes(searchText) ||

          installation.assigned_to_name
            ?.toLowerCase()
            .includes(searchText);

        const matchesStatus =
          statusFilter === "All" ||
          installation.status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    installations,
    search,
    statusFilter,
  ]);

  // CREATE
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !siteId ||
      !installationType.trim()
    ) {
      setMessage(
        "Site and installation type are required."
      );

      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      await createInstallation({
        site_id: Number(siteId),

        assigned_to: assignedTo
          ? Number(assignedTo)
          : null,

        installation_type:
          installationType.trim(),

        status,

        start_date:
          startDate || null,

        completion_date:
          completionDate || null,
      });

      const refreshed =
        await getInstallations();

      setInstallations(
        refreshed.data
      );

      await onSummaryRefresh();

      // Reset form
      setSiteId("");
      setInstallationType("");
      setStatus("Pending");
      setAssignedTo("");
      setStartDate("");
      setCompletionDate("");

      setMessage(
        "Installation created successfully."
      );

    } catch (error) {
      console.error(
        "Create installation error:",
        error
      );

      setMessage(
        "Failed to create installation."
      );

    } finally {
      setSubmitting(false);
    }
  };

  // EDIT
  const handleEdit = (
    installation: Installation
  ) => {

    setEditingInstallation(
      installation
    );

    setSiteId(
      String(installation.site_id)
    );

    setInstallationType(
      installation.installation_type
    );

    setStatus(
      installation.status
    );

    setAssignedTo(
      installation.assigned_to !== null
        ? String(
            installation.assigned_to
          )
        : ""
    );

    setStartDate(
      formatDateForInput(
        installation.start_date
      )
    );

    setCompletionDate(
      formatDateForInput(
        installation.completion_date
      )
    );

    setMessage("");
  };

  // CANCEL EDIT
  const handleCancelEdit = () => {

    setEditingInstallation(null);

    setSiteId("");
    setInstallationType("");
    setStatus("Pending");
    setAssignedTo("");
    setStartDate("");
    setCompletionDate("");

    setMessage("");
  };

  // UPDATE
// UPDATE
const handleUpdate = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  if (!editingInstallation) {
    return;
  }

  if (!siteId || !installationType.trim()) {
    setMessage(
      "Site and installation type are required."
    );
    return;
  }

  try {
    setSubmitting(true);
    setMessage("");

    // Send updated data to backend
    const response = await updateInstallation(
      editingInstallation.id,
      {
        site_id: Number(siteId),

        assigned_to: assignedTo
          ? Number(assignedTo)
          : null,

        installation_type:
          installationType.trim(),

        status,

        start_date:
          startDate || null,

        completion_date:
          completionDate || null,
      }
    );

    console.log(
      "Updated installation response:",
      response.data
    );

    // Refresh installation list from database
    const refreshed =
      await getInstallations();

    console.log(
      "Refreshed installations:",
      refreshed.data
    );

    setInstallations(
      refreshed.data
    );

    // Refresh dashboard summary
    await onSummaryRefresh();

    // Close edit mode
    setEditingInstallation(null);

    setSiteId("");
    setInstallationType("");
    setStatus("Pending");
    setAssignedTo("");
    setStartDate("");
    setCompletionDate("");

    setMessage(
      "Installation updated successfully."
    );

  } catch (error) {
    console.error(
      "Update installation error:",
      error
    );

    setMessage(
      "Failed to update installation."
    );

  } finally {
    setSubmitting(false);
  }
};

  // DELETE
  const handleDelete = async (
    id: number
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this installation?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteInstallation(id);

      setInstallations(
        (currentInstallations) =>
          currentInstallations.filter(
            (installation) =>
              installation.id !== id
          )
      );

      await onSummaryRefresh();

      setMessage(
        "Installation deleted successfully."
      );

    } catch (error) {

      console.error(
        "Delete installation error:",
        error
      );

      setMessage(
        "Failed to delete installation."
      );
    }
  };

  return (
    <div className="installation-section">

      {/* ADD / EDIT FORM */}
      <div
        className="form-card"
        ref={editFormRef}
      >

        <h2>
          {editingInstallation
            ? "Edit Installation"
            : "Add Installation"}
        </h2>

        <form
          onSubmit={
            editingInstallation
              ? handleUpdate
              : handleSubmit
          }
        >

          <div className="form-grid">

            {/* Site */}
            <div className="form-group">

              <label>
                Site
              </label>

              <select
                value={siteId}
                onChange={(e) =>
                  setSiteId(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select site
                </option>

                {sites.map(
                  (site) => (
                    <option
                      key={site.id}
                      value={site.id}
                    >
                      {site.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* Installation Type */}
            <div className="form-group">

              <label>
                Installation Type
              </label>

              <input
                type="text"
                value={
                  installationType
                }
                placeholder="e.g. Electrical Installation"
                onChange={(e) =>
                  setInstallationType(
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
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
              >

                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

              </select>

            </div>

            {/* Assigned To */}
            <div className="form-group">

              <label>
                Assigned To
              </label>

              <select
                value={assignedTo}
                onChange={(e) =>
                  setAssignedTo(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select technician
                </option>

                <option value="3">
                  Rahul Raj
                </option>

                <option value="4">
                  Divya S
                </option>

              </select>

            </div>

            {/* Start Date */}
            <div className="form-group">

              <label>
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
              />

            </div>

            {/* Completion Date */}
            <div className="form-group">

              <label>
                Completion Date
              </label>

              <input
                type="date"
                value={
                  completionDate
                }
                onChange={(e) =>
                  setCompletionDate(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
          >

            {submitting
              ? editingInstallation
                ? "Updating..."
                : "Creating..."
              : editingInstallation
              ? "Update Installation"
              : "Add Installation"}

          </button>

          {/* Cancel */}
          {editingInstallation && (
            <button
              type="button"
              className="secondary-button"
              onClick={
                handleCancelEdit
              }
            >
              Cancel
            </button>
          )}

          {/* Message */}
          {message && (
            <p className="form-message">
              {message}
            </p>
          )}

        </form>

      </div>

      {/* INSTALLATION TABLE */}
      <div className="sites-section">

        {/* Header */}
        <div className="section-header">

          <div>

            <h2>
              Installations
            </h2>

            <span>
              {
                filteredInstallations.length
              } installations
            </span>

          </div>

          {/* Search + Filter */}
          <div className="filters">

            <input
              type="text"
              placeholder="Search site, type or technician..."
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

              <option value="Pending">
                Pending
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>

            </select>

          </div>

        </div>

        {/* Table */}
        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>ID</th>

                <th>Site</th>

                <th>Type</th>

                <th>Status</th>

                <th>Assigned To</th>

                <th>Start Date</th>

                <th>
                  Completion Date
                </th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={8}
                    style={{
                      textAlign:
                        "center",
                    }}
                  >
                    Loading installations...
                  </td>

                </tr>

              ) : filteredInstallations.length >
                0 ? (

                filteredInstallations.map(
                  (installation) => (

                    <tr
                      key={
                        installation.id
                      }
                    >

                      <td>
                        {
                          installation.id
                        }
                      </td>

                      <td>
                        {
                          installation.site_name ||
                          "N/A"
                        }
                      </td>

                      <td>
                        {
                          installation.installation_type
                        }
                      </td>

                      <td>
                        {
                          installation.status
                        }
                      </td>

                      <td>
                        {
                          installation.assigned_to_name ||
                          "Unassigned"
                        }
                      </td>

                      <td>
                        {
                          formatDateForInput(
                            installation.start_date
                          ) || "-"
                        }
                      </td>

                      <td>
                        {
                          formatDateForInput(
                            installation.completion_date
                          ) || "-"
                        }
                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              handleEdit(
                                installation
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
                                installation.id
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
                    colSpan={8}
                    style={{
                      textAlign:
                        "center",
                    }}
                  >
                    No installations found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default InstallationSection;