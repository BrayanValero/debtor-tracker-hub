
import { useState, useEffect } from "react";
import { supabase, Deudor, Pago, ResumenEstadisticas } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Area, AreaChart, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { CalendarIcon, DownloadIcon, CreditCardIcon, ArrowUpIcon, CircleDollarSignIcon, AlertCircleIcon } from "lucide-react";
import { format, addDays, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const Informes = () => {
  const [estadisticas, setEstadisticas] = useState<ResumenEstadisticas>({
    total_prestamos_activos: 0,
    monto_total_activo: 0,
    total_intereses: 0,
    pagos_proximos: []
  });
  const [deudores, setDeudores] = useState<Deudor[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resumen");

  // Colores para los gráficos
  const COLORS = ["#3b82f6", "#10b981", "#f97316", "#f43f5e", "#8b5cf6"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener deudores
        const { data: deudoresData, error: deudoresError } = await supabase
          .from("deudores")
          .select("*");
          
        if (deudoresError) throw deudoresError;
        
        // Obtener pagos
        const { data: pagosData, error: pagosError } = await supabase
          .from("pagos")
          .select("*")
          .order("fecha_pago", { ascending: false });
          
        if (pagosError) throw pagosError;
        
        const deudoresTyped = deudoresData as Deudor[];
        const pagosTyped = pagosData as Pago[];
        
        // Calcular estadísticas
        const deudoresActivos = deudoresTyped.filter(d => d.estado === "activo");
        const montoActivo = deudoresActivos.reduce((sum, d) => sum + d.monto_prestado, 0);
        const interesesTotales = deudoresTyped.reduce((sum, d) => sum + d.interes_acumulado, 0);
        
        // Calcular próximos pagos (deudores con pagos en los próximos 7 días)
        const today = new Date();
        const nextWeek = addDays(today, 7);
        
        const proximosPagos = deudoresActivos
          .filter(deudor => 
            deudor.fechas_pago.some(fecha => {
              const fechaPago = new Date(fecha);
              return isBefore(fechaPago, nextWeek) && isBefore(today, fechaPago);
            })
          )
          .map(deudor => {
            // Encontrar la próxima fecha de pago
            const proximaFecha = deudor.fechas_pago
              .filter(fecha => {
                const fechaPago = new Date(fecha);
                return isBefore(today, fechaPago);
              })
              .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
              
            return {
              ...deudor,
              proximo_pago: proximaFecha
            };
          })
          .sort((a, b) => new Date(a.proximo_pago).getTime() - new Date(b.proximo_pago).getTime());
        
        // Calcular el saldo pendiente para cada deudor
        const deudoresConSaldo = deudoresTyped.map(deudor => {
          const pagosPorDeudor = pagosTyped.filter(pago => pago.deudor_id === deudor.id);
          const totalPagado = pagosPorDeudor.reduce((sum, pago) => sum + pago.monto_pagado, 0);
          const saldoPendiente = deudor.monto_prestado + deudor.interes_acumulado - totalPagado;
          
          return {
            ...deudor,
            saldo_pendiente: saldoPendiente
          };
        });
        
        setDeudores(deudoresConSaldo);
        setPagos(pagosTyped);
        setEstadisticas({
          total_prestamos_activos: deudoresActivos.length,
          monto_total_activo: montoActivo,
          total_intereses: interesesTotales,
          pagos_proximos: proximosPagos
        });
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos de informes");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Datos para el gráfico de estado de préstamos
  const estadoPrestamosData = [
    { name: "Activos", value: deudores.filter(d => d.estado === "activo").length },
    { name: "Vencidos", value: deudores.filter(d => d.estado === "vencido").length },
    { name: "Pagados", value: deudores.filter(d => d.estado === "pagado").length }
  ].filter(item => item.value > 0);

  // Datos para el gráfico de métodos de pago
  const metodosPagoData = [
    { name: "Efectivo", value: pagos.filter(p => p.metodo_pago === "efectivo").length },
    { name: "Transferencia", value: pagos.filter(p => p.metodo_pago === "transferencia").length },
    { name: "Otro", value: pagos.filter(p => p.metodo_pago === "otro").length }
  ].filter(item => item.value > 0);

  // Datos para el gráfico de montos por mes
  const montosData = () => {
    // Crear un mapa de los últimos 6 meses
    const últimosMeses: Record<string, { prestamos: number, pagos: number }> = {};
    const hoy = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const nombreMes = format(fecha, "MMM yyyy", { locale: es });
      últimosMeses[nombreMes] = { prestamos: 0, pagos: 0 };
    }
    
    // Sumar préstamos por mes
    deudores.forEach(deudor => {
      const fechaPrestamo = new Date(deudor.fecha_prestamo);
      const nombreMes = format(fechaPrestamo, "MMM yyyy", { locale: es });
      
      if (últimosMeses[nombreMes]) {
        últimosMeses[nombreMes].prestamos += deudor.monto_prestado;
      }
    });
    
    // Sumar pagos por mes
    pagos.forEach(pago => {
      const fechaPago = new Date(pago.fecha_pago);
      const nombreMes = format(fechaPago, "MMM yyyy", { locale: es });
      
      if (últimosMeses[nombreMes]) {
        últimosMeses[nombreMes].pagos += pago.monto_pagado;
      }
    });
    
    // Convertir el mapa a un array para el gráfico
    return Object.entries(últimosMeses).map(([mes, datos]) => ({
      mes,
      prestamos: datos.prestamos,
      pagos: datos.pagos
    }));
  };

  const handleExportarPDF = () => {
    toast.success("Función de exportar a PDF en desarrollo");
    // Aquí iría la implementación para exportar a PDF
  };

  const handleExportarExcel = () => {
    toast.success("Función de exportar a Excel en desarrollo");
    // Aquí iría la implementación para exportar a Excel
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Informes y Estadísticas</h1>
            <p className="text-muted-foreground mt-1">
              Vista general del estado de los préstamos y pagos
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={handleExportarPDF}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handleExportarExcel}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-center">
              <p className="text-muted-foreground">Cargando informes...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="resumen" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="deudores">Deudores</TabsTrigger>
              <TabsTrigger value="pagos">Pagos</TabsTrigger>
              <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resumen">
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
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Pagos Próximos</CardTitle>
                  <CardDescription>
                    Deudores con pagos programados en los próximos 7 días
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {estadisticas.pagos_proximos.length === 0 ? (
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
                        {estadisticas.pagos_proximos.map((deudor) => (
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de Préstamos</CardTitle>
                    <CardDescription>Distribución por estado</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={estadoPrestamosData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {estadoPrestamosData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} préstamos`, null]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Métodos de Pago</CardTitle>
                    <CardDescription>Distribución por tipo</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={metodosPagoData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {metodosPagoData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} pagos`, null]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="deudores">
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
            </TabsContent>
            
            <TabsContent value="pagos">
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
            </TabsContent>
            
            <TabsContent value="graficos">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Evolución de Préstamos y Pagos</CardTitle>
                  <CardDescription>
                    Montos de préstamos y pagos durante los últimos 6 meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={montosData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, null]} />
                        <Legend />
                        <Bar dataKey="prestamos" name="Préstamos" fill="#3b82f6" />
                        <Bar dataKey="pagos" name="Pagos" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución por Estado</CardTitle>
                    <CardDescription>Estado actual de los préstamos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={estadoPrestamosData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {estadoPrestamosData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} préstamos`, null]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Métodos de Pago Utilizados</CardTitle>
                    <CardDescription>Preferencias de los deudores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={metodosPagoData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {metodosPagoData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} pagos`, null]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Informes;
