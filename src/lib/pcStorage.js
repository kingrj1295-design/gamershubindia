// Saves the user's PC specs in THIS browser only (localStorage). Nothing is sent to any server.
const KEY = "ghi.pcSpecs.v1";

export const EMPTY_PC = {
  cpuBrand: "Intel", cpuModel: "", cpuCores: "", cpuGhz: "",
  gpuBrand: "NVIDIA", gpuModel: "", gpuVramMb: "",
  ramGb: "", os: "", storageFreeGb: "", storageType: "",
};

const text = (v) => String(v ?? "").trim();

// Only checks the FORMAT of what was typed. Nothing is required except that at least one detail is given:
// a missing detail never blocks saving or the results page; that part is simply shown as "Not provided".
export function validatePc(pc) {
  const e = {};
  const cpu = text(pc.cpuModel);
  const gpu = text(pc.gpuModel);
  if (cpu.length > 60) e.cpuModel = "Please keep the processor name under 60 characters.";
  if (gpu.length > 60) e.gpuModel = "Please keep the graphics card name under 60 characters.";
  const cores = text(pc.cpuCores);
  if (cores !== "" && !(Number.isInteger(Number(cores)) && Number(cores) >= 1 && Number(cores) <= 128))
    e.cpuCores = "Enter a whole number from 1 to 128, or leave it empty.";
  const ghz = text(pc.cpuGhz);
  if (ghz !== "" && !(Number(ghz) >= 0.5 && Number(ghz) <= 7)) e.cpuGhz = "Enter a clock speed from 0.5 to 7 GHz, or leave it empty.";
  const freeText = text(pc.storageFreeGb);
  if (freeText !== "" && !(Number.isFinite(Number(freeText)) && Number(freeText) >= 0 && Number(freeText) <= 100000))
    e.storageFreeGb = "Enter your free storage in GB, for example 120, or leave it empty.";
  const anyDetail = [cpu, gpu, text(pc.ramGb), text(pc.os), freeText].some(Boolean);
  if (!anyDetail) e.form = "Enter at least one detail about your PC, for example your RAM or graphics card. Empty boxes are fine: each part is checked on its own.";
  return e;
}

export function normalizePc(pc) {
  const out = {};
  for (const k of Object.keys(EMPTY_PC)) out[k] = text(pc[k]);
  return out;
}

export function loadPc() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const pc = { ...EMPTY_PC };
    for (const k of Object.keys(EMPTY_PC)) if (typeof data[k] === "string" || typeof data[k] === "number") pc[k] = String(data[k]);
    return Object.keys(validatePc(pc)).length === 0 ? pc : null;
  } catch {
    return null;
  }
}

export function savePc(pc) {
  try {
    localStorage.setItem(KEY, JSON.stringify(pc));
    return true;
  } catch {
    return false;
  }
}

export function clearPc() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore: storage unavailable */
  }
}
