
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DeudorCard from "@/components/DeudorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase, Deudor, Pago } from "@/lib/supabase";
import { PlusCircle, Search, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type FilterState = "todos" | "activo" | "vencido" | "pagado";

const Deudores = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FilterState>("todos");
  const [sortOrder, setSortOrder] = useState<string>("recientes");
  const [deudoresFiltrados, setDeudoresFiltrados] = useState<Deudor[]>([]);

  // Obtener deudores
  const { data: deudores, isLoading: isLoadingDeudores } = useQuery({
    queryKey: ["deudores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deudores")
        .select("*")
        .order("fecha_prestamo", { ascending: false });
      
      if (error) throw error;
      return data as Deudor[];
    }
  });

  // Obtener pagos
  const { data: pagos, isLoading: isLoadingPagos } = useQuery({
    queryKey: ["pagos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagos")
        .select("*");
      
      if (error) throw error;
      return data as Pago[];
    }
  });

  // Filtrar y ordenar deudores cuando cambian los filtros o datos
  useEffect(() => {
    if (!deudores) return;

    let filtered = [...deudores];

    // Filtrar por estado
    if (filtroEstado !== "todos") {
      filtered = filtered.filter(deudor => deudor.estado === filtroEstado);
    }

    // Buscar por nombre
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(deudor => 
        deudor.nombre.toLowerCase().includes(term) ||
        deudor.email.toLowerCase().includes(term) ||
        deudor.celular.includes(term)
      );
    }

    // Ordenar
    if (sortOrder === "recientes") {
      filtered.sort((a, b) => new Date(b.fecha_prestamo).getTime() - new Date(a.fecha_prestamo).getTime());
    } else if (sortOrder === "antiguos") {
      filtered.sort((a, b) => new Date(a.fecha_prestamo).getTime() - new Date(b.fecha_prestamo).getTime());
    } else if (sortOrder === "monto") {
      filtered.sort((a, b) => b.monto_prestado - a.monto_prestado);
    } else if (sortOrder === "nombre") {
      filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    setDeudoresFiltrados(filtered);
  }, [deudores, filtroEstado, searchTerm, sortOrder]);

  const isLoading = isLoadingDeudores || isLoadingPagos;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      
      <div className="page-container">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Deudores</h1>
            <p className="text-muted-foreground">Gestiona tus clientes y préstamos</p>
          </div>
          <Button asChild className="mt-4 md:mt-0 hover-lift">
            <Link to="/deudores/nuevo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Deudor
            </Link>
          </Button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, correo o teléfono..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recientes">Más recientes</SelectItem>
                  <SelectItem value="antiguos">Más antiguos</SelectItem>
                  <SelectItem value="monto">Mayor monto</SelectItem>
                  <SelectItem value="nombre">Ordenar por nombre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs de filtro por estado */}
          <Tabs 
            defaultValue="todos" 
            value={filtroEstado}
            onValueChange={(value) => setFiltroEstado(value as FilterState)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="activo">Activos</TabsTrigger>
              <TabsTrigger value="vencido">Vencidos</TabsTrigger>
              <TabsTrigger value="pagado">Pagados</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Lista de deudores */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card text-card-foreground shadow">
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-6 w-3/4" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-6 w-3/4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t bg-muted/50">
                  <div className="flex justify-between">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : deudoresFiltrados.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deudoresFiltrados.map((deudor) => (
              <DeudorCard 
                key={deudor.id} 
                deudor={deudor} 
                pagos={pagos?.filter(p => p.deudor_id === deudor.id) || []} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-morphism rounded-lg">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hay deudores</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filtroEstado !== "todos"
                ? "No hay deudores que coincidan con tu búsqueda o filtros."
                : "Aún no has registrado ningún deudor."}
            </p>
            {!searchTerm && filtroEstado === "todos" && (
              <Button asChild className="hover-lift">
                <Link to="/deudores/nuevo">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Agregar Deudor
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Deudores;
