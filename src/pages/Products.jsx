import { products } from "../data/site.js";
const cls = (s) => "tag " + s.toLowerCase().replace(/\s/g, "-");
export default function Products() {
  return (
    <section className="wrap page">
      <h1>Our apps & products</h1>
      <p className="muted">Each product is built separately. Status shows where it stands today.</p>
      <div className="grid">
        {products.map((p) => (
          <article className="card" key={p.name}>
            <div className="row"><span className="mark">{p.icon}</span><span className={cls(p.status)}>{p.status}</span></div>
            <h2>{p.name}</h2>
            <p>{p.desc}</p>
            <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
            {p.download && p.status === "Available"
              ? <a className="btn" href={p.download} target="_blank" rel="noopener noreferrer">Download</a>
              : <p className="muted">Download not available yet.</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
