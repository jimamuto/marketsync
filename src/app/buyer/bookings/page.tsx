import DashboardCard from "../../../components/DashboardCard";
import PageHeader from "../../../components/PageHeader";

const bookings = [
  {
    id: 1,
    farmer: "Kamau Farm",
    crop: "Tomatoes",
    quantity: "250 kg",
    date: "2026-07-15",
    status: "Pending",
  },
  {
    id: 2,
    farmer: "Achieng Produce",
    crop: "Maize",
    quantity: "500 kg",
    date: "2026-08-05",
    status: "Accepted",
  },
  {
    id: 3,
    farmer: "Wanjiku Farm",
    crop: "Potatoes",
    quantity: "300 kg",
    date: "2026-07-28",
    status: "Completed",
  },
];

export default function BuyerBookingsPage() {
  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Buyer bookings"
        title="My booking history"
        description="Track the produce bookings made with farmers"
      />

      <DashboardCard title="Bookings">
        <div className="booking-list">
          {bookings.map((booking) => (
            <article key={booking.id} className="booking-card">
              <div>
                <strong>Farmer: {booking.farmer}</strong>
                <p>Crop: {booking.crop}</p>
                <p>Quantity: {booking.quantity}</p>
              </div>

              <div className="booking-meta">
                <p>Date: {booking.date}</p>
                <p>Status: {booking.status}</p>
              </div>
            </article>
          ))}
        </div>
      </DashboardCard>
    </main>
  );
}
