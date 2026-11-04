
import fs from "node:fs";
import path from "node:path";

const APP_IDS = [
  730,    // Counter-Strike 2
  570,    // Dota 2
  620,    // Portal 2
  236390, // War Thunder
  413150  // Stardew Valley
];

const outputDir = path.resolve("src/data");
const outputFile = path.join(outputDir, "games.js");

async function fetchGame(appId) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=in&l=english`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    const item = result[String(appId)];

    if (!item?.success || !item.data) {
      console.log(`Skipped App ID ${appId}: no game data`);
      return null;
    }

    const game = item.data;

    return {
      appId,
      slug: game.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      title: game.name,
      description: game.short_description || "",
      released: game.release_date?.date || "Unknown",
      developers: game.developers || [],
      publishers: game.publishers || [],
      genres: (game.genres || []).map((genre) => genre.description),
      headerImage: game.header_image || "",
      steamUrl: `https://store.steampowered.com/app/${appId}/`
    };
  } catch (error) {
    console.error(`Failed App ID ${appId}:`, error.message);
    return null;
  }
}

async function main() {
  const games = [];

  for (const appId of APP_IDS) {
    console.log(`Fetching App ID ${appId}...`);
    const game = await fetchGame(appId);

    if (game) games.push(game);
  }

  if (games.length === 0) {
    throw new Error("No games were fetched. Existing data was not changed.");
  }

  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    outputFile,
    `export const games = ${JSON.stringify(games, null, 2)};\n`,
    "utf-8"
  );

  console.log(`\nSaved ${games.length} games to ${outputFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
