
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pago, Deudor } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SearchIcon } from "lucide-react";

const HistorialPagos = ({ pagos, deudores }: { pagos: Pago[], deudores: Deudor[] }) => {
  const [search, setSearch] = useState("");
  const [filterDeudor, setFilterDeudor] = useState("todos");

  const formatFecha = (fechaStr: string) => {
    try {
      return format(new Date(fechaStr), "dd/MM/yyyy", { locale: es });
    } catch (error) {
      return fechaStr;
    }
  };

  const getNombreDeudor = (deudorId: string) => {
    const deudor = deudores.find(d => d.id === deudorId);
    return deudor ? deudor.nombre : "Deudor no encontrado";
  };

  const filteredPagos = pagos.filter(pago => {
    const nombreDeudor = getNombreDeudor(pago.deudor_id).toLowerCase();
    const searchMatch = nombreDeudor.includes(search.toLowerCase());
    const deudorMatch = filterDeudor === "todos" || pago.deudor_id === filterDeudor;
    return searchMatch && deudorMatch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Pagos</CardTitle>
        <CardDescription>Registro completo de pagos recibidos</CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre de deudor..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterDeudor} onValueChange={setFilterDeudor}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por deudor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los deudores</SelectItem>
              {deudores.map((deudor) => (
                <SelectItem key={deudor.id} value={deudor.id}>
                  {deudor.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            {filteredPagos.map((pago) => (
              <TableRow key={pago.id}>
                <TableCell>{formatFecha(pago.fecha_pago)}</TableCell>
                <TableCell className="font-medium">{getNombreDeudor(pago.deudor_id)}</TableCell>
                <TableCell>${pago.monto_pagado.toFixed(2)}</TableCell>
                <TableCell>
                  <span className="capitalize">{pago.metodo_pago}</span>
                </TableCell>
                <TableCell>{pago.comentario || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HistorialPagos;
