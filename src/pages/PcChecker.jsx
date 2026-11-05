import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { games } from "../data/games.js";
import { requirements } from "../data/requirements.js";
import { evaluateForPc } from "../lib/compat/index.js";
import { loadPc, savePc, clearPc } from "../lib/pcStorage.js";
import PcForm from "../components/pc/PcForm.jsx";
import GamePicker from "../components/pc/GamePicker.jsx";
import ResultDashboard from "../components/pc/ResultDashboard.jsx";
import "../components/pc/pc-checker.css";

function Summary({ pc }) {
  const NP = "Not provided";
  const cpuName = pc.cpuModel ? [pc.cpuBrand, pc.cpuModel].join(" ") : "";
  const gpuName = pc.gpuModel ? [pc.gpuBrand, pc.gpuModel].join(" ") : "";
  const cpu = [cpuName, pc.cpuCores ? `${pc.cpuCores} cores` : "", pc.cpuGhz ? `${pc.cpuGhz} GHz` : ""].filter(Boolean).join(", ") || NP;
  const gpu = [gpuName, pc.gpuVramMb ? `${Number(pc.gpuVramMb) / 1024} GB VRAM` : ""].filter(Boolean).join(", ") || NP;
  const storage = pc.storageFreeGb ? `${pc.storageFreeGb} GB${pc.storageType ? ` (${pc.storageType})` : ""}` : NP;
  const rows = [["CPU", cpu], ["GPU", gpu], ["RAM", pc.ramGb ? `${pc.ramGb} GB` : NP], ["Operating system", pc.os || NP], ["Free storage", storage]];
  return (
    <dl className="pcx-summary">
      {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  );
}

export default function PcChecker() {
  const [savedPc, setSavedPc] = useState(() => loadPc());
  const [editing, setEditing] = useState(() => loadPc() === null);
  const [storageOk, setStorageOk] = useState(true);
  const [params, setParams] = useSearchParams();
  const formRef = useRef(null);
  const resultsRef = useRef(null);

  const slug = params.get("game") || "";
  const game = games.find((g) => g.slug === slug) ?? null;
  const req = game ? requirements[game.slug] ?? null : null;
  const platformKey = savedPc?.os === "Linux" ? "linux" : "windows";
  const result = useMemo(() => (savedPc && game ? evaluateForPc(savedPc, req) : null), [savedPc, game, req]);

  useEffect(() => {
    document.title = "Can my PC run it? | GamersHubIndia";
  }, []);

  useEffect(() => {
    if (slug && savedPc && resultsRef.current) resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    // only when the chosen game changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const onSave = (pc) => {
    setStorageOk(savePc(pc));
    setSavedPc(pc);
    setEditing(false);
  };
  const onEdit = () => {
    setEditing(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };
  const onClear = () => {
    clearPc();
    setSavedPc(null);
    setEditing(true);
  };
  const onSelect = (s) => setParams(s ? { game: s } : {}, { replace: true });

  return (
    <section className="wrap page pcx">
      <h1>Can my PC run it?</h1>
      <p className="muted pcx-lead">Enter your PC once, pick a game, and see how your parts compare with the requirements listed on the game's Steam page. It is an estimate, not a promise of performance.</p>

      <div className="pcx-top">
        <div className="card" ref={formRef}>
          <h2>1. Your PC</h2>
          {editing ? (
            <PcForm initial={savedPc} onSave={onSave} onCancel={savedPc ? () => setEditing(false) : null} />
          ) : (
            <>
              <Summary pc={savedPc} />
              {!storageOk && <p className="pcx-error">Could not save in this browser (private mode?). Your PC is used for this visit only.</p>}
              <div className="row">
                <button type="button" className="btn ghost" onClick={onEdit}>Edit my PC</button>
                <button type="button" className="btn ghost" onClick={onClear}>Clear saved PC</button>
              </div>
              <p className="muted pcx-small">Saved only in this browser.</p>
            </>
          )}
        </div>

        <div className="card">
          <h2>2. Choose a game</h2>
          <GamePicker games={games} requirements={requirements} selected={slug} onSelect={onSelect} />
        </div>
      </div>

      <div ref={resultsRef} className="pcx-results">
        <h2>3. Result</h2>
        {!game && <p className="muted">Choose a game above to see the result.</p>}
        {game && !savedPc && <p className="muted">Save your PC specs to see how {game.title} compares.</p>}
        {game && savedPc && result && (
          <ResultDashboard game={game} req={req} platformKey={platformKey} result={result} onEdit={onEdit} />
        )}
      </div>
    </section>
  );
}
