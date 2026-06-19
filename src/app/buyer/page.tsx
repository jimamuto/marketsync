import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";

const matchedHarvests = [
     {
       farmer: "Murimi Cooperative",
       crop: "Irish Potatoes",
       estimatedSupply: "1,200KG",
       estimatedDate: "04/06/2026",
     },
     {
       farmer: "Green Valley Farm",
       crop: "Cabbages",
       estimatedSupply: "600KG",
       estimatedDate: "29/05/2026",
     },
   ];

   const procurementHistory = [
     {
       id: "#B2B-8902",
       crop: "Irish Potatoes",
       quantity: "1200KG",
       status: "Matched",
       dispatchDate: "04/06/2026",
       action: "View Route",
     },
     {
       id: "#B2B-8711",
       crop: "Cabbages",
       quantity: "600KG",
       status: "In Transit",
       dispatchDate: "29/05/2026",
       action: "Track App",
     },
   ];

export default function BuyerPage(){
  return(
  <main className="dashboard-page">
  <PageHeader
    eyebrow="Institutional Buyer"
    title="Procurement Demand Dashboard"
    description="Submit Demand,review matched harvest listings, and track procurement history"
 /> 

  <section className ="buyer-layout">
  <DashboardCard title= "Submit procurment demand">
        <form className="demand-form">
          <label>
          Crop Required
            <input type="text" placeholder="Irish potatoes"/>
          </label>

          <label>
            Demand quantity
            <input type="text" placeholder="1200KG"/>
          </label>

          <label>
            Target Delivery Window
            <input type ="date"/>
          </label>

          <label>
            Special Delivery Instructions
            <textarea placeholder="Must be packaged in 50kg bags"/>
          </label>

          <button>
            Submit Requirements
          </button>
        </form>
      </DashboardCard>

<DashboardCard title="Matched Harvest Listings Feed">
             <div className="match-grid">
               {matchedHarvests.map((harvest) => (
                 <article key={`${harvest.farmer}-${harvest.crop}`} className="match-card">
                   <div className="image-placeholder" />

                   <div className="match-card-content">
                     <p>
                       <strong>Farmer:</strong> {harvest.farmer}
                     </p>
                     <p>
                       <strong>Crop:</strong> {harvest.crop}
                     </p>
                     <p>
                       <strong>Est Supply:</strong> {harvest.estimatedSupply}
                     </p>
                     <p>
                       <strong>Est Date:</strong> {harvest.estimatedDate}
                     </p>
                   </div>

                   <button className="secondary-button">Request Booking</button>
                 </article>
               ))}
             </div>
           </DashboardCard>
         </section>

         <DashboardCard title="Procurement History & Delivery Schedule">
           <div className="table-wrap">
             <table>
               <thead>
                 <tr>
                   <th>Crop ID</th>
                   <th>Crop Variety</th>
                   <th>Quantity</th>
                   <th>Match Status</th>
                   <th>Est. Dispatch Date</th>
                   <th>Action</th>
                 </tr>
               </thead>

               <tbody>
                 {procurementHistory.map((item) => (
                   <tr key={item.id}>
                     <td>{item.id}</td>
                     <td>{item.crop}</td>
                     <td>{item.quantity}</td>
                     <td>
                       <span className="status-pill">{item.status}</span>
                     </td>
                     <td>{item.dispatchDate}</td>
                     <td>
                       <button className="table-button">{item.action}</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </DashboardCard>
  </main>
  );
}
