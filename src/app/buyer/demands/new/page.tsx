import Link from "next/link";
import DashboardCard from "../../../../components/DashboardCard";
import PageHeader from "../../../../components/PageHeader";

export default function NewBuyerDemandPage() {
  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="New demand"
        title="Create demand request"
        description="Add what produce your institution needs, then connect it to the backend later"
      />

      <DashboardCard title="Demand details">
        <form className="auth-form">
          <label>
            Crop Name
            <input name="crop" type="text" placeholder="e.g tomatoes" />
          </label>

          <label>
            Quantity
            <input name="quantity" type="number" placeholder="e.g 300" />
          </label>

          <label>
            Unit
            <select name="unit" defaultValue="">
              <option value="">Select unit</option>
              <option value="kgs">KGS</option>
              <option value="bags">Bags</option>
              <option value="crates">Crates</option>
              <option value="tons">Tons</option>
            </select>
          </label>

          <label>
            Delivery Location
            <input name="location" type="text" placeholder="Nairobi" />
          </label>

          <label>
            Required Date
            <input type="date" name="requiredDate" />
          </label>

          <label>
            Max Price / Budget
            <input name="budget" type="text" placeholder="e.g KES 10,000" />
          </label>

          <label>
            Notes
            <input name="notes" type="text" placeholder="Any delivery instructions" />
          </label>

          <label>
            Status
            <select name="status" defaultValue="Open">
              <option>Open</option>
              <option>Matching</option>
              <option>Booked</option>
              <option>Closed</option>
            </select>
          </label>

          <button type="button">Save demand request</button>
        </form>
      </DashboardCard>

      <Link href="/buyer/demands" className="secondary-button">Back to demands</Link>
    </main>
  );
}
