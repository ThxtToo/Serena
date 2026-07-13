import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-serif font-bold text-primary">404</h1>
        <h2 className="text-2xl font-medium text-muted-foreground">Página no encontrada</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          La página que está buscando no existe o ha sido movida.
        </p>
        <div className="pt-6">
          <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6 py-2">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
