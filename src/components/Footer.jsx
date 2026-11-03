import { Link } from "react-router-dom";
import { site, nav } from "../data/site.js";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-in">
        <div><b>{site.name}</b><p className="muted">{site.tagline}</p></div>
        <div className="foot-links">
          {nav.map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}
          {site.discordUrl && <a href={site.discordUrl} target="_blank" rel="noopener noreferrer">Discord</a>}
        </div>
      </div>
    </footer>
  );
}
