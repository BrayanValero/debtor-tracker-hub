
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumenEstadisticas } from "@/lib/supabase";

const EstadisticasCards = ({ estadisticas }: { estadisticas: ResumenEstadisticas }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estadisticas.total_prestamos_activos}</div>
          <p className="text-xs text-muted-foreground">
            préstamos activos
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dinero Prestado</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M16 14v-4a2 2 0 0 0-2-2H8" />
            <path d="M12 14v-1" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${estadisticas.monto_total_activo.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            capital en préstamos activos
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Intereses Acumulados</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${estadisticas.total_intereses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            intereses generados hasta hoy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstadisticasCards;
