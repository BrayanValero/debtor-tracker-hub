
import { useState, useEffect } from "react";
import { supabase, Deudor, Pago, ResumenEstadisticas } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { addDays, isBefore } from "date-fns";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import EstadisticasCards from "@/components/informes/EstadisticasCards";
import PagosProximos from "@/components/informes/PagosProximos";
import EstadoPrestamosChart from "@/components/informes/EstadoPrestamosChart";
import MetodosPagoChart from "@/components/informes/MetodosPagoChart";
import EvolucionPrestamosChart from "@/components/informes/EvolucionPrestamosChart";
import ListadoDeudores from "@/components/informes/ListadoDeudores";
import HistorialPagos from "@/components/informes/HistorialPagos";
import GraficosDistribucion from "@/components/informes/GraficosDistribucion";
import { calcularMontosData } from "@/utils/informes-utils";

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
  const montosData = calcularMontosData(deudores, pagos);

  const handleExportarPDF = () => {
    toast.success("Función de exportar a PDF en desarrollo");
    // Aquí iría la implementación para exportar a PDF
  };

  const handleExportarExcel = () => {
    toast.success("Función de exportar a Excel en desarrollo");
    // Aquí iría la implementación para exportar a Excel
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
              <EstadisticasCards estadisticas={estadisticas} />
              <PagosProximos pagosProximos={estadisticas.pagos_proximos} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EstadoPrestamosChart data={estadoPrestamosData} colors={COLORS} />
                <MetodosPagoChart data={metodosPagoData} colors={COLORS} />
              </div>
            </TabsContent>
            
            <TabsContent value="deudores">
              <ListadoDeudores deudores={deudores} />
            </TabsContent>
            
            <TabsContent value="pagos">
              <HistorialPagos pagos={pagos} deudores={deudores} />
            </TabsContent>
            
            <TabsContent value="graficos">
              <EvolucionPrestamosChart data={montosData} />
              <GraficosDistribucion 
                estadoPrestamosData={estadoPrestamosData}
                metodosPagoData={metodosPagoData}
                colors={COLORS}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Informes;
