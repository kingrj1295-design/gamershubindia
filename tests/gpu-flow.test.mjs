// Regression tests for the "GPU shows 'Not entered'" bug.
// They follow the real data path: form values -> validatePc -> normalizePc -> savePc (localStorage)
// -> loadPc -> evaluateForPc -> the label the dashboard prints (yoursLabel).
import test from "node:test";
import assert from "node:assert/strict";
import { requirements } from "../src/data/requirements.js";
import { evaluateForPc, yoursLabel, RESULT, COMPONENTS } from "../src/lib/compat/index.js";
import { validatePc, normalizePc, savePc, loadPc, clearPc, EMPTY_PC } from "../src/lib/pcStorage.js";

// Minimal stand-in for the browser's localStorage.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

// What PcForm holds in state for a user who picked brand + typed a model and left optional boxes empty.
const form = (gpuBrand, gpuModel, extra = {}) => ({
  ...EMPTY_PC, cpuBrand: "Intel", cpuModel: "Core i5-8400", gpuBrand, gpuModel,
  ramGb: "16", os: "Windows 10", storageFreeGb: "300", storageType: "SSD", ...extra,
});

function runFlow(values, slug) {
  clearPc();
  assert.deepEqual(validatePc(values), {}, "form should be valid");
  assert.equal(savePc(normalizePc(values)), true);
  const loaded = loadPc();
  assert.ok(loaded, "saved PC should load back");
  return { loaded, result: evaluateForPc(loaded, requirements[slug]) };
}

const GAMES = Object.keys(requirements);

for (const [brand, model] of [["NVIDIA", "GTX 1060"], ["Intel", "UHD Graphics 730"]]) {
  test(`${brand} ${model}: name survives save/load and appears in every game's result`, () => {
    for (const slug of GAMES) {
      const { loaded, result } = runFlow(form(brand, model), slug);
      assert.equal(loaded.gpuModel, model);
      assert.equal(loaded.gpuBrand, brand);
      for (const tier of ["minimum", "recommended"]) {
        const gpu = result.components[tier].gpu;
        if (!gpu) continue;
        const label = yoursLabel(gpu);
        assert.notEqual(label, "Not entered", `${slug} ${tier}`);
        assert.ok(label.includes(model), `${slug} ${tier}: "${label}" should contain "${model}"`);
      }
    }
  });
}

test("the CPU name is never replaced by 'Not entered' either", () => {
  for (const slug of GAMES) {
    const { result } = runFlow(form("NVIDIA", "GTX 1060"), slug);
    for (const tier of ["minimum", "recommended"]) {
      const cpu = result.components[tier].cpu;
      if (cpu) assert.ok(yoursLabel(cpu).includes("Core i5-8400"), `${slug} ${tier}`);
    }
  }
});

test("GTX 1060 without VRAM: result asks for VRAM, does not invent one", () => {
  const { result } = runFlow(form("NVIDIA", "GTX 1060"), "counter-strike-2");
  const gpu = result.components.minimum.gpu;
  assert.equal(gpu.status, "unknown");
  assert.match(gpu.note, /video memory/i);
  assert.doesNotMatch(gpu.yours, /\d+ GB VRAM/);
  assert.equal(result.overall, RESULT.PARTIAL);
});

test("GTX 1060 with VRAM chosen in the form: compared numerically", () => {
  const { result } = runFlow(form("NVIDIA", "GTX 1060", { gpuVramMb: "6144" }), "counter-strike-2");
  const gpu = result.components.minimum.gpu;
  assert.equal(gpu.status, "meets");
  assert.ok(gpu.yours.includes("GTX 1060") && gpu.yours.includes("6 GB VRAM"));
});

test("Intel UHD Graphics 730 (integrated): shown as entered, 'Can't compare', clear explanation, no invented VRAM", () => {
  const { result } = runFlow(form("Intel", "UHD Graphics 730"), "counter-strike-2");
  const gpu = result.components.minimum.gpu;
  assert.equal(gpu.status, "unknown");
  assert.ok(gpu.yours.includes("Intel UHD Graphics 730"));
  assert.match(gpu.yours, /shared system memory/);
  assert.match(gpu.note, /integrated graphics/i);
  assert.doesNotMatch(gpu.yours, /\d+ GB VRAM/);
  assert.equal(result.overall, RESULT.PARTIAL);
});

test("Intel UHD 730 on a name-based listing (War Thunder) is 'Can't compare' with a clear note", () => {
  const { result } = runFlow(form("Intel", "UHD Graphics 730"), "war-thunder");
  const gpu = result.components.minimum.gpu;
  assert.equal(gpu.status, "unknown");
  assert.match(gpu.note, /integrated graphics/i);
  assert.ok(yoursLabel(gpu).includes("UHD Graphics 730"));
});

test("a real below-minimum GPU is still reported as below with the entered name", () => {
  const { result } = runFlow(form("NVIDIA", "GTX 650"), "war-thunder");
  const gpu = result.components.minimum.gpu;
  assert.equal(gpu.status, "below");
  assert.ok(yoursLabel(gpu).includes("GTX 650"));
  assert.equal(result.overall, RESULT.MAY_NOT_RUN);
});

test("empty GPU input is accepted; that part alone shows 'Not provided'", () => {
  const values = form("NVIDIA", "   ");
  assert.equal(validatePc(values).gpuModel, undefined, "an empty GPU must not block saving");
  for (const slug of GAMES) {
    const { result } = runFlow(values, slug);
    const gpu = result.components.minimum.gpu;
    assert.equal(gpu.status, "missing");
    assert.equal(yoursLabel(gpu), "Not provided");
    assert.ok(yoursLabel(result.components.minimum.cpu).includes("Core i5-8400"), "CPU still shown");
  }
});

test("a stored profile without a GPU model still loads (older complete profiles also load)", () => {
  clearPc();
  savePc({ ...normalizePc(form("NVIDIA", "GTX 1060")), gpuModel: "" });
  assert.ok(loadPc());
  clearPc();
  savePc(normalizePc(form("NVIDIA", "GTX 1060")));
  assert.equal(loadPc().gpuModel, "GTX 1060");
  clearPc();
  localStorage.setItem("ghi.pcSpecs.v1", "{not json");
  assert.equal(loadPc(), null, "corrupt data is ignored");
});

test("CPU, RAM, storage and OS comparisons still work through the full flow", () => {
  const ok = runFlow(form("NVIDIA", "GTX 1060", { cpuCores: "6", cpuGhz: "2.8", gpuVramMb: "6144" }), "stardew-valley").result;
  assert.equal(ok.overall, RESULT.CAN_RUN);
  const low = runFlow(form("NVIDIA", "GTX 1060", { ramGb: "4", storageFreeGb: "10", os: "Linux", gpuVramMb: "6144" }), "war-thunder").result;
  assert.equal(low.overall, RESULT.MAY_NOT_RUN);
  assert.ok(low.failures.some((f) => f.component === "storage"));
  const win = runFlow(form("NVIDIA", "GTX 1060", { ramGb: "2", gpuVramMb: "6144" }), "war-thunder").result;
  assert.ok(win.failures.some((f) => f.component === "ram"));
  const other = runFlow(form("NVIDIA", "GTX 1060", { os: "Other" }), "stardew-valley").result;
  assert.equal(other.overall, RESULT.INSUFFICIENT);
  for (const c of COMPONENTS) assert.ok(ok.components.minimum[c], c);
});
