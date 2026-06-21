import Link from "next/link";
import DashboardCard from "../../../../../components/DashboardCard";
import PageHeader from "../../../../../components/PageHeader";

const matches = [
  {
    id: "1",
    farmer: "Kamau Farm",
    crop: "Tomatoes",
    quantity: "250 kg",
    location: "Nakuru",
    harvestDate: "2026-07-10",
    price: "KES 9,500",
    reason: "Same crop and harvest date is close to required date",
  },
  {
    id: "2",
    farmer: "Achieng Produce",
    crop: "Tomatoes",
    quantity: "180 kg",
    location: "Kiambu",
    harvestDate: "2026-07-13",
    price: "KES 7,200",
    reason: "Available quantity and delivery location are suitable",
  },
];

export default async function BuyerDemandMatchesPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;

  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Demand matches"
        title={`Matches for demand ${id}`}
        description="View farmer supplies that may satisfy this demand request"
      />

      <DashboardCard title="Matched farmer supplies">
        <div className="booking-list">
          {matches.map((match) => (
            <article key={match.id} className="booking-card">
              <div>
                <strong>{match.farmer}</strong>
                <p>Crop: {match.crop}</p>
                <p>Available quantity: {match.quantity}</p>
                <p>Location: {match.location}</p>
              </div>

              <div className="booking-meta">
                <p>Harvest: {match.harvestDate}</p>
                <p>Price: {match.price}</p>
                <p>Reason: {match.reason}</p>
                <button className="secondary-button">Create booking</button>
              </div>
            </article>
          ))}
        </div>
      </DashboardCard>

      <Link href={`/buyer/demands/${id}`} className="secondary-button">Back to demand</Link>
    </main>
  );
}
