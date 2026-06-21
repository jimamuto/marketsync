import Link from "next/link";
import DashboardCard from "../../../../components/DashboardCard";
import PageHeader from "../../../../components/PageHeader";

const supplies = [
  {
    id: "1",
    crop: "Tomatoes",
    quantity: "200 kg",
    location: "Nakuru",
    plantingDate: "2026-05-01",
    harvestDate: "2026-07-10",
    status: "Available",
    price: "KES 5,000",
  },
  {
    id: "2",
    crop: "Maize",
    quantity: "500 kg",
    location: "Eldoret",
    plantingDate: "2026-04-15",
    harvestDate: "2026-08-20",
    status: "Growing",
    price: "KES 9,000",
  },
  {
    id: "3",
    crop: "Onions",
    quantity: "120 kg",
    location: "Meru",
    plantingDate: "2026-05-22",
    harvestDate: "2026-07-30",
    status: "Booked",
    price: "KES 3,000",
  },
];

export default async function FarmerSupplyDetailsPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const supply = supplies.find((item) => item.id === id) || supplies[0];

  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Supply details"
        title={supply.crop}
        description="View crop supply details before this page connects to the backend API"
      />

      <DashboardCard title="Crop information">
        <div className="booking-list">
          <article className="booking-card">
            <div>
              <strong>{supply.crop}</strong>
              <p>Quantity: {supply.quantity}</p>
              <p>Location: {supply.location}</p>
              <p>Status: {supply.status}</p>
            </div>

            <div className="booking-meta">
              <p>Planting: {supply.plantingDate}</p>
              <p>Harvest: {supply.harvestDate}</p>
              <p>Price: {supply.price}</p>
            </div>
          </article>
        </div>
      </DashboardCard>

      <div>
        <Link href="/farmer/supplies" className="secondary-button">Back to supplies</Link>
      </div>
    </main>
  );
}
