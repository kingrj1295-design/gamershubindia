// Turns hardware names into comparable pieces. No benchmark scores are used or invented.
// A hardware name is only compared when BOTH names are from the same vendor and the same
// naming scheme. Anything else is reported as "unknown" instead of guessed.

const clean = (s) =>
  String(s ?? "").toLowerCase().replace(/[™®(),]/g, " ").replace(/\s+/g, " ").trim();

// "Intel Core i5-8400 / AMD Ryzen 5 1600" -> two separate alternatives
export function splitAlternatives(text) {
  return String(text ?? "")
    .split(/\s*(?:\/|;|,|\bor\b)\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseCpu(text) {
  const t = clean(text);

  const intel = t.match(/\bi([3579])[\s-]*(\d{3,5})([a-z]{0,2})\b/);
  if (intel) {
    const digits = intel[2];
    if (digits.length === 4 && digits[0] === "1") return null; // 11th-13th gen laptop numbering: ambiguous
    const gen = digits.length === 3 ? 1 : digits.length === 4 ? Number(digits[0]) : Number(digits.slice(0, 2));
    return { vendor: "intel", tier: Number(intel[1]), gen, mobile: /[uhpmq]/.test(intel[3]) };
  }

  const amd = t.match(/\bryzen\s*([3579])\s*(?:pro\s*)?(\d{4})([a-z0-9]{0,3})\b/);
  if (amd) {
    return { vendor: "amd", tier: Number(amd[1]), gen: Number(amd[2][0]), mobile: /^[uh]/.test(amd[3]) };
  }
  return null;
}

// NVIDIA generations are ordered by their series number. GTX 16xx sits between 10xx and 20xx.
const NVIDIA_GEN = { 6: 6, 7: 7, 9: 9, 10: 10, 16: 11, 20: 12, 30: 13, 40: 14, 50: 15 };
const AMD_4DIGIT_GEN = { 5: 4, 6: 5, 7: 6, 9: 7 };

export function parseGpu(text) {
  const t = clean(text);
  const mobile = /laptop|mobile|max-q/.test(t);

  const nv = t.match(/\b(?:gtx|rtx|gt|geforce|nvidia)\s*(\d{3,4})\s*(ti super|ti|super)?\b/);
  if (nv) {
    const n = Number(nv[1]);
    const gen = NVIDIA_GEN[n >= 1000 ? Math.floor(n / 100) : Math.floor(n / 100)];
    if (gen === undefined) return null;
    const bump = nv[2] === "ti super" ? 1 : nv[2] ? 0.5 : 0;
    return { vendor: "nvidia", gen, tier: (n % 100) + bump, mobile };
  }

  const amd = t.match(/\brx\s*(\d{3,4})\s*(xtx|xt|gre)?\b/);
  if (amd) {
    const n = Number(amd[1]);
    let gen, tier;
    if (n < 1000) {
      gen = n < 500 ? 1 : 2; // RX 400 and RX 500 series
      tier = (Math.floor(n / 10) % 10) - 2; // RX 570 sits roughly where a 4-digit '5xxx/6xxx' tier-5 card does
    } else {
      gen = AMD_4DIGIT_GEN[Math.floor(n / 1000)];
      tier = Math.floor(n / 1000) === 9 ? Math.floor(n / 10) % 10 : Math.floor(n / 100) % 10;
    }
    if (gen === undefined) return null;
    const bump = amd[2] === "xtx" ? 1 : amd[2] === "xt" ? 0.5 : 0;
    return { vendor: "amd", gen, tier: tier + bump, mobile };
  }
  return null;
}

// Operating systems -> simple tokens
export function osTokens(list) {
  const out = new Set();
  for (const item of list ?? []) {
    const t = clean(item);
    if (/windows\s*11/.test(t)) out.add("windows11");
    if (/windows\s*10/.test(t)) out.add("windows10");
    if (/windows\s*8/.test(t)) out.add("windows8");
    if (/windows\s*7/.test(t)) out.add("windows7");
    if (/vista|\bxp\b/.test(t)) out.add("windowsvista");
    if (/linux|steamos|ubuntu/.test(t)) out.add("linux");
  }
  return [...out];
}

// Integrated graphics (Intel UHD / HD / Iris, AMD "Radeon Graphics" or Vega in a CPU) use shared system memory.
export function isIntegratedGpu(text) {
  const t = clean(text);
  return /\b(uhd|iris|intel hd|hd graphics)\b/.test(t) || /\bradeon\s+graphics\b/.test(t) || /\bvega\s*\d+\b/.test(t);
}
