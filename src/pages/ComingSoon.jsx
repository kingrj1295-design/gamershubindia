import { Link } from "react-router-dom";
export default function ComingSoon({ title, phase }) {
  return (
    <section className="wrap page">
      <h1>{title}</h1>
      <p className="muted">{phase ? `This feature is not built yet. It is planned for ${phase}.` : "This page does not exist."}</p>
      <Link className="btn" to="/">Back to Home</Link>
    </section>
  );
}
