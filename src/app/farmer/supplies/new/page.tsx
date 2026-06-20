import Link from "next/link";
import DashboardCard from "../../../../components/DashboardCard";
import PageHeader from "../../../../components/PageHeader";

export default function NewFarmerSupplyPage() {
  return(
  <main>
    <PageHeader
    eyebrow="New Crop Supply"
    title="Log a New crop"
    description="Add crop details now"
    />

    <DashboardCard title="crop details">
        <form className="auth-form">
          <label>
            Crop Name
            <input name="crop"type="text" placeholder="e.g tomatoes" /> 
          </label>

          <label>
           Quantity
          <input name="quantity"type="number" placeholder="e.g 200" /> </label>

        <label>Unit
          <select name="unit" defaultValue="">
            <option value="">Select unit</option>
            <option value="kgs">KGS</option>
            <option value="bags">Bags</option>
            <option value ="crates">Crates</option>
            <option value="tons">Tons</option>
          </select>
          </label>
          
        <label>Location 
          <input name="location" type="text" placeholder="Nairobi"  />
          </label>
          
        <label>Planting Date
          <input type="date" name="plantingDate" />
          </label>

        <label>Harvest Date
            <input  type="date" name="harvestDate"/>
          </label>

        <label>Status
          <select name="status" defaultValue="Growing">
              <option>Growing</option>
              <option>Available</option>
              <option>Booked</option>
              <option>Harvested</option>
            </select></label>
          <button type="button">Save crop supply</button>
        </form>
    </DashboardCard>
      <Link href="/farmer/supplies" className="secondary-button">Back to supplies</Link>
</main>
  );
  
}
