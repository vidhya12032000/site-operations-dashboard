import type { Summary } from "../types";

interface SiteSummaryCardsProps {
  summary: Summary | null;
}

const SiteSummaryCards = ({
  summary,
}: SiteSummaryCardsProps) => {
  if (!summary) {
    return null;
  }

  return (
    <section className="summary-section">
      <h2>Sites Summary</h2>

      <div className="summary-grid">

        <div className="summary-card">
          <h3>Total Sites</h3>
          <strong>
            {summary.totalSites}
          </strong>
        </div>

        <div className="summary-card">
          <h3>Active Sites</h3>
          <strong>
            {summary.activeSites}
          </strong>
        </div>

        <div className="summary-card">
          <h3>Planned Sites</h3>
          <strong>
            {summary.plannedSites}
          </strong>
        </div>

        <div className="summary-card">
          <h3>Completed Sites</h3>
          <strong>
            {summary.completedSites}
          </strong>
        </div>

      </div>
    </section>
  );
};

export default SiteSummaryCards;