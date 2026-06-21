import Link from "next/link";
import DashboardCard from "../../../components/DashboardCard";
import PageHeader from "../../../components/PageHeader";

const demands = [
  {
    id: "1",
    crop: "Tomatoes",
    quantity: "300 kg",
    location: "Nairobi",
    requiredDate: "2026-07-15",
    status: "Open",
  },
  {
    id: "2",
    crop: "Maize",
    quantity: "800 kg",
    location: "Mombasa",
    requiredDate: "2026-08-05",
    status: "Matching",
  },
  {
    id: "3",
    crop: "Potatoes",
    quantity: "400 kg",
    location: "Nakuru",
    requiredDate: "2026-07-28",
    status: "Booked",
  },
];

export default function BuyerDemandsPage() {
  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Buyer demands"
        title="My demand requests"
        description="Manage the produce your institution needs from farmers"
      />

      <div>
        <Link href="/buyer/demands/new" className="primary-button">New Demand</Link>
      </div>

      <DashboardCard title="Demand records">
        <div className="booking-list">
          {demands.map((demand) => (
            <article key={demand.id} className="booking-card">
              <div>
                <strong>{demand.crop}</strong>
                <p>Quantity: {demand.quantity}</p>
                <p>Delivery location: {demand.location}</p>
                <p>Status: {demand.status}</p>
              </div>

              <div className="booking-meta">
                <p>Required: {demand.requiredDate}</p>
                <Link href={`/buyer/demands/${demand.id}`} className="secondary-button">View</Link>
                <Link href={`/buyer/demands/${demand.id}/matches`} className="secondary-button">Find Matches</Link>
              </div>
            </article>
          ))}
        </div>
      </DashboardCard>
    </main>
  );
}
