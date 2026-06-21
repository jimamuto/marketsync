import Link from "next/link";
import DashboardCard from "../../../../components/DashboardCard";
import PageHeader from "../../../../components/PageHeader";

const demands = [
  {
    id: "1",
    crop: "Tomatoes",
    quantity: "300 kg",
    location: "Nairobi",
    requiredDate: "2026-07-15",
    status: "Open",
    budget: "KES 12,000",
    notes: "Delivery before school reopening",
  },
  {
    id: "2",
    crop: "Maize",
    quantity: "800 kg",
    location: "Mombasa",
    requiredDate: "2026-08-05",
    status: "Matching",
    budget: "KES 20,000",
    notes: "Prefer dry maize packed in bags",
  },
  {
    id: "3",
    crop: "Potatoes",
    quantity: "400 kg",
    location: "Nakuru",
    requiredDate: "2026-07-28",
    status: "Booked",
    budget: "KES 15,000",
    notes: "Can be delivered in crates",
  },
];

export default async function BuyerDemandDetailsPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const demand = demands.find((item) => item.id === id) || demands[0];

  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Demand details"
        title={demand.crop}
        description="View demand request details before this page connects to the backend API"
      />

      <DashboardCard title="Demand information">
        <div className="booking-list">
          <article className="booking-card">
            <div>
              <strong>{demand.crop}</strong>
              <p>Quantity: {demand.quantity}</p>
              <p>Delivery location: {demand.location}</p>
              <p>Status: {demand.status}</p>
            </div>

            <div className="booking-meta">
              <p>Required: {demand.requiredDate}</p>
              <p>Budget: {demand.budget}</p>
              <p>Notes: {demand.notes}</p>
            </div>
          </article>
        </div>
      </DashboardCard>

      <div>
        <Link href={`/buyer/demands/${demand.id}/matches`} className="primary-button">Find Matches</Link>
        <Link href="/buyer/demands" className="secondary-button">Back to demands</Link>
      </div>
    </main>
  );
}
