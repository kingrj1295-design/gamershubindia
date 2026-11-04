
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { games } from "../data/games.js";

export default function GameLibrary() {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("az");

  const genres = useMemo(
    () => [
      "All",
      ...new Set(games.flatMap((game) => game.genres || [])),
    ],
    []
  );

  const filteredGames = useMemo(() => {
    let result = games.filter((game) => {
      const matchesSearch = game.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesGenre =
        genre === "All" || (game.genres || []).includes(genre);

      return matchesSearch && matchesGenre;
    });

    if (sort === "az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "za") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sort === "newest") {
      result.sort(
        (a, b) => Date.parse(b.released) - Date.parse(a.released)
      );
    }

    return result;
  }, [search, genre, sort]);

  return (
    <section className="wrap page">
      <div className="library-header">
        <div>
          <h1>Game Library</h1>
          <p className="muted">
            Discover and explore games on Steam.
          </p>
        </div>

        <span className="library-count">
          {filteredGames.length} Games
        </span>
      </div>

      <div className="library-toolbar">
        <input
          type="search"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search games"
          className="library-search"
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          aria-label="Filter by genre"
          className="library-select"
        >
          {genres.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All Genres" : item}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort games"
          className="library-select"
        >
          <option value="az">Name: A–Z</option>
          <option value="za">Name: Z–A</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      <div className="library-view-switch">
        <button
          className={view === "grid" ? "active" : ""}
          onClick={() => setView("grid")}
          type="button"
        >
          ▦ Grid
        </button>

        <button
          className={view === "horizontal" ? "active" : ""}
          onClick={() => setView("horizontal")}
          type="button"
        >
          ☰ Horizontal
        </button>

        <button
          className={view === "slides" ? "active" : ""}
          onClick={() => setView("slides")}
          type="button"
        >
          ⇆ Slides
        </button>
      </div>

      {filteredGames.length > 0 ? (
        <div className={`game-library-list ${view}`}>
          {filteredGames.map((game) => (
            <Link
              key={game.appId}
              to={`/games/${game.slug}`}
              className="game-card"
            >
              {game.headerImage && (
                <img
                  src={game.headerImage}
                  alt={game.title}
                  loading="lazy"
                />
              )}

              <div className="game-card-content">
                <h3>{game.title}</h3>

                <p className="muted">
                  {(game.genres || []).join(" · ")}
                </p>

                <span className="btn">View Details</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="library-empty">
          <h2>No games found</h2>
          <p className="muted">
            Try another search or genre.
          </p>
          <button
            className="btn"
            onClick={() => {
              setSearch("");
              setGenre("All");
            }}
            type="button"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}

