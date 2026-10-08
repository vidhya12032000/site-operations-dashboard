import type { Summary } from "../types";

interface InstallationSummaryCardsProps {
  summary: Summary | null;
}

const InstallationSummaryCards = ({
  summary,
}: InstallationSummaryCardsProps) => {
  if (!summary) {
    return null;
  }

  return (
    <section className="summary-section">
      <h2>Installations Summary</h2>

      <div className="summary-grid">

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
    </section>
  );
};

export default InstallationSummaryCards;