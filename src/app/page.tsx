import Image from "next/image";
import Link from "next/link";
import {cookies} from "next/headers";

const benefits = [
  {
    title: "Plan with market intelligence",
    copy: "Farmers can record planting cycles, crop varieties, quantities, and expected harvest dates in a visual crop calendar.",
  },
  {
    title: "Synchronize demand and supply",
    copy: "Schools, hospitals, and other institutions can submit procurement needs that are matched against upcoming harvests.",
  },
  {
    title: "Coordinate direct bookings",
    copy: "Role-based dashboards help farmers, buyers, and administrators manage booking requests, delivery schedules, reports, and account oversight.",
  },
];

const steps = [
  "Farmer records crop type, quantity, and expected harvest date",
  "Institutional buyer submits procurement needs and delivery timing",
  "MarketSync compares demand with upcoming harvest availability",
  "Booking requests, approvals, delivery schedules, and reports are tracked",
];

export default async function Home() {

  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  const role = cookieStore.get("session_role")?.value;
  const isLoggedIn= Boolean(userId);

  const dashboardHref = role === "farmer" ? "/farmer" : role ==="buyer" ? "/buyer" : role === "admin" ? "/admin" : "/";


  return (
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-visual" aria-label="MarketSync landing page illustration">
          <Image
            src="/marketsync-landing.png"
            alt="Illustration of farmers and fresh produce representing the MarketSync crop marketplace"
            width={1524}
            height={704}
            priority
          />
        </div>

        <div className="landing-hero-copy">
          <p className="eyebrow">MarketSync</p>
          <h1 id="landing-title">Synchronize crop production with real buyer demand.</h1>
          <p className="landing-intro">
            MarketSync is a web-based market synchronization and B2B booking platform for small-scale farmers and institutional buyers in Kenya. It helps farmers plan production using demand visibility while institutions coordinate reliable produce procurement.
          </p>

          <div className="landing-actions" aria-label="Primary actions">
            {isLoggedIn ?(
            <Link href={dashboardHref} className="primary-button landing-cta">
            Dashboard 
            </Link>
            ):(
            <>
            <Link href="/register" className="primary-button landing-cta">
             Get Started 
            </Link>
            <Link href="/login" className="secondary-button landing-cta">
              Log in
            </Link>
            </>
            )}
          </div>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="problem-title">
        <div className="section-kicker">The problem</div>
        <div className="split-section">
          <h2 id="problem-title">Agricultural production and institutional demand are often poorly coordinated.</h2>
          <p>
            Farmers often plant with limited visibility into future demand, which can lead to surplus production, food wastage, unstable prices, and reduced profitability. Institutional buyers face fluctuating procurement costs and inconsistent supply when they cannot plan directly with producers.
          </p>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="benefits-title">
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">What MarketSync supports</p>
            <h2 id="benefits-title">Proactive planning instead of reactive market information.</h2>
          </div>
          <p>
            The platform combines a crop planning calendar, demand-supply synchronization, role-based access control, reporting, and direct farmer-to-institution booking workflows.
          </p>
        </div>

        <div className="benefit-list">
          {benefits.map((benefit, index) => (
            <article className="benefit-item" key={benefit.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section process-panel" aria-labelledby="process-title">
        <p className="section-kicker">How it works</p>
        <h2 id="process-title">Four steps from planting data to coordinated delivery.</h2>
        <ol className="process-list">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="landing-section final-cta" aria-labelledby="dashboard-title">
        <p className="section-kicker">Ready to get started</p>
        <h2 id="dashboard-title">Explore the MarketSync system.</h2>
        <p>
          Create an account or log in to access crop calendars, procurement demand, booking workflows, reports, and admin oversight.
        </p>
        {isLoggedIn ? (
        <Link href={dashboardHref} className="primary-button landing-cta">
         Go back to dashboard 
        </Link>
        ):(
        <>        
        <Link href="/register" className="primary-button landing-cta">
          Get started
        </Link>
        </>
        )}
      </section>
    </main>
  );
}
