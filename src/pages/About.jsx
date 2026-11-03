import { about, site } from "../data/site.js";
export default function About() {
  return (
    <section className="wrap page">
      <h1>About OGSuperio</h1>
      <div className="stack">
        <div className="card"><h2>Who I am</h2><p>{about.who}</p></div>
        <div className="card"><h2>Why GamersHubIndia exists</h2><p>{about.why}</p></div>
        <div className="card"><h2>Vision</h2><p>{about.vision}</p></div>
        <div className="card"><h2>Mission</h2><p>{about.mission}</p></div>
        <div className="card"><h2>Future goals</h2><ul>{about.goals.map((g) => <li key={g}>{g}</li>)}</ul></div>
        <div className="card"><h2>Contact</h2>
          <p>{site.contactEmail ? <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> : "Contact details coming soon."}</p>
        </div>
      </div>
    </section>
  );
}
