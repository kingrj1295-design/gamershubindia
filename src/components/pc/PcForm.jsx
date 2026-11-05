import { useState } from "react";
import { EMPTY_PC, validatePc, normalizePc } from "../../lib/pcStorage.js";

const RAM = [4, 8, 12, 16, 32, 64];
const VRAM = [1, 2, 3, 4, 6, 8, 10, 12, 16, 24];
const OS = ["Windows 10", "Windows 11", "Linux", "Other"];

function Field({ id, label, hint, error, children }) {
  return (
    <div className="pcx-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <small className="pcx-error" id={`${id}-err`} role="alert">{error}</small> : hint ? <small className="muted">{hint}</small> : null}
    </div>
  );
}

export default function PcForm({ initial, onSave, onCancel }) {
  const [pc, setPc] = useState({ ...EMPTY_PC, ...(initial ?? {}) });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const change = (key) => (e) => {
    const next = { ...pc, [key]: e.target.value };
    setPc(next);
    if (submitted) setErrors(validatePc(next));
  };
  const aria = (key) => ({ "aria-invalid": errors[key] ? "true" : undefined, "aria-describedby": errors[key] ? `pcx-${key}-err` : undefined });

  const submit = (e) => {
    e.preventDefault();
    const found = validatePc(pc);
    setErrors(found);
    setSubmitted(true);
    if (Object.keys(found).length === 0) onSave(normalizePc(pc));
  };

  return (
    <form className="pcx-form" onSubmit={submit} noValidate>
      <fieldset>
        <legend>Processor (CPU)</legend>
        <div className="pcx-grid">
          <Field id="pcx-cpuBrand" label="Brand">
            <select id="pcx-cpuBrand" value={pc.cpuBrand} onChange={change("cpuBrand")}>
              <option>Intel</option><option>AMD</option><option>Other</option>
            </select>
          </Field>
          <Field id="pcx-cpuModel" label="Processor model" error={errors.cpuModel} hint="Example: Core i5-8400, Ryzen 5 3600">
            <input id="pcx-cpuModel" type="text" value={pc.cpuModel} onChange={change("cpuModel")} maxLength={60} autoComplete="off" {...aria("cpuModel")} />
          </Field>
          <Field id="pcx-cpuCores" label="Cores (optional)" error={errors.cpuCores} hint="Helps with games that list only cores and speed">
            <input id="pcx-cpuCores" type="number" inputMode="numeric" min="1" max="128" value={pc.cpuCores} onChange={change("cpuCores")} {...aria("cpuCores")} />
          </Field>
          <Field id="pcx-cpuGhz" label="Clock speed in GHz (optional)" error={errors.cpuGhz} hint="Example: 3.2">
            <input id="pcx-cpuGhz" type="number" inputMode="decimal" step="0.1" min="0.5" max="7" value={pc.cpuGhz} onChange={change("cpuGhz")} {...aria("cpuGhz")} />
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Graphics card (GPU)</legend>
        <div className="pcx-grid">
          <Field id="pcx-gpuBrand" label="Brand">
            <select id="pcx-gpuBrand" value={pc.gpuBrand} onChange={change("gpuBrand")}>
              <option>NVIDIA</option><option>AMD</option><option>Intel</option>
            </select>
          </Field>
          <Field id="pcx-gpuModel" label="Graphics card model" error={errors.gpuModel} hint="Example: GTX 1060, RTX 3060 Ti, RX 580">
            <input id="pcx-gpuModel" type="text" value={pc.gpuModel} onChange={change("gpuModel")} maxLength={60} autoComplete="off" {...aria("gpuModel")} />
          </Field>
          <Field id="pcx-gpuVramMb" label="Video memory (optional)" hint="Used when a game lists only video memory">
            <select id="pcx-gpuVramMb" value={pc.gpuVramMb} onChange={change("gpuVramMb")}>
              <option value="">Not sure</option>
              {VRAM.map((g) => <option key={g} value={g * 1024}>{g} GB</option>)}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Memory and system</legend>
        <div className="pcx-grid">
          <Field id="pcx-ramGb" label="Memory (RAM)" error={errors.ramGb}>
            <select id="pcx-ramGb" value={pc.ramGb} onChange={change("ramGb")} {...aria("ramGb")}>
              <option value="">Not provided</option>
              {RAM.map((g) => <option key={g} value={g}>{g} GB</option>)}
            </select>
          </Field>
          <Field id="pcx-os" label="Operating system" error={errors.os}>
            <select id="pcx-os" value={pc.os} onChange={change("os")} {...aria("os")}>
              <option value="">Not provided</option>
              {OS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Storage</legend>
        <div className="pcx-grid">
          <Field id="pcx-storageFreeGb" label="Free space in GB" error={errors.storageFreeGb}>
            <input id="pcx-storageFreeGb" type="number" inputMode="decimal" min="0" value={pc.storageFreeGb} onChange={change("storageFreeGb")} {...aria("storageFreeGb")} />
          </Field>
          <div className="pcx-field">
            <span className="pcx-label" id="pcx-type-label">Drive type where the game will be installed</span>
            <div className="pcx-radios" role="radiogroup" aria-labelledby="pcx-type-label">
              {["SSD", "HDD"].map((t) => (
                <label key={t} className="pcx-radio">
                  <input type="radio" name="storageType" value={t} checked={pc.storageType === t} onChange={change("storageType")} /> {t}
                </label>
              ))}
            </div>
            {errors.storageType && <small className="pcx-error" role="alert">{errors.storageType}</small>}
          </div>
        </div>
      </fieldset>

      {errors.form && <p className="pcx-error" role="alert">{errors.form}</p>}
      <div className="row">
        <button type="submit" className="btn">Save my PC</button>
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}
      </div>
      <p className="muted pcx-small">Fill in what you know. Empty boxes are fine: every part is checked on its own, and the result tells you what extra detail would make it more accurate.</p>
      <p className="muted pcx-small">Your specs are saved only in this browser. No account or personal information is needed, and nothing is sent anywhere.</p>
    </form>
  );
}
