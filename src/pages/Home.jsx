import { Link } from "react-router-dom";
import { site, products, demoGames, demoNews, demoPosts } from "../data/site.js";

const Demo = () => <span className="tag demo">Demo data</span>;

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-in">
          <div>
            <h1>Find your next game. Know if your PC can run it.</h1>
            <p className="lead">{site.name} brings game discovery, PC checks and a gamer community into one place.</p>
            <div className="row">
              <Link className="btn" to="/games">Open Game Library</Link>
              <Link className="btn ghost" to="/products">See our apps</Link>
            </div>
          </div>
          <div className="panel" aria-label="Preview of featured games (demo)">
            <div className="row between"><b>Featured</b><Demo /></div>
            {demoGames.map((g) => <div className="line" key={g.title}><span>{g.title}</span><small>{g.genre}</small></div>)}
          </div>
        </div>
      </section>

      <section className="wrap sec">
        <div className="row between"><h2>Trending games</h2><Demo /></div>
        <div className="grid">
          {demoGames.map((g) => (
            <article className="card game" key={g.title}>
              <div className="cover" aria-hidden="true" />
              <h3>{g.title}</h3><p className="muted">{g.genre}</p>
            </article>
          ))}
        </div>
        <p className="muted">Real games, prices and requirements arrive in Phase 2.</p>
      </section>

      <section className="wrap sec two">
        <div className="card"><div className="row between"><h2>Latest news</h2><Demo /></div>{demoNews.map((n) => <p key={n}>{n}</p>)}</div>
        <div className="card"><div className="row between"><h2>Community</h2><Demo /></div>{demoPosts.map((n) => <p key={n}>{n}</p>)}</div>
      </section>

      <section className="wrap sec">
        <h2>Our apps & products</h2>
        <div className="grid">
          {products.map((p) => (
            <Link to="/products" className="card" key={p.name}>
              <div className="row between">
                <img
                  src={p.icon}
                  alt={`${p.name} logo`}
                  className="product-icon"
                />
                <span className="tag">{p.status}</span>
              </div>
              <h3>{p.name}</h3><p className="muted">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
