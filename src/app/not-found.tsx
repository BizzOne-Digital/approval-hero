import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-glow opacity-20" />
      <div className="text-center relative z-10 px-4">
        <h1 className="font-display text-8xl md:text-9xl font-bold text-electric/20 mb-4">404</h1>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Road Not Found</h2>
        <p className="text-ice-blue mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
