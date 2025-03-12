
import { ResumenEstadisticas } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSignIcon, CreditCardIcon, ArrowUpIcon } from "lucide-react";

interface EstadisticasCardsProps {
  estadisticas: ResumenEstadisticas;
}

const EstadisticasCards = ({ estadisticas }: EstadisticasCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Préstamos Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2 text-blue-500" />
            <div className="text-2xl font-bold">
              {estadisticas.total_prestamos_activos}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monto Total Activo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CircleDollarSignIcon className="h-5 w-5 mr-2 text-green-500" />
            <div className="text-2xl font-bold">
              ${estadisticas.monto_total_activo.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Intereses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <ArrowUpIcon className="h-5 w-5 mr-2 text-orange-500" />
            <div className="text-2xl font-bold">
              ${estadisticas.total_intereses.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstadisticasCards;
