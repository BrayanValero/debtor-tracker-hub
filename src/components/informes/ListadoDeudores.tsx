
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
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ListadoDeudoresProps {
  deudores: Deudor[];
}

const ListadoDeudores = ({ deudores }: ListadoDeudoresProps) => {
  const formatFecha = (fechaStr: string) => {
    try {
      return format(new Date(fechaStr), "dd 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      return fechaStr;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Deudores</CardTitle>
        <CardDescription>
          Información completa de todos los deudores registrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Préstamo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Interés (%)</TableHead>
              <TableHead>Interés Acumulado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Saldo Pendiente</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deudores.map((deudor) => (
              <TableRow key={deudor.id}>
                <TableCell className="font-medium">{deudor.nombre}</TableCell>
                <TableCell>${deudor.monto_prestado.toFixed(2)}</TableCell>
                <TableCell>{formatFecha(deudor.fecha_prestamo)}</TableCell>
                <TableCell>{deudor.tasa_interes.toFixed(2)}%</TableCell>
                <TableCell>${deudor.interes_acumulado.toFixed(2)}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    deudor.estado === 'activo' ? 'bg-green-100 text-green-800' :
                    deudor.estado === 'vencido' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {deudor.estado.charAt(0).toUpperCase() + deudor.estado.slice(1)}
                  </div>
                </TableCell>
                <TableCell>${deudor.saldo_pendiente?.toFixed(2) || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ListadoDeudores;
