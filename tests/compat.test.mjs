import test from "node:test";
import assert from "node:assert/strict";
import { evaluate, RESULT, parseCpu, parseGpu } from "../src/lib/compat/index.js";

// Fake requirement used ONLY for tests. Not real game data.
const req = {
  minimum: { cpu: "Intel Core i5-4460 / AMD Ryzen 3 1200", gpu: "NVIDIA GeForce GTX 960 / AMD Radeon RX 470", ramGb: 8, storageGb: 50, os: ["Windows 10 64-bit"] },
  recommended: { cpu: "Intel Core i7-8700 / AMD Ryzen 5 3600", gpu: "NVIDIA GeForce GTX 1060 / AMD Radeon RX 580", ramGb: 16, storageGb: 50, storageType: "SSD", os: ["Windows 10 64-bit"] },
};
const good = { cpuBrand: "Intel", cpuModel: "Core i7-9700K", gpuBrand: "NVIDIA", gpuModel: "RTX 3060 Ti", ramGb: 16, os: "Windows 11", storageFreeGb: 200, storageType: "SSD" };

test("parsers", () => {
  assert.deepEqual(parseCpu("Intel Core i5-8400"), { vendor: "intel", tier: 5, gen: 8, mobile: false });
  assert.equal(parseCpu("Intel Core i7-12700K").gen, 12);
  assert.equal(parseCpu("Core i5-1135G7"), null);
  assert.equal(parseCpu("AMD Ryzen 5 7600X").gen, 7);
  assert.equal(parseGpu("GeForce GTX 1660 Super").gen, 11);
  assert.equal(parseGpu("RTX 4070 Ti").tier, 70.5);
  assert.equal(parseGpu("Radeon RX 6600 XT").gen, 5);
  assert.equal(parseGpu("Intel UHD 630"), null);
});
test("strong PC -> recommended", () => assert.equal(evaluate(good, req).overall, RESULT.RECOMMENDED));
test("HDD fails the SSD recommendation but still can run", () => {
  const r = evaluate({ ...good, storageType: "HDD" }, req);
  assert.equal(r.overall, RESULT.CAN_RUN);
});
test("low RAM -> may not run and lists failure", () => {
  const r = evaluate({ ...good, ramGb: 4 }, req);
  assert.equal(r.overall, RESULT.MAY_NOT_RUN);
  assert.equal(r.failures[0].component, "ram");
});
test("old CPU/GPU -> below", () => {
  const r = evaluate({ ...good, cpuModel: "Core i3-3220", gpuModel: "GTX 650" }, req);
  assert.equal(r.overall, RESULT.MAY_NOT_RUN);
  assert.deepEqual(r.failures.map((f) => f.component).sort(), ["cpu", "gpu"]);
});
test("mid PC meets minimum only -> can run", () => {
  const r = evaluate({ ...good, cpuModel: "Core i5-6500", gpuModel: "GTX 970", ramGb: 8 }, req);
  assert.equal(r.overall, RESULT.CAN_RUN);
});
test("cross-brand CPU is 'Can't compare' (never guessed) but the other parts are still assessed", () => {
  const r = evaluate({ ...good, cpuBrand: "Intel", cpuModel: "Core i5-8400" }, { minimum: { cpu: "AMD Ryzen 5 1600", gpu: "GTX 960", ramGb: 8, storageGb: 10, os: ["Windows 10"] } });
  assert.equal(r.components.minimum.cpu.status, "unknown");
  assert.equal(r.overall, RESULT.PARTIAL);
});
test("missing requirement data -> insufficient", () => {
  assert.equal(evaluate(good, { minimum: { ramGb: 8 } }).overall, RESULT.INSUFFICIENT);
  assert.equal(evaluate(good, null).overall, RESULT.INSUFFICIENT);
});
test("a known failure still wins even when other data is missing", () => {
  const r = evaluate({ ...good, ramGb: 4 }, { minimum: { ramGb: 8 } });
  assert.equal(r.overall, RESULT.MAY_NOT_RUN);
});
test("OS: Linux on a Windows-only game is below; Windows 10 on a Windows 11 game is below", () => {
  assert.equal(evaluate({ ...good, os: "Linux" }, req).components.minimum.os.status, "below");
  const w11 = { minimum: { ...req.minimum, os: ["Windows 11"] } };
  assert.equal(evaluate({ ...good, os: "Windows 10" }, w11).components.minimum.os.status, "below");
});
test("storage too small", () => {
  assert.equal(evaluate({ ...good, storageFreeGb: 10 }, req).failures[0].component, "storage");
});

test("generic CPU wording uses the cores and clock the user typed", () => {
  const r = { minimum: { cpu: "Dual-Core 2.2 GHz", cpuSpec: [{ cores: 2, ghz: 2.2 }], gpu: "GTX 660", ramGb: 4, storageGb: 10, os: ["Windows 10"] } };
  assert.equal(evaluate({ ...good, cpuCores: 4, cpuGhz: 3.2 }, r).components.minimum.cpu.status, "meets");
  assert.equal(evaluate({ ...good, cpuCores: 2, cpuGhz: 1.8 }, r).components.minimum.cpu.status, "below");
  assert.equal(evaluate({ ...good }, r).components.minimum.cpu.status, "unknown");
});
test("generic GPU wording uses VRAM", () => {
  const r = { minimum: { cpu: "Intel Core i5 750 or higher", gpu: "Video card must be 1 GB or more", gpuSpec: { vramMb: 1024 }, ramGb: 8, storageGb: 10, os: ["Windows 10"] } };
  assert.equal(evaluate({ ...good, gpuVramMb: 8192 }, r).overall, RESULT.CAN_RUN);
  assert.equal(evaluate({ ...good, gpuVramMb: 512 }, r).overall, RESULT.MAY_NOT_RUN);
  assert.equal(evaluate({ ...good }, r).overall, RESULT.PARTIAL); // VRAM not given: GPU is 'Can't compare', other parts still assessed
});
test("comma-separated alternatives and 'GeForce 1060' wording", () => {
  const r = { minimum: { cpu: "Intel Core i5-4460", gpu: "Nvidia GeForce 1060 and higher, Radeon RX 570 and higher", ramGb: 4, storageGb: 10, os: ["Windows 10"] } };
  assert.equal(evaluate({ ...good, gpuBrand: "AMD", gpuModel: "RX 6600" }, r).components.minimum.gpu.status, "meets");
  assert.equal(evaluate({ ...good, gpuBrand: "NVIDIA", gpuModel: "GTX 950" }, r).components.minimum.gpu.status, "below");
});

import { requirements } from "../src/data/requirements.js";
import { evaluateForPc } from "../src/lib/compat/index.js";
const pcMid = { cpuBrand: "Intel", cpuModel: "Core i5-8400", cpuCores: 6, cpuGhz: 2.8, gpuBrand: "NVIDIA", gpuModel: "GTX 1060", gpuVramMb: 6144, ramGb: 16, os: "Windows 10", storageFreeGb: 300, storageType: "SSD" };

test("real data: every game has source info and numeric RAM/storage", () => {
  for (const [slug, r] of Object.entries(requirements)) {
    assert.ok(r.source.url.startsWith("https://store.steampowered.com/app/"), slug);
    assert.match(r.source.checkedOn, /^\d{4}-\d{2}-\d{2}$/);
    for (const k of ["windows", "linux"]) {
      const m = r[k]?.minimum;
      assert.ok(m, `${slug} ${k}`);
      assert.equal(typeof m.ramGb, "number");
      assert.equal(typeof m.storageGb, "number");
    }
  }
});
test("real data: a mid PC on each game", () => {
  const out = Object.fromEntries(Object.keys(requirements).map((s) => [s, evaluateForPc(pcMid, requirements[s]).overall]));
  console.log(JSON.stringify(out));
  assert.equal(out["stardew-valley"], RESULT.CAN_RUN);
  assert.equal(out["war-thunder"], RESULT.CAN_RUN); // recommended CPU is just "Intel Core i5": no model, so it is not guessed
  assert.equal(out["counter-strike-2"], RESULT.CAN_RUN);
});
test("real data: low-end PC fails War Thunder and CS2 on RAM/storage", () => {
  const weak = { ...pcMid, ramGb: 2, storageFreeGb: 10 };
  assert.equal(evaluateForPc(weak, requirements["war-thunder"]).overall, RESULT.MAY_NOT_RUN);
  assert.equal(evaluateForPc(weak, requirements["counter-strike-2"]).overall, RESULT.MAY_NOT_RUN);
});
test("real data: Intel-only listing with an AMD CPU stays 'Can't compare' (partial assessment)", () => {
  const amd = { ...pcMid, cpuBrand: "AMD", cpuModel: "Ryzen 5 3600" };
  const r = evaluateForPc(amd, requirements["counter-strike-2"]);
  assert.equal(r.components.minimum.cpu.status, "unknown");
  assert.equal(r.overall, RESULT.PARTIAL);
});
test("real data: Linux user gets the Linux list; Other OS is insufficient", () => {
  assert.equal(evaluateForPc({ ...pcMid, os: "Linux" }, requirements["stardew-valley"]).overall, RESULT.CAN_RUN);
  assert.equal(evaluateForPc({ ...pcMid, os: "Other" }, requirements["stardew-valley"]).overall, RESULT.INSUFFICIENT);
});
test("Dota 2 legacy GPU wording + cores/clock", () => {
  const r = evaluateForPc(pcMid, requirements["dota-2"]);
  assert.equal(r.components.minimum.gpu.status, "meets");
  assert.equal(r.overall, RESULT.CAN_RUN);
});
