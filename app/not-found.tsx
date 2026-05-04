import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page-shell not-found-shell">
      <div className="not-found-card">
        <h1>Page not found</h1>
        <p>Sorry, the page you are looking for doesn&apos;t exist yet.</p>
        <Link href="/" className="primary-button">
          Return home
        </Link>
      </div>
    </main>
  );
}
