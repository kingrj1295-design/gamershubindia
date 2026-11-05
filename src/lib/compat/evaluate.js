import { compareCpu, compareGpu, compareRam, compareStorage, compareOs } from "./compare.js";

export const RESULT = {
  CAN_RUN: "can-run",
  RECOMMENDED: "recommended",
  MAY_NOT_RUN: "may-not-run",
  PARTIAL: "partial-assessment",
  INSUFFICIENT: "insufficient-data",
};

export const COMPONENTS = ["cpu", "gpu", "ram", "storage", "os"];
const ESSENTIAL = ["cpu", "gpu", "ram"];
const NAME = { cpu: "CPU", gpu: "GPU", ram: "RAM", storage: "storage", os: "operating system" };
const STATUS_WORDS = { missing: "not provided", unknown: "can't compare", unavailable: "not listed by the game" };

const isKnown = (cmp) => cmp?.status === "meets" || cmp?.status === "below";

const joinName = (brand, model) => {
  const m = (model ?? "").trim();
  if (!m) return "";
  const b = (brand ?? "").trim();
  return b && !m.toLowerCase().includes(b.toLowerCase()) ? `${b} ${m}` : m;
};

// Every component is compared on its own. A missing detail only affects its own component.
function compareTier(pc, tier) {
  const t = tier ?? {};
  const cpu = compareCpu(joinName(pc.cpuBrand, pc.cpuModel), pc.cpuCores, pc.cpuGhz, t);
  const gpu = compareGpu(joinName(pc.gpuBrand, pc.gpuModel), pc.gpuVramMb, t);
  const free = pc.storageFreeGb === "" || pc.storageFreeGb == null ? null : Number(pc.storageFreeGb);
  return {
    cpu,
    gpu,
    ram: compareRam(pc.ramGb ? Number(pc.ramGb) : null, t.ramGb ?? null),
    storage: compareStorage(free, t.storageGb ?? null, pc.storageType, t.storageType ?? null),
    os: compareOs(pc.os, t.os),
  };
}

const list = (components, minimum) =>
  components.map((c) => `${NAME[c]} (${STATUS_WORDS[minimum[c].status] ?? minimum[c].status})`).join(", ");

// Suggestions for what to add to make the result more accurate (only where adding something would really help).
function improvementsFor(minimum) {
  const out = [];
  for (const c of COMPONENTS) {
    const cmp = minimum[c];
    if ((cmp.status === "missing" || cmp.status === "unknown") && cmp.hint) out.push({ component: c, text: cmp.hint });
  }
  return out;
}

export function evaluate(pc, requirement) {
  const min = requirement?.minimum ?? null;
  const rec = requirement?.recommended ?? null;
  const minimum = compareTier(pc, min);
  const recommended = compareTier(pc, rec);

  const failures = COMPONENTS.filter((c) => minimum[c].status === "below").map((c) => ({ component: c, ...minimum[c] }));
  const checked = COMPONENTS.filter((c) => isKnown(minimum[c]));
  const gaps = COMPONENTS.filter((c) => !isKnown(minimum[c]));
  const base = {
    components: { minimum, recommended },
    failures,
    unchecked: gaps,
    checked,
    improvements: improvementsFor(minimum),
    assumptions: [],
  };

  if (!min)
    return { ...base, overall: RESULT.INSUFFICIENT, headline: "Insufficient data to provide a reliable compatibility result.",
      reason: "No verified minimum requirements are available for this game yet." };

  if (failures.length) {
    const rest = gaps.length ? ` Not checked: ${list(gaps, minimum)}.` : "";
    return { ...base, overall: RESULT.MAY_NOT_RUN, headline: "May not run", reason: `One or more minimum requirements are not met.${rest}` };
  }

  const essentialKnown = ESSENTIAL.filter((c) => isKnown(minimum[c]));
  if (checked.length < 2 || essentialKnown.length === 0)
    return { ...base, overall: RESULT.INSUFFICIENT, headline: "Insufficient data to provide a reliable compatibility result.",
      reason: `Not enough could be compared to give a useful assessment. Not checked: ${list(gaps, minimum)}.` };

  if (ESSENTIAL.some((c) => !isKnown(minimum[c])))
    return { ...base, overall: RESULT.PARTIAL, headline: "Partial assessment",
      reason: `Everything we could check meets the minimum (${checked.map((c) => NAME[c]).join(", ")}). We could not check: ${list(gaps, minimum)}. This is not a full result.` };

  const recOk = rec && gaps.length === 0 &&
    ESSENTIAL.every((c) => recommended[c].status === "meets") &&
    COMPONENTS.every((c) => recommended[c].status !== "below");
  if (recOk)
    return { ...base, overall: RESULT.RECOMMENDED, headline: "Recommended", reason: "Your PC appears to meet the listed recommended requirements." };

  const rest = gaps.length ? ` Not checked: ${list(gaps, minimum)}.` : "";
  return { ...base, overall: RESULT.CAN_RUN, headline: "Can run", reason: `Your PC appears to meet the listed minimum requirements.${rest}` };
}

const none = (reason) => ({
  overall: RESULT.INSUFFICIENT,
  headline: "Insufficient data to provide a reliable compatibility result.",
  reason,
  components: { minimum: {}, recommended: {} },
  failures: [],
  unchecked: [],
  checked: [],
  improvements: [],
  assumptions: [],
});

// Chooses the Windows or Linux requirement list that matches the user's operating system.
// If no operating system was provided, the Windows list is used and the result says so.
export function evaluateForPc(pc, gameReq) {
  if (!gameReq) return none("No verified system requirements are available for this game yet.");
  const os = (pc.os ?? "").trim();
  if (os === "Other") return none("Choose Windows 10, Windows 11 or Linux. Other operating systems cannot be checked.");
  const key = os === "Linux" ? "linux" : "windows";
  if (!gameReq[key]?.minimum) return none(`No verified ${key === "linux" ? "Linux" : "Windows"} requirements are available for this game.`);
  const result = evaluate(pc, gameReq[key]);
  if (!os) result.assumptions.push("Operating system not provided, so the Windows requirement list was used.");
  return result;
}
