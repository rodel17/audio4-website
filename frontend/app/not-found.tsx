import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <span className="display text-8xl text-brand">404</span>
      <h1 className="display mt-4 text-4xl">Page not found</h1>
      <p className="mt-4 text-neutral-600">The page or item you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/products" className="btn">
          Browse products
        </Link>
        <Link href="/contact" className="btn btn-dark">
          Contact sales
        </Link>
      </div>
    </section>
  );
}
