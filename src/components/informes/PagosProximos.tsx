
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Deudor } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

type PagoProximo = Deudor & { proximo_pago: string };

const PagosProximos = ({ pagosProximos }: { pagosProximos: PagoProximo[] }) => {
  const navigate = useNavigate();

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
        <CardTitle>Próximos Pagos</CardTitle>
        <CardDescription>Pagos programados para los próximos 7 días</CardDescription>
      </CardHeader>
      <CardContent>
        {pagosProximos.length === 0 ? (
          <div className="flex justify-center py-6">
            <p className="text-muted-foreground">No hay pagos programados para los próximos 7 días</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deudor</TableHead>
                <TableHead>Fecha de Pago</TableHead>
                <TableHead>Monto Préstamo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagosProximos.map((deudor) => (
                <TableRow key={deudor.id}>
                  <TableCell className="font-medium">{deudor.nombre}</TableCell>
                  <TableCell>{formatFecha(deudor.proximo_pago)}</TableCell>
                  <TableCell>${deudor.monto_prestado.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/deudores/${deudor.id}`)}
                    >
                      Ver detalles
                    </Button>
                  </TableCell>
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
