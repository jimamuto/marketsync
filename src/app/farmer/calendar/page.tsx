import DashboardCard from "../../../components/DashboardCard";
import PageHeader from "../../../components/PageHeader";

const calendarItems = [
  {
    crop: "Tomatoes",
    activity: "Expected harvest",
    date: "2026-07-10",
    location: "Nakuru",
    status: "Available soon",
  },
  {
    crop: "Maize",
    activity: "Growing period",
    date: "2026-08-20",
    location: "Eldoret",
    status: "Growing",
  },
  {
    crop: "Onions",
    activity: "Ready for buyers",
    date: "2026-07-30",
    location: "Meru",
    status: "Booked",
  },
];

export default function FarmerCalendarPage() {
  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Crop calendar"
        title="Harvest timeline"
        description="Track planting and harvest dates for your crop supplies"
      />

      <DashboardCard title="Upcoming crop activities">
        <div className="booking-list">
          {calendarItems.map((item) => (
            <article key={`${item.crop}-${item.date}`} className="booking-card">
              <div>
                <strong>{item.crop}</strong>
                <p>{item.activity}</p>
                <p>Location: {item.location}</p>
              </div>

              <div className="booking-meta">
                <p>Date: {item.date}</p>
                <p>Status: {item.status}</p>
              </div>
            </article>
          ))}
        </div>
      </DashboardCard>
    </main>
  );
}
