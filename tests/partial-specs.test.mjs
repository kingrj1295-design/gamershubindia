// Optional / missing PC details must never block the dashboard. Every case goes through the real path:
// form values -> validatePc -> normalizePc -> savePc -> loadPc -> evaluateForPc -> yoursLabel.
import test from "node:test";
import assert from "node:assert/strict";
import { requirements } from "../src/data/requirements.js";
import { evaluateForPc, yoursLabel, RESULT, COMPONENTS } from "../src/lib/compat/index.js";
import { validatePc, normalizePc, savePc, loadPc, clearPc, EMPTY_PC } from "../src/lib/pcStorage.js";

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const GAMES = Object.keys(requirements);
const FULL = { ...EMPTY_PC, cpuBrand: "Intel", cpuModel: "Core i5-8400", gpuBrand: "NVIDIA", gpuModel: "GTX 1060",
  ramGb: "16", os: "Windows 10", storageFreeGb: "300", storageType: "SSD" };

function run(values, slug) {
  clearPc();
  assert.deepEqual(validatePc(values), {}, "form must accept these values");
  savePc(normalizePc(values));
  const pc = loadPc();
  assert.ok(pc, "profile must load back");
  return evaluateForPc(pc, requirements[slug]);
}

// The dashboard needs: an overall result, a headline, and one entry per component with a status and a label.
function assertDashboardRenders(result, label) {
  assert.ok(Object.values(RESULT).includes(result.overall), label);
  assert.ok(result.headline && result.reason, label);
  for (const c of COMPONENTS) {
    const cmp = result.components.minimum[c];
    assert.ok(cmp, `${label}: component ${c} present`);
    assert.ok(["meets", "below", "unknown", "missing", "unavailable"].includes(cmp.status), `${label}: ${c} status`);
    assert.equal(typeof yoursLabel(cmp), "string");
  }
  assert.ok(Array.isArray(result.improvements) && Array.isArray(result.failures));
}

test("GPU entered, VRAM missing: GPU alone is 'Can't compare', everything else is still assessed", () => {
  for (const slug of GAMES) {
    const r = run({ ...FULL, gpuVramMb: "" }, slug);
    assertDashboardRenders(r, slug);
    const gpu = r.components.minimum.gpu;
    assert.ok(yoursLabel(gpu).includes("GTX 1060"), `${slug}: GPU name kept`);
    assert.notEqual(yoursLabel(gpu), "Not provided");
    for (const c of ["cpu", "ram", "storage", "os"]) assert.ok(["meets", "unknown"].includes(r.components.minimum[c].status), `${slug} ${c}`);
  }
  const cs2 = run({ ...FULL, gpuVramMb: "" }, "counter-strike-2");
  assert.equal(cs2.components.minimum.gpu.status, "unknown");
  assert.equal(cs2.overall, RESULT.PARTIAL);
  assert.ok(cs2.improvements.some((i) => i.component === "gpu" && /video memory/i.test(i.text)));
  assert.equal(cs2.checked.includes("ram"), true);
});

test("CPU entered, optional CPU details (cores, clock) missing", () => {
  for (const slug of GAMES) {
    const r = run({ ...FULL, cpuCores: "", cpuGhz: "", gpuVramMb: "6144" }, slug);
    assertDashboardRenders(r, slug);
    assert.ok(yoursLabel(r.components.minimum.cpu).includes("Core i5-8400"), `${slug}: CPU name kept`);
  }
  const stardew = run({ ...FULL, cpuCores: "", cpuGhz: "", gpuVramMb: "6144" }, "stardew-valley");
  assert.equal(stardew.components.minimum.cpu.status, "unknown");
  assert.equal(stardew.overall, RESULT.PARTIAL);
  assert.ok(stardew.improvements.some((i) => i.component === "cpu" && /cores and clock/i.test(i.text)));
  // Adding the optional details turns it into a full result.
  const full = run({ ...FULL, cpuCores: "6", cpuGhz: "2.8", gpuVramMb: "6144" }, "stardew-valley");
  assert.equal(full.overall, RESULT.CAN_RUN);
});

test("RAM entered, storage missing", () => {
  const values = { ...FULL, storageFreeGb: "", storageType: "", gpuVramMb: "6144", cpuCores: "6", cpuGhz: "2.8" };
  for (const slug of GAMES) assertDashboardRenders(run(values, slug), slug);
  const r = run(values, "stardew-valley");
  assert.equal(r.components.minimum.storage.status, "missing");
  assert.equal(yoursLabel(r.components.minimum.storage), "Not provided");
  assert.equal(r.components.minimum.ram.status, "meets");
  assert.equal(r.overall, RESULT.CAN_RUN, "essential parts are fine, only storage was not checked");
  assert.match(r.reason, /storage/);
  assert.ok(r.improvements.some((i) => i.component === "storage"));
});

test("CPU and GPU entered, RAM missing", () => {
  const values = { ...FULL, ramGb: "", gpuVramMb: "6144", cpuCores: "6", cpuGhz: "2.8" };
  for (const slug of GAMES) assertDashboardRenders(run(values, slug), slug);
  const r = run(values, "stardew-valley");
  assert.equal(r.components.minimum.ram.status, "missing");
  assert.equal(r.components.minimum.cpu.status, "meets");
  assert.equal(r.components.minimum.gpu.status, "meets");
  assert.equal(r.overall, RESULT.PARTIAL);
  assert.ok(r.improvements.some((i) => i.component === "ram"));
  assert.ok(r.checked.includes("cpu") && r.checked.includes("gpu"));
});

test("only some specs entered", () => {
  // only RAM + free storage
  const a = run({ ...EMPTY_PC, ramGb: "16", storageFreeGb: "100" }, "war-thunder");
  assertDashboardRenders(a, "ram+storage");
  assert.equal(a.components.minimum.cpu.status, "missing");
  assert.equal(a.components.minimum.gpu.status, "missing");
  assert.equal(a.overall, RESULT.PARTIAL);
  // only a CPU: genuinely not enough to assess
  const b = run({ ...EMPTY_PC, cpuModel: "Core i5-8400" }, "counter-strike-2");
  assertDashboardRenders(b, "cpu only");
  assert.equal(b.overall, RESULT.INSUFFICIENT);
  assert.ok(yoursLabel(b.components.minimum.cpu).includes("Core i5-8400"));
  // only an OS (no hardware at all)
  const c = run({ ...EMPTY_PC, os: "Linux" }, "stardew-valley");
  assertDashboardRenders(c, "os only");
  assert.equal(c.overall, RESULT.INSUFFICIENT);
  // a clear failure is reported even when most details are missing
  const d = run({ ...EMPTY_PC, ramGb: "2" }, "war-thunder");
  assert.equal(d.overall, RESULT.MAY_NOT_RUN);
  assert.equal(d.failures[0].component, "ram");
  assert.match(d.reason, /Not checked/);
});

test("all optional fields left blank (only the main fields filled)", () => {
  const values = { ...FULL, cpuCores: "", cpuGhz: "", gpuVramMb: "" };
  for (const slug of GAMES) {
    const r = run(values, slug);
    assertDashboardRenders(r, slug);
    assert.ok(yoursLabel(r.components.minimum.cpu).includes("Core i5-8400"));
    assert.ok(yoursLabel(r.components.minimum.gpu).includes("GTX 1060"));
    assert.notEqual(r.overall, RESULT.INSUFFICIENT, `${slug}: enough information for a useful assessment`);
  }
  // Name-based listings are fully assessed without any optional detail.
  const wt = run(values, "war-thunder");
  assert.equal(wt.components.minimum.gpu.status, "meets");
});

test("an empty form is the only thing the form refuses", () => {
  assert.ok(validatePc({ ...EMPTY_PC }).form);
  assert.equal(validatePc({ ...EMPTY_PC, ramGb: "8" }).form, undefined);
  assert.ok(validatePc({ ...FULL, cpuCores: "0" }).cpuCores, "bad optional values are still format-checked");
});

test("operating system not provided: Windows list is used and the result says so", () => {
  const r = run({ ...FULL, os: "", gpuVramMb: "6144", cpuCores: "6", cpuGhz: "2.8" }, "stardew-valley");
  assertDashboardRenders(r, "no os");
  assert.equal(r.components.minimum.os.status, "missing");
  assert.ok(r.assumptions.some((a) => /Windows requirement list/.test(a)));
  assert.equal(r.overall, RESULT.CAN_RUN);
});

test("CPU name missing but cores and clock given: generic CPU listings still compare", () => {
  const r = run({ ...FULL, cpuModel: "", cpuCores: "4", cpuGhz: "3.0", gpuVramMb: "6144" }, "stardew-valley");
  assert.equal(r.components.minimum.cpu.status, "meets");
  assert.match(yoursLabel(r.components.minimum.cpu), /4 cores/);
});
