import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";

const bookings = [
  {
    buyer: "Nairobi School",
    crop: "Maize",
    quantity: "500 Kgs",
    date: "12/06/2026",
    status: "Pending",
  },
  {
    buyer: "County Hospital",
    crop: "Potatoes",
    quantity: "200 Kgs",
    date: "18/06/2026",
    status: "Confirmed",
  },
];

const calendarLeadingDays = 4;
const calendarDays = 31;

export default function FarmerPage() {
  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="farmer dashboard"
        title="Crop Planning calendar"
        description="Track planting cycles, upcoming harvests, and active buyer bookings"
      />

      <section className="dashboard-grid">
        <DashboardCard className="calendar-card">
          <div className="calendar-top">
            <strong>May</strong>
            <strong>2026</strong>
          </div>

          <div className="calendar-grid">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THUR</span>
            <span>FRI</span>
            <span>SAT</span>
            <span>SUN</span>

            {Array.from({ length: calendarLeadingDays }, (_, index) => (
              <div key={`empty-${index}`} className="calendar-day calendar-day-empty" />
            ))}

            {Array.from({ length: calendarDays }, (_, index) => (
              <div key={index} className="calendar-day">
                {index + 1}
              </div>
            ))}
          </div>

          <div className="calendar-note planting">Planting</div>
          <div className="calendar-note harvest">Peak Harvest</div>
        </DashboardCard>


        <DashboardCard title="Log new planting cycle">
          <p>Add crop variety, estimated supply, planting date and expected harvest date</p>
          <button className="primary-button">Log new crop</button>
        </DashboardCard>
      </section>

      <DashboardCard title="Active Booking contracts">
        <div className="booking-list">
          {bookings.map((booking) => (
            <article key={`${booking.buyer}-${booking.crop}`} className="booking-card">
              <div>
                <strong>Buyer: {booking.buyer}</strong>
                <p>Crop: {booking.crop}</p>
                <p>Status: {booking.status}</p>
              </div>
              <div className="booking-meta">
                <p>QTY: {booking.quantity}</p>
                <p>Date: {booking.date}</p>
                <button className="secondary-button">Accept</button>
              </div>
            </article>
          ))}
        </div>
      </DashboardCard>
    </main>

  )
}
