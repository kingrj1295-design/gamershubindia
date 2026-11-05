export const site = {
  name: "GamersHubIndia",
  tagline: "BY OGSuperio",
  discordUrl: "https://discord.gg/ZfuwZeBhcj", // paste your Discord invite link here; empty = button hidden
  contactEmail: "", // paste your contact email here
};

export const nav = [
  { to: "/", label: "Home" },
  { to: "/games", label: "Games" },
  { to: "/pc-checker", label: "PC Checker" },
  { to: "/community", label: "Community" },
  { to: "/products", label: "Products" },
  { to: "/news", label: "News" },
  { to: "/about", label: "About" },
  { to: "/help", label: "Help" },
];

// Your own text. Replace when you are ready.
export const about = {
  who: "OGSuperio real name Manas Giri Goswami is a passionate gamer and developer who created GamersHubIndia to help Indian gamers discover games, check their PC compatibility, and connect with each other.",
  why: "To solve gamers problems that I also have faced ",
  vision: "One place where Indian gamers discover games, check their PC, and meet each other.",
  mission: "Make PC and console gaming easier to explore, with honest and clearly sourced information.",
  goals: ["Game Library with real data", "Can My PC Run It?", "Community", "Our own gaming apps"],
};

// Status values: "Available" | "In Development" | "Coming Soon". Statuses are placeholders: set the real ones.
export const products = [
  { name: "GHI GameLauncher", status: "Available", icon: "/logo/ghilauncher-logo.png", desc: "One launcher for your games.", features: ["Game Library , Auto scan games , Inbuilt spotify control , custom theme and wallpaper , etc "], download: "https://github.com/kingrj1295-design/GHI-Launcher/releases/download/v2.0.0/GHISetup.exe" },
];

// DEMO DATA: placeholder content only. Not real games, news or posts.
export const demoGames = [
  { title: "Demo Game One", genre: "Action" },
  { title: "Demo Game Two", genre: "RPG" },
  { title: "Demo Game Three", genre: "Strategy" },
  { title: "Demo Game Four", genre: "Racing" },
];
export const demoNews = ["Demo headline: real news arrives in Phase 6", "Demo headline: every article will link to its source"];
export const demoPosts = ["Demo discussion: best settings for low-end PCs?", "Demo discussion: share your setup"];