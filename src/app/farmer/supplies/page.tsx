import Link from "next/link";
import DashboardCard from "../../../components/DashboardCard";
import PageHeader from "../../../components/PageHeader";

const supplies = [
  {
    id: "1",
    crop: "Tomatoes",
    quantity: "200 kg",
    location: "Nakuru",
    plantingDate: "2026-05-01",
    harvestDate: "2026-07-10",
    status: "Available",
  },
  {
    id: "2",
    crop: "Maize",
    quantity: "500 kg",
    location: "Eldoret",
    plantingDate: "2026-04-15",
    harvestDate: "2026-08-20",
    status: "Growing",
  },
  {
    id: "3",
    crop: "Onions",
    quantity: "120 kg",
    location: "Meru",
    plantingDate: "2026-05-22",
    harvestDate: "2026-07-30",
    status: "Booked",
  },
];

export default function FarmerSuppliesPage() {
  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Farmer supplies"
        title="My crop supplies"
        description="Manage crops you have planted, harvested or made available to buyers"
      />

      <div>
        <Link href="/farmer/supplies/new" className="primary-button">Add new supply</Link>
      </div>

      <DashboardCard title="Supply records">
        <div className="booking-list">
          {supplies.map((supply) => (
            <article key={supply.id} className="booking-card">
              <div>
                <strong>{supply.crop}</strong>
                <p>Quantity: {supply.quantity}</p>
                <p>Location: {supply.location}</p>
                <p>Status: {supply.status}</p>
              </div>

              <div className="booking-meta">
                <p>Planting: {supply.plantingDate}</p>
                <p>Harvest: {supply.harvestDate}</p>
                <Link href={`/farmer/supplies/${supply.id}`} className="secondary-button">View</Link>
              </div>
            </article>
          ))}
        </div>
      </DashboardCard>
    </main>
  );
}
