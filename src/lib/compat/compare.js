import { parseCpu, parseGpu, splitAlternatives, osTokens, isIntegratedGpu } from "./parse.js";

// Status values:
//   "meets" | "below"   -> compared
//   "unknown"           -> entered, but cannot be compared automatically ("Can't compare")
//   "missing"           -> the user did not provide this detail ("Not provided")
//   "unavailable"       -> the game's requirement list does not include it
// "hint" is a short suggestion of what to add to improve accuracy (only when adding something would help).
const make = (status, yours, required, note = "", hint = "") => ({ status, yours, required, note, hint });

function dominance(u, r) {
  if (u.gen >= r.gen && u.tier >= r.tier) return "meets";
  if (u.gen <= r.gen && u.tier <= r.tier) return "below";
  return "unknown"; // newer but lower tier (or the reverse): cannot be decided from names alone
}

export function compareHardware(kind, userText, reqText) {
  const label = kind === "cpu" ? "CPU" : "GPU";
  if (!reqText) return make("unavailable", userText?.trim() ?? "", null, `${label} requirement not available.`);
  if (!userText || !userText.trim()) return make("missing", "", reqText, `${label} not provided.`, `Enter your ${label} model.`);

  const parse = kind === "cpu" ? parseCpu : parseGpu;
  const you = parse(userText);
  if (!you) {
    const integrated = kind === "gpu" && isIntegratedGpu(userText);
    return make("unknown", userText.trim(), reqText, integrated
      ? "This looks like integrated graphics, which share system memory and are not compared by name here."
      : `We could not recognise your ${label} model, so it was not compared automatically.`,
      integrated ? "" : `Use the exact model name, for example ${kind === "cpu" ? "Core i5-8400" : "GTX 1060"}.`);
  }

  const alternatives = splitAlternatives(reqText).map(parse).filter(Boolean);
  if (!alternatives.length)
    return make("unknown", userText.trim(), reqText, `The listed ${label} is in a format we cannot compare automatically.`);

  const sameVendor = alternatives.filter((a) => a.vendor === you.vendor);
  if (!sameVendor.length)
    return make("unknown", userText.trim(), reqText, `The requirement lists a different brand, so it cannot be compared by name. Check it manually.`);

  const results = sameVendor.map((a) => dominance(you, a));
  const laptop = you.mobile ? " Laptop parts can be slower than desktop parts with similar names." : "";
  if (results.includes("meets")) return make("meets", userText.trim(), reqText, `Estimated from product series and tier, not a benchmark.${laptop}`);
  if (results.every((r) => r === "below")) return make("below", userText.trim(), reqText, `Looks older and lower-tier than the listed ${label}. Estimated from names, not a benchmark.${laptop}`);
  return make("unknown", userText.trim(), reqText, `Not clearly above or below the listed ${label}. Check a benchmark site.`);
}

// ROOT-CAUSE FIX: these fallbacks used to return yours: "" when cores/clock/VRAM were empty, which replaced the
// name the user had entered and made the dashboard print "Not entered". They now always keep the entered name.
const label = (name, extra) => [name, extra].filter(Boolean).join(", ");
const joinNotes = (...notes) => notes.filter(Boolean).join(" ");

// Generic CPU wording such as "Dual-Core 2.2 GHz": compared with the cores/clock the user entered.
export function compareCpuSpec(userName, userCores, userGhz, specs, reqText, priorNote = "") {
  const extras = [userCores ? `${userCores} cores` : null, userGhz ? `${userGhz} GHz` : null].filter(Boolean).join(", ");
  const yours = label(userName, extras || (userName ? "cores and clock not entered" : ""));
  if (!userCores && !userGhz)
    return make(userName ? "unknown" : "missing", yours, reqText,
      joinNotes(priorNote, "This requirement is a general description. Enter your CPU cores and clock speed to compare."),
      userName ? "Enter your CPU cores and clock speed (GHz)." : "Enter your CPU model, or its cores and clock speed.");
  const results = specs.map((sp) => {
    const checks = [];
    if (sp.cores != null && userCores) checks.push(Number(userCores) >= sp.cores);
    if (sp.ghz != null && userGhz) checks.push(Number(userGhz) >= sp.ghz);
    const needed = (sp.cores != null ? 1 : 0) + (sp.ghz != null ? 1 : 0);
    if (checks.length < needed) return "unknown";
    return checks.every(Boolean) ? "meets" : "below";
  });
  if (results.includes("meets")) return make("meets", yours, reqText, "Compared using the cores and clock speed you entered.");
  if (results.every((r) => r === "below")) return make("below", yours, reqText, "Compared using the cores and clock speed you entered.");
  return make("unknown", yours, reqText, joinNotes(priorNote, "Enter both cores and clock speed to compare."), "Enter both your CPU cores and clock speed (GHz).");
}

// Generic GPU wording such as "1 GB or more video memory": compared with the VRAM the user chose.
// Never invents a VRAM value. Integrated graphics have no dedicated video memory, so no value is assumed for them.
export function compareGpuSpec(userName, userVramMb, spec, reqText, priorNote = "") {
  const integrated = isIntegratedGpu(userName);
  if (!userVramMb) {
    const yours = label(userName, userName ? (integrated ? "shared system memory" : "video memory not entered") : "");
    return make(userName ? "unknown" : "missing", yours, reqText, joinNotes(priorNote, integrated
      ? "Integrated graphics use shared system memory, so there is no dedicated video memory value to compare. Check this requirement manually."
      : "This requirement is a general description. Choose your video memory (VRAM) to compare."),
      integrated ? "" : userName ? "Choose your graphics card's video memory (VRAM)." : "Enter your graphics card model, or its video memory.");
  }
  const gb = Number(userVramMb) / 1024;
  const ok = Number(userVramMb) >= spec.vramMb;
  return make(ok ? "meets" : "below", label(userName, `${gb} GB VRAM`), reqText,
    "Only the video memory you entered was compared. Listed features such as DirectX or Shader Model support are not checked.");
}

// Requirement lists only GPUs that were released before 2010 (for example GeForce 8600). A user's GPU is
// treated as meeting it when it is from a much newer family. This is judged by release era, NOT by a benchmark.
export function compareLegacyGpu(userText, reqText) {
  const you = userText && userText.trim() ? parseGpu(userText) : null;
  if (!you) return make("unknown", userText?.trim() ?? "", reqText, "Enter a recognisable GPU model to compare.");
  const modern = you.vendor === "amd" || (you.vendor === "nvidia" && you.gen >= 7 && you.tier >= 30);
  return modern
    ? make("meets", userText.trim(), reqText, "The listed GPUs are from before 2010 and yours is from a much newer family. Judged by release era, not a benchmark.")
    : make("unknown", userText.trim(), reqText, "Could not tell from the name whether your GPU is newer than the listed one. Check manually.");
}

// CPU: compare by model name first, then (if the wording is generic) by the cores/clock the user entered.
export function compareCpu(userName, userCores, userGhz, tier) {
  const base = compareHardware("cpu", userName, tier.cpu);
  if (["unknown", "missing"].includes(base.status) && tier.cpuSpec?.length) return compareCpuSpec(userName, userCores, userGhz, tier.cpuSpec, tier.cpu, base.note);
  return base;
}

// GPU: model name first, then era (very old listed cards), then video memory. The entered name is kept at every step.
export function compareGpu(userName, userVramMb, tier) {
  let result = compareHardware("gpu", userName, tier.gpu);
  if (result.status === "unknown" && tier.gpuLegacy) {
    const next = compareLegacyGpu(userName, tier.gpu);
    result = next.status === "unknown" ? { ...next, note: joinNotes(result.note, next.note) } : next;
  }
  if (["unknown", "missing"].includes(result.status) && tier.gpuSpec) result = compareGpuSpec(userName, userVramMb, tier.gpuSpec, tier.gpu, result.note);
  return result;
}

// Text the dashboard shows for "You". Says "Not provided" only when nothing was entered for that part.
export function yoursLabel(cmp) {
  return cmp?.yours ? cmp.yours : "Not provided";
}

export function compareRam(userGb, reqGb) {
  if (reqGb == null) return make("unavailable", userGb ? `${userGb} GB` : "", null, "RAM requirement not available.");
  if (!userGb) return make("missing", "", `${reqGb} GB`, "RAM not provided.", "Choose how much RAM you have.");
  return make(userGb >= reqGb ? "meets" : "below", `${userGb} GB`, `${reqGb} GB`);
}

export function compareStorage(freeGb, reqGb, userType, reqType) {
  if (reqGb == null) return make("unavailable", freeGb != null ? `${freeGb} GB free` : "", null, "Storage requirement not available.");
  if (freeGb == null || Number.isNaN(freeGb)) return make("missing", "", `${reqGb} GB`, "Free storage not provided.", "Enter your free storage in GB.");
  if (freeGb < reqGb) return make("below", `${freeGb} GB free`, `${reqGb} GB`);
  if (reqType === "SSD" && userType === "HDD")
    return make("below", `${freeGb} GB free, HDD`, `${reqGb} GB, SSD`, "The listing asks for an SSD.");
  if (reqType === "SSD" && !userType)
    return make("unknown", `${freeGb} GB free, drive type not provided`, `${reqGb} GB, SSD`, "The listing asks for an SSD.", "Choose SSD or HDD.");
  return make("meets", `${freeGb} GB free`, `${reqGb} GB`);
}

const WIN_ORDER = ["windowsvista", "windows7", "windows8", "windows10", "windows11"];

export function compareOs(userOs, reqList) {
  const tokens = osTokens(reqList);
  const required = (reqList ?? []).join(" / ");
  if (!tokens.length) return make("unavailable", userOs ?? "", null, "Operating system requirement not available.");
  if (!userOs) return make("missing", "", required, "Operating system not provided.", "Choose your operating system.");
  if (userOs === "Other") return make("unknown", userOs, required, "Cannot check this operating system automatically.");
  if (userOs === "Linux")
    return tokens.includes("linux")
      ? make("meets", userOs, required)
      : make("below", userOs, required, "Only Windows is listed. Some games run through compatibility tools, which is not assessed here.");
  const yours = WIN_ORDER.indexOf(userOs.toLowerCase().replace(/\s+/g, ""));
  const lowestNeeded = Math.min(...tokens.filter((t) => t.startsWith("windows")).map((t) => WIN_ORDER.indexOf(t)));
  if (!Number.isFinite(lowestNeeded)) return make("below", userOs, required, "Windows is not listed for this game.");
  return yours >= lowestNeeded
    ? make("meets", userOs, required, userOs === "Windows 11" && !tokens.includes("windows11") ? "Windows 11 is assumed to run Windows 10 games." : "")
    : make("below", userOs, required);
}
