import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { site, nav } from "../data/site.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="mark">G</span>
          <span><b>{site.name}</b><small>{site.tagline}</small></span>
        </Link>
        <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
        <nav className={"links" + (open ? " open" : "")}>
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"} onClick={() => setOpen(false)}>{n.label}</NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
