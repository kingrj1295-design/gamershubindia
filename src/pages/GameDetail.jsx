
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { games } from "../data/games.js";

export default function GameDetail() {
  const { slug } = useParams();
  const game = games.find((g) => g.slug === slug);

  useEffect(() => {
    document.title = game
      ? `${game.title} | GamersHubIndia`
      : "Game not found | GamersHubIndia";
  }, [game]);

  if (!game) {
    return (
      <section className="wrap page">
        <h1>Game not found</h1>
        <Link className="btn" to="/games">Back to Games</Link>
      </section>
    );
  }

  return (
    <section className="wrap page">
      <div className="game-detail">
        {game.headerImage && (
          <img
            src={game.headerImage}
            alt={`${game.title} cover`}
            className="game-cover"
          />
        )}

        <p><span className="tag">STEAM GAME</span></p>

        <h1>{game.title}</h1>

        <p className="muted">
          Released: {game.released}
        </p>

        <p>{game.description}</p>

        <h3>Genres</h3>
        <p>{game.genres.join(" · ") || "Not available"}</p>

        <h3>Developers</h3>
        <p>{game.developers.join(", ") || "Not available"}</p>

        <a
          className="btn"
          href={game.steamUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Steam
        </a>

        <div className="row">
          {games
            .filter((g) => g.slug !== slug)
            .map((g) => (
              <Link
                key={g.appId}
                className="btn ghost"
                to={`/games/${g.slug}`}
              >
                {g.title}
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
