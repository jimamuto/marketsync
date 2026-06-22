import Link from "next/link";
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

export default function FarmerPage(){
  return(
  <main className= "dashboard-page">
      <PageHeader
        eyebrow="farmer dashboard"
        title="Crop Planning calendar"
        description="Track planting cycles,upcoming harvests, and active buyer bookings"
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

            {Array.from({ length: 31 }, (_, index) => ( 
            <div key={index} className="calendar-day">
                   {index + 1}
                 </div>
               ))}
          </div>

        </DashboardCard>


        <DashboardCard title="Log new planting cycle">
          <p>Add crop variety,estimated supply,planting date and expected harvest date</p>
          <Link href="/farmer/supplies/new">Log new crop</Link>
        </DashboardCard>
        
        <DashboardCard title="View Crop Calender">
          <p>Track planting and harvest dates for your crop supplies</p>
          <Link href="/farmer/calendar">View crop calendar</Link>
        </DashboardCard>

        <DashboardCard title="Buyer booking requests" className="buyer-booking-request-card">
          <p>Review buyer requests for your crop supplies</p>
          <Link href="/farmer/bookings">Manage buyer booking request</Link>
        </DashboardCard>

      </section>

      <DashboardCard title="Active Booking contracts">
        <div className="booking-list">
          {bookings.map((booking)=>(
            <article key={`${booking.buyer}-${booking.crop}`} className="booking-card">
              <div>
                <strong>Buyer:{booking.buyer}</strong>
                <p>Crop:{booking.crop}</p>
                <p>Status:{booking.status}</p>
              </div>
              <div>
                <p>QTY: {booking.quantity}</p>
                <p>date:{booking.date}</p>
                <button className="secondary-button">Accept</button>
              </div>
            </article>
          ))}
        </div>
      </DashboardCard>
    </main>

  )
}
