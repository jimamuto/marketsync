import Link from "next/link";
import DashboardCard from "../../../components/DashboardCard";
import PageHeader from "../../../components/PageHeader";

const supplies = [
     {
       id: 1,
       crop: "Tomatoes",
       quantity: "200 kg",
       location: "Kumasi",
       plantingDate: "2026-05-01",
       harvestDate: "2026-07-10",
       status: "Available",
     },
     {
       id: 2,
       crop: "Maize",
       quantity: "500 kg",
       location: "Ejisu",
       plantingDate: "2026-04-15",
       harvestDate: "2026-08-20",
       status: "Growing",
     },
     {
       id: 3,
       crop: "Onions",
       quantity: "120 kg",
       location: "Mampong",
       plantingDate: "2026-05-22",
       harvestDate: "2026-07-30",
       status: "Booked",
     },
   ];

export default function FarmerSuppliesPage(){
  return(
  <main className="dashboard-page">
      <PageHeader
        eyebrow="Farmer supplies"
        title="My crop supplies"
        description="Manage crops you have planted, harvested or made available to buyers"
      />
      <div>
      <Link href="/farmer/supplies/new" className="primary-button">Add new supply</Link></div>
      <DashboardCard title="supply records">
      <div className="booking-list">
          {/*allocating key to the article to uniquely identify the content mapped*/}
          {supplies.map((supply)=>(
            <article key={supply.id}>
              <div>
                <strong>{supply.crop}</strong>
                <p>quantity:{supply.quantity}</p>
                <p>location:{supply.location}</p>
                <p>status:{supply.status}</p>
              </div>
            </article>
          ))}


        </div>
      </DashboardCard>
    </main>

  );
}
