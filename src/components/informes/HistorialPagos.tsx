
import { Deudor, Pago } from "@/lib/supabase";
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

interface HistorialPagosProps {
  pagos: Pago[];
  deudores: Deudor[];
}

const HistorialPagos = ({ pagos, deudores }: HistorialPagosProps) => {
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
        <CardTitle>Historial de Pagos</CardTitle>
        <CardDescription>
          Registro histórico de todos los pagos recibidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Deudor</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Comentario</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagos.map((pago) => {
              const deudor = deudores.find(d => d.id === pago.deudor_id);
              return (
                <TableRow key={pago.id}>
                  <TableCell>{formatFecha(pago.fecha_pago)}</TableCell>
                  <TableCell className="font-medium">
                    {deudor ? deudor.nombre : "Deudor no encontrado"}
                  </TableCell>
                  <TableCell>${pago.monto_pagado.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="capitalize">{pago.metodo_pago}</span>
                  </TableCell>
                  <TableCell>{pago.comentario || "-"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HistorialPagos;
