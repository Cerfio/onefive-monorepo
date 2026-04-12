import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary_subtle p-6">
      <div className="text-center">
        <p className="text-display-md font-bold text-brand-primary">404</p>
        <h1 className="mt-2 text-xl font-semibold text-primary">Page introuvable</h1>
        <p className="mt-2 text-sm text-tertiary">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-solid_hover"
        >
          Retour au dashboard
        </Link>
      </div>
    </main>
  );
}
