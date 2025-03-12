
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Pago, Deudor } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, SearchIcon, FilterIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const Pagos = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [deudores, setDeudores] = useState<Deudor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDeudor, setFilterDeudor] = useState("todos");
  const [filterMetodo, setFilterMetodo] = useState("todos");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener lista de deudores
        const { data: deudoresData, error: deudoresError } = await supabase
          .from("deudores")
          .select("*");

        if (deudoresError) {
          throw deudoresError;
        }

        // Obtener lista de pagos
        const { data: pagosData, error: pagosError } = await supabase
          .from("pagos")
          .select("*")
          .order("fecha_pago", { ascending: false });

        if (pagosError) {
          throw pagosError;
        }

        setDeudores(deudoresData as Deudor[]);
        setPagos(pagosData as Pago[]);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para filtrar los pagos
  const filteredPagos = pagos
    .filter(pago => {
      // Filtro por búsqueda (buscamos en el ID del pago)
      if (searchTerm && !pago.id.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro por deudor
      if (filterDeudor !== "todos" && pago.deudor_id !== filterDeudor) {
        return false;
      }
      
      // Filtro por método de pago
      if (filterMetodo !== "todos" && pago.metodo_pago !== filterMetodo) {
        return false;
      }
      
      return true;
    });

  // Función para obtener el nombre del deudor por su ID
  const getNombreDeudor = (deudorId: string) => {
    const deudor = deudores.find(d => d.id === deudorId);
    return deudor ? deudor.nombre : "Deudor no encontrado";
  };

  // Función para formatear la fecha
  const formatFecha = (fechaStr: string) => {
    try {
      return format(new Date(fechaStr), "dd 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      return fechaStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Historial de Pagos</h1>
            <p className="text-muted-foreground mt-1">
              Administra y visualiza todos los pagos recibidos
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => navigate("/pagos/nuevo")}
          >
            Registrar Nuevo Pago
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
            <CardDescription>Refina los resultados según tus necesidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Buscar por ID de pago..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deudor-filter">Filtrar por deudor</Label>
                <Select value={filterDeudor} onValueChange={setFilterDeudor}>
                  <SelectTrigger id="deudor-filter">
                    <SelectValue placeholder="Todos los deudores" />
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
              
              <div className="space-y-2">
                <Label htmlFor="metodo-filter">Filtrar por método de pago</Label>
                <Select value={filterMetodo} onValueChange={setFilterMetodo}>
                  <SelectTrigger id="metodo-filter">
                    <SelectValue placeholder="Todos los métodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los métodos</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-center">
              <p className="text-muted-foreground">Cargando pagos...</p>
            </div>
          </div>
        ) : filteredPagos.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <p className="text-muted-foreground">No se encontraron pagos con los filtros seleccionados</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDeudor('todos');
                    setFilterMetodo('todos');
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Deudor</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Comentario</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPagos.map((pago) => (
                    <TableRow key={pago.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatFecha(pago.fecha_pago)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getNombreDeudor(pago.deudor_id)}
                      </TableCell>
                      <TableCell>
                        ${pago.monto_pagado.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{pago.metodo_pago}</span>
                      </TableCell>
                      <TableCell>
                        {pago.comentario || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/pagos/${pago.id}`)}>
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Pagos;
