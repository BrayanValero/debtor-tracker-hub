
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Deudor } from "@/lib/supabase";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PagosProximosProps {
  pagosProximos: Array<Deudor & { proximo_pago: string }>;
}

const PagosProximos = ({ pagosProximos }: PagosProximosProps) => {
  const formatFecha = (fechaStr: string) => {
    try {
      return format(new Date(fechaStr), "dd 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      return fechaStr;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pagos Próximos</CardTitle>
        <CardDescription>
          Deudores con pagos programados en los próximos 7 días
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pagosProximos.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No hay pagos programados para los próximos días</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deudor</TableHead>
                <TableHead>Fecha de Pago</TableHead>
                <TableHead>Monto Prestado</TableHead>
                <TableHead>Saldo Pendiente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagosProximos.map((deudor) => (
                <TableRow key={deudor.id}>
                  <TableCell className="font-medium">{deudor.nombre}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatFecha(deudor.proximo_pago)}
                    </div>
                  </TableCell>
                  <TableCell>${deudor.monto_prestado.toFixed(2)}</TableCell>
                  <TableCell>${deudor.saldo_pendiente?.toFixed(2) || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PagosProximos;
