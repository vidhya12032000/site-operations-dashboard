import { useEffect, useState } from "react";

import InstallationSection from "../components/InstallationSection";
import InstallationSummaryCards from "../components/InstallationSummaryCards";

import { getSummary } from "../services/api";
import type { Summary } from "../types";

const Installations = () => {
  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [loading, setLoading] = useState(true);

  // -----------------------------------
  // Load Summary
  // -----------------------------------

  const refreshSummary = async () => {
    try {
      const response = await getSummary();

      setSummary(response.data);
    } catch (err) {
      console.error(
        "Failed to load installation summary",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSummary();
  }, []);

  return (
    <div className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Installations</h1>

          <p>
            Manage site installations,
            assignments and status
          </p>
        </div>
      </div>

      {/* ONLY INSTALLATION SUMMARY */}
      {!loading && (
        <InstallationSummaryCards
          summary={summary}
        />
      )}

      {/* Installation CRUD */}
      <InstallationSection
        onSummaryRefresh={refreshSummary}
      />

    </div>
  );
};

export default Installations;