
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Deudor } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ListadoDeudores = ({ deudores }: { deudores: Deudor[] }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const formatFecha = (fechaStr: string) => {
    try {
      return format(new Date(fechaStr), "dd/MM/yyyy", { locale: es });
    } catch (error) {
      return fechaStr;
    }
  };

  const filteredDeudores = deudores.filter(
    deudor => deudor.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // Obtener iniciales para avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Deudores</CardTitle>
        <CardDescription>Información detallada de todos los deudores</CardDescription>
        <div className="relative mt-2">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha Préstamo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Interés</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Saldo Pendiente</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeudores.map((deudor) => (
              <TableRow key={deudor.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={deudor.foto_url} alt={deudor.nombre} />
                    <AvatarFallback>{getInitials(deudor.nombre)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{deudor.nombre}</TableCell>
                <TableCell>{formatFecha(deudor.fecha_prestamo)}</TableCell>
                <TableCell>${deudor.monto_prestado.toFixed(2)}</TableCell>
                <TableCell>
                  {deudor.tasa_interes * 100}% 
                  <span className="text-xs text-muted-foreground block">
                    (${deudor.interes_acumulado.toFixed(2)})
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    deudor.estado === 'activo' ? 'bg-green-100 text-green-800' :
                    deudor.estado === 'vencido' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {deudor.estado.charAt(0).toUpperCase() + deudor.estado.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  ${deudor.saldo_pendiente !== undefined ? deudor.saldo_pendiente.toFixed(2) : '0.00'}
                </TableCell>
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
      </CardContent>
    </Card>
  );
};

export default ListadoDeudores;
