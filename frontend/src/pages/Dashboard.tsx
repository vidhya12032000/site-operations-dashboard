import { useEffect, useState } from "react";
import { getSummary } from "../services/api";
import type { Summary } from "../types";

const Dashboard = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getSummary();

        setSummary(response.data);
      } catch (error) {
        console.error("Summary loading error:", error);
        setError("Failed to load dashboard summary.");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="page-message">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-message error">
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <h1>Site Operations Dashboard</h1>
          <p>
            Monitor sites and installation activities.
          </p>
        </div>
      </div>

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
            <strong>{summary.totalInstallations}</strong>
          </div>

          <div className="summary-card">
            <h3>Pending Installations</h3>
            <strong>{summary.pendingInstallations}</strong>
          </div>

          <div className="summary-card">
            <h3>In Progress Installations</h3>
            <strong>{summary.inProgressInstallations}</strong>
          </div>

          <div className="summary-card">
            <h3>Completed Installations</h3>
            <strong>{summary.completedInstallations}</strong>
          </div>

        </div>
      )}

    </div>
  );
};

export default Dashboard;