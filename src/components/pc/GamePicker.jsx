import { useState } from "react";

export default function GamePicker({ games, requirements, selected, onSelect }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = q ? games.filter((g) => g.title.toLowerCase().includes(q)) : games;

  return (
    <div>
      <label htmlFor="pcx-search" className="pcx-label">Search games</label>
      <input id="pcx-search" type="search" placeholder="Type a game name" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
      {list.length === 0 ? (
        <p className="muted">No game in our library matches "{query}".</p>
      ) : (
        <ul className="pcx-games">
          {list.map((g) => {
            const has = Boolean(requirements[g.slug]);
            return (
              <li key={g.slug}>
                <button type="button" className={"pcx-game" + (g.slug === selected ? " active" : "")} aria-pressed={g.slug === selected} onClick={() => onSelect(g.slug)}>
                  {g.headerImage && <img src={g.headerImage} alt="" loading="lazy" width="92" height="43" />}
                  <span className="pcx-game-title">{g.title}</span>
                  <span className={"tag" + (has ? "" : " demo")}>{has ? "Requirements listed" : "Requirements not available"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
