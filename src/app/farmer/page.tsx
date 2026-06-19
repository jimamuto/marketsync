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
    <section className= "dashboard-header">
        <p className="eyebrow"> Farmer Dashboard</p>
        <h1>Crop Planning Calender</h1>
        <p className="dashboard-intro">
        Track planting cycles upcoming harvests and active buyer bookings</p>
      </section>

      <section className="dashboard-grid">
        <DashboardCard className="calender-card">
          <div>
            <Strong>May</Strong>
            <Strong>2026</Strong>
          </div>

          <div className="calender-grid">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THUR</span>
            <span>FRI</span>
            <span>SAT</span>
            <span>SUN</span>

            {Array.from({ length: 21 }, (_, index) => ( //use array to create 21 days
                 <div key={index} className="calendar-day">
                   {index + 1}
                 </div>
               ))}
          </div>

          <div className="calender-note planting">Planting</div>
          <div className="calender-note harvest">Peak Harvest</div>
        </DashboardCard>


        <DashboardCard title="Log new planting cycle">
          <p>Add crop variety,estimated supply,planting date and expected harvest date</p>
          <button className="primary-button">Log new crop</button>
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
