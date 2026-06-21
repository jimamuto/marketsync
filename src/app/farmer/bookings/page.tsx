import DashboardCard from "../../../components/DashboardCard";
import PageHeader from "../../../components/PageHeader";

const bookings = [
  {
    id: 1,
    buyer: "Nairobi School",
    crop: "Maize",
    quantity: "500 kg",
    date: "2026-06-12",
    status: "Pending",
  },
  {
    id: 2,
    buyer: "Kenyatta National Hospital",
    crop: "Potatoes",
    quantity: "200 kg",
    date: "2026-06-18",
    status: "Accepted",
  },
  {
    id: 3,
    buyer: "Twiga Foods Ltd",
    crop: "Tomatoes",
    quantity: "100 kg",
    date: "2026-07-02",
    status: "Rejected",
  },
];

export default function FarmerBookingsPage() {
  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Farmer bookings"
        title="Buyer booking requests"
        description="Review buyer requests for your crop supplies"
      />

      <DashboardCard title="Booking requests">
        <div className="booking-list">
          {bookings.map((booking) => (
            <article key={booking.id} className="booking-card">
              <div>
                <strong>Buyer: {booking.buyer}</strong>
                <p>Crop: {booking.crop}</p>
                <p>Quantity: {booking.quantity}</p>
                <p>Status: {booking.status}</p>
              </div>

              <div className="booking-meta">
                <p>Date: {booking.date}</p>

                {booking.status === "Pending" && (
                  <>
                    <button className="secondary-button">Accept</button>
                    <button className="secondary-button">Reject</button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </DashboardCard>
    </main>
  );
}
