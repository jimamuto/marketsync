
import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";
import DashboardSidebar from "../../components/DashboardSidebar";

const validationQueue = [
     {
       applicant: "Murimi Cooperative",
       role: "Farmer Org",
       document: "KRA_Pin_Cert.pdf",
     },
     {
       applicant: "St. Mary's Sch.",
       role: "Institutional Buyer",
       document: "Ministry_Reg.pdf",
     },
   ];
const adminLinks =[
  {label:"Analytics"},
  {label:"Verification"},
  {label:"Configuration"},
  {label:"Audit Logs"},
]

export default function AdminPage(){
  return(
<main className= "admin-page">
    <DashboardSidebar title="Navigation" links={adminLinks}/>

      <section className="admin-content">

      <PageHeader
      eyebrow="Admin Dashboard"
        title="supply demand summary"
        description="Monitor market sync status,validation queues and crop demand gaps"
      />

      <DashboardCard title= "Projected crop supply vs Institutional demand">
        <div className= "bar-chart">
          <div>
            <span>Maize</span>
            <div className="bar supply" style={{ width: "70%" }}>
              12,500 Kgs supply
            </div>
            <div className="bar demand" style={{ width: "50%" }}>
              8,900 Kgs demand
            </div>
          </div>

          <div>
            <span>Beans</span>
            <div className="bar supply" style={{ width: "35%" }}>
              3,100 Kgs supply
            </div>
            <div className="bar demand" style={{ width: "85%" }}>
              15,000 Kgs demand
            </div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title= "Trigger system synchronisation and auto match engine" >
        <p>Placeholder panel for matching logic between crop supplies and demand</p>
        <button className="primary-button"> Run sync</button>
    </DashboardCard>

      <DashboardCard title= "pending user account validation queue">
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Applicant names</th>
              <th>Role type</th>
              <th>Credentials uploaded</th>
              <th>Action</th>
              </tr>
          </thead>
          <tbody>
            {validationQueue.map((item) => (
              <tr key={item.applicant}>
                <td>{item.applicant}</td>
                <td>{item.role}</td>
                <td>{item.document}</td>
                <td>
                  <button className="table-button">Validate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </DashboardCard>

      </section>
    </main>
    )
}
