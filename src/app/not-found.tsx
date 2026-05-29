import Link from "next/link";

export default function NotFound() {
  return (
    <section className="no-results">
      <h1>Page not found</h1>
      <p>No museum route exists at this address.</p>
      <Link className="primary-link" href="/">Back to museums</Link>
    </section>
  );
}
