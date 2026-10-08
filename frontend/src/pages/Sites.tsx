import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getSites,
  getSummary,
  deleteSite,
} from "../services/api";

import type {
  Site,
  Summary,
} from "../types";

import SiteForm from "../components/SiteForm";
import SiteSummaryCards from "../components/SiteSummaryCards";

const Sites = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [editingSite, setEditingSite] =
    useState<Site | null>(null);

  const formRef =
    useRef<HTMLDivElement | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 10;

  // --------------------------------
  // Load Sites + Summary
  // --------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        sitesResponse,
        summaryResponse,
      ] = await Promise.all([
        getSites(),
        getSummary(),
      ]);

      setSites(sitesResponse.data);
      setSummary(summaryResponse.data);
    } catch (err) {
      console.error(
        "Failed to load sites:",
        err
      );

      setError(
        "Failed to load sites."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------
  // Refresh Summary
  // --------------------------------

  const refreshSummary = async () => {
    try {
      const response =
        await getSummary();

      setSummary(response.data);
    } catch (err) {
      console.error(
        "Failed to refresh summary:",
        err
      );
    }
  };

  // --------------------------------
  // Site Created
  // --------------------------------

  const handleSiteCreated = async (
    newSite: Site
  ) => {
    try {
      /*
       * Fetch fresh data after creation.
       *
       * This is important because the POST
       * response may contain created_by ID
       * but GET /sites contains created_by_name.
       */
      const response =
        await getSites();

      setSites(response.data);

      setCurrentPage(1);

      await refreshSummary();
    } catch (err) {
      console.error(
        "Failed to refresh sites after creation:",
        err
      );

      // Fallback
      setSites((prev) => [
        newSite,
        ...prev,
      ]);

      setCurrentPage(1);

      await refreshSummary();
    }
  };

  // --------------------------------
  // Edit
  // --------------------------------

  const handleEdit = (
    site: Site
  ) => {
    setEditingSite(site);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // --------------------------------
  // Site Updated
  // --------------------------------

  const handleSiteUpdated = async (
    updatedSite: Site
  ) => {
    try {
      /*
       * Fetch fresh data so
       * created_by_name is also available.
       */
      const response =
        await getSites();

      setSites(response.data);

      setEditingSite(null);

      await refreshSummary();
    } catch (err) {
      console.error(
        "Failed to refresh sites after update:",
        err
      );

      // Fallback
      setSites((prev) =>
        prev.map((site) =>
          site.id === updatedSite.id
            ? {
                ...site,
                ...updatedSite,
              }
            : site
        )
      );

      setEditingSite(null);

      await refreshSummary();
    }
  };

  // --------------------------------
  // Cancel Edit
  // --------------------------------

  const handleCancelEdit = () => {
    setEditingSite(null);
  };

  // --------------------------------
  // Delete
  // --------------------------------

  const handleDelete = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this site?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSite(id);

      setSites((prev) =>
        prev.filter(
          (site) => site.id !== id
        )
      );

      if (
        editingSite &&
        editingSite.id === id
      ) {
        setEditingSite(null);
      }

      await refreshSummary();
    } catch (err) {
      console.error(
        "Failed to delete site:",
        err
      );

      setError(
        "Failed to delete site."
      );
    }
  };

  // --------------------------------
  // Search + Filter
  // --------------------------------

  const filteredSites = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return sites.filter((site) => {
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

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
  ]);

  // --------------------------------
  // Pagination
  // --------------------------------

  const totalPages = Math.ceil(
    filteredSites.length /
      itemsPerPage
  );

  // Keep current page valid
  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }

    if (
      totalPages === 0 &&
      currentPage !== 1
    ) {
      setCurrentPage(1);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedSites =
    filteredSites.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage *
        itemsPerPage
    );

  // --------------------------------
  // Loading
  // --------------------------------

  if (loading) {
    return (
      <div className="page-message">
        Loading sites...
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* Page Header */}
      <div className="dashboard-header">
        <div>
          <h1>Sites</h1>

          <p>
            Manage site information
            and status
          </p>
        </div>
      </div>

      {/* Sites Summary */}
      <SiteSummaryCards
        summary={summary}
      />

      {/* Add / Edit Site Form */}
      <div ref={formRef}>
        <SiteForm
          onSiteCreated={
            handleSiteCreated
          }
          editingSite={
            editingSite
          }
          onSiteUpdated={
            handleSiteUpdated
          }
          onCancelEdit={
            handleCancelEdit
          }
        />
      </div>

      {/* Sites Table */}
      <section className="table-section">

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
              placeholder="Search sites..."
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
        </div>

        <div className="table-container">

          {error ? (
            <div className="table-message error">
              {error}
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="table-message">
              No sites found.
            </div>
          ) : (
            <>
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

                  {paginatedSites.map(
                    (site) => (
                      <tr
                        key={site.id}
                      >
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
                            "-"}
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
                  )}

                </tbody>

              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">

                  <button
                    type="button"
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          prev - 1
                      )
                    }
                  >
                    Previous
                  </button>

                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (_, index) =>
                      index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={
                        currentPage ===
                        page
                          ? "pagination-active"
                          : ""
                      }
                      onClick={() =>
                        setCurrentPage(
                          page
                        )
                      }
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          prev + 1
                      )
                    }
                  >
                    Next
                  </button>

                </div>
              )}

            </>
          )}

        </div>

      </section>

    </div>
  );
};

export default Sites;