import { Link } from "react-router-dom";
import { RESULT, COMPONENTS, yoursLabel } from "../../lib/compat/index.js";

const LABEL = { cpu: "Processor (CPU)", gpu: "Graphics card (GPU)", ram: "Memory (RAM)", storage: "Storage", os: "Operating system" };
const STATUS = {
  meets: { text: "Meets", icon: "\u2713" },
  below: { text: "Below", icon: "\u2715" },
  unknown: { text: "Can't compare", icon: "?" },
  missing: { text: "Not provided", icon: "\u2013" },
  unavailable: { text: "Not listed", icon: "\u2013" },
};
const OVERALL_CLASS = {
  [RESULT.CAN_RUN]: "ok",
  [RESULT.RECOMMENDED]: "great",
  [RESULT.MAY_NOT_RUN]: "bad",
  [RESULT.PARTIAL]: "partial",
  [RESULT.INSUFFICIENT]: "warn",
};

function Badge({ status }) {
  const s = STATUS[status] ?? STATUS.unavailable;
  return <span className={`pcx-badge pcx-${status ?? "unavailable"}`}><span aria-hidden="true">{s.icon}</span> {s.text}</span>;
}

function TierRow({ label, cmp, listed }) {
  if (!listed) return <div className="pcx-tier"><b>{label}</b><span className="muted">Not listed on Steam for this game.</span></div>;
  if (!cmp) return null;
  return (
    <div className="pcx-tier">
      <div className="row between"><b>{label}</b><Badge status={cmp.status} /></div>
      <dl>
        <div><dt>You</dt><dd>{yoursLabel(cmp)}</dd></div>
        <div><dt>Game lists</dt><dd>{cmp.required || "Not listed"}</dd></div>
      </dl>
      {cmp.note && <p className="muted pcx-small">{cmp.note}</p>}
    </div>
  );
}

export default function ResultDashboard({ game, req, platformKey, result, onEdit }) {
  const platform = req?.[platformKey];
  const hasComponents = Boolean(result.components?.minimum?.cpu);
  return (
    <div className="pcx-result" aria-live="polite">
      <div className={`pcx-banner pcx-b-${OVERALL_CLASS[result.overall]}`}>
        <p className="pcx-kicker">{game.title}</p>
        <h2>{result.headline}</h2>
        <p>{result.reason}</p>
        {hasComponents && result.failures.length === 0 && result.overall !== RESULT.CAN_RUN && result.overall !== RESULT.RECOMMENDED && (
          <p className="pcx-small">Each part is shown below. "Can't compare" needs a manual check, and "Not provided" means you left that detail empty.</p>
        )}
      </div>

      {result.failures.length > 0 && (
        <div className="card pcx-fail">
          <h3>Below the game's minimum</h3>
          <ul>
            {result.failures.map((f) => (
              <li key={f.component}><b>{LABEL[f.component]}:</b> you have {yoursLabel(f)}, the game lists {f.required}.{f.note ? ` ${f.note}` : ""}</li>
            ))}
          </ul>
        </div>
      )}

      {result.improvements?.length > 0 && (
        <div className="card pcx-improve">
          <h3>To make this result more accurate</h3>
          <ul>
            {result.improvements.map((i) => <li key={i.component}>{i.text}</li>)}
          </ul>
          <button type="button" className="btn ghost" onClick={onEdit}>Add these details</button>
        </div>
      )}

      {hasComponents && (
        <div className="pcx-comps">
          {COMPONENTS.map((c) => (
            <article key={c} className={`card pcx-comp pcx-c-${result.components.minimum[c]?.status ?? "unavailable"}`}>
              <h3>{LABEL[c]}</h3>
              <TierRow label="Minimum" cmp={result.components.minimum[c]} listed />
              <TierRow label="Recommended" cmp={result.components.recommended[c]} listed={Boolean(platform?.recommended)} />
            </article>
          ))}
        </div>
      )}

      <div className="card pcx-meta">
        <p><b>Requirements used:</b> {platformKey === "linux" ? "Linux" : "Windows"} list from the <a href={req?.source?.url} target="_blank" rel="noopener noreferrer">official Steam store page</a>, checked on {req?.source?.checkedOn}.</p>
        {result.assumptions?.map((n) => <p key={n} className="pcx-small">{n}</p>)}
        {req?.notes?.map((n) => <p key={n} className="muted pcx-small">{n}</p>)}
        <p className="pcx-small muted">This is an estimate, not a guarantee. It does not predict frame rate or real performance. CPU and graphics card names are compared by product series, not by benchmark scores, and anything that cannot be compared is marked instead of guessed. Drivers, background programs and settings also matter.</p>
        <div className="row">
          <Link className="btn ghost" to={`/games/${game.slug}`}>Open {game.title} page</Link>
          <button type="button" className="btn ghost" onClick={onEdit}>Edit my PC and check again</button>
        </div>
      </div>
    </div>
  );
}
