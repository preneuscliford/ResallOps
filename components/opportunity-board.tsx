import { Opportunity } from "@/types/opportunity";

type OpportunityBoardProps = {
  opportunities: Opportunity[];
};

export function OpportunityBoard({ opportunities }: OpportunityBoardProps) {
  return (
    <div className="table-wrap">
      <table className="opportunity-table">
        <thead>
          <tr>
            <th>Annonce</th>
            <th>Prix</th>
            <th>Revente</th>
            <th>Marge</th>
            <th>Risque</th>
            <th>Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity) => (
            <tr key={opportunity.id}>
              <td>
                <div className="table-title">{opportunity.title}</div>
                <div className="table-subtitle">
                  {opportunity.platform} • {opportunity.location}
                </div>
              </td>
              <td>{formatCurrency(opportunity.askingPrice)}</td>
              <td>{formatCurrency(opportunity.resaleEstimate)}</td>
              <td>{formatCurrency(opportunity.estimatedMargin)}</td>
              <td>
                <span className={`badge badge-${opportunity.riskLevel.toLowerCase()}`}>
                  {opportunity.riskLevel}
                </span>
              </td>
              <td>
                <strong>{opportunity.score}/100</strong>
              </td>
              <td>{opportunity.recommendedAction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
