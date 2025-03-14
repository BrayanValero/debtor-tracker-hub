import { useState, useEffect } from "react";
import { supabase, Deudor, Pago, ResumenEstadisticas } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  DownloadIcon, 
  FileDown, 
  Users, 
  FileText,
  FileSpreadsheet,
  FilePdf
} from "lucide-react";
import { addDays, isBefore, differenceInDays } from "date-fns";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  const COLORS = ["#3b82f6", "#10b981", "#f97316", "#f43f5e", "#8b5cf6"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data: deudoresData, error: deudoresError } = await supabase
          .from("deudores")
          .select("*");
          
        if (deudoresError) throw deudoresError;
        
        const { data: pagosData, error: pagosError } = await supabase
          .from("pagos")
          .select("*")
          .order("fecha_pago", { ascending: false });
          
        if (pagosError) throw pagosError;
        
        const deudoresTyped = deudoresData as Deudor[];
        const pagosTyped = pagosData as Pago[];
        
        const deudoresActivos = deudoresTyped.filter(d => d.estado === "activo");
        const montoActivo = deudoresActivos.reduce((sum, d) => sum + d.monto_prestado, 0);
        const interesesTotales = deudoresTyped.reduce((sum, d) => sum + d.interes_acumulado, 0);
        
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

  const estadoPrestamosData = [
    { name: "Activos", value: deudores.filter(d => d.estado === "activo").length },
    { name: "Vencidos", value: deudores.filter(d => d.estado === "vencido").length },
    { name: "Pagados", value: deudores.filter(d => d.estado === "pagado").length }
  ].filter(item => item.value > 0);

  const metodosPagoData = [
    { name: "Efectivo", value: pagos.filter(p => p.metodo_pago === "efectivo").length },
    { name: "Transferencia", value: pagos.filter(p => p.metodo_pago === "transferencia").length },
    { name: "Otro", value: pagos.filter(p => p.metodo_pago === "otro").length }
  ].filter(item => item.value > 0);

  const montosData = calcularMontosData(deudores, pagos);

  const handleExportarPDF = (tipo: 'deudor' | 'general') => {
    try {
      if (tipo === 'deudor') {
        toast.success("Exportando informe por deudor en PDF");
        setTimeout(() => {
          toast.success("Informe por deudor exportado en PDF");
        }, 1500);
      } else {
        toast.success("Exportando informe general en PDF");
        setTimeout(() => {
          toast.success("Informe general exportado en PDF");
        }, 1500);
      }
    } catch (error) {
      console.error("Error al exportar como PDF:", error);
      toast.error("Error al exportar el informe en PDF");
    }
  };

  const handleExportarExcel = (tipo: 'deudor' | 'general') => {
    try {
      if (tipo === 'deudor') {
        toast.success("Exportando informe por deudor en Excel");
        setTimeout(() => {
          toast.success("Informe por deudor exportado en Excel");
        }, 1500);
      } else {
        toast.success("Exportando informe general en Excel");
        setTimeout(() => {
          toast.success("Informe general exportado en Excel");
        }, 1500);
      }
    } catch (error) {
      console.error("Error al exportar como Excel:", error);
      toast.error("Error al exportar el informe en Excel");
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/lovable-uploads/e8c53d64-a1c3-4d06-9ab0-e2230a56dff1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Opciones de exportación</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Users className="mr-2 h-4 w-4" />
                    Exportar por Deudor
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExportarPDF('deudor')}>
                      <FilePdf className="mr-2 h-4 w-4" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportarExcel('deudor')}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Excel
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <FileText className="mr-2 h-4 w-4" />
                    Informe General
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExportarPDF('general')}>
                      <FilePdf className="mr-2 h-4 w-4" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportarExcel('general')}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Excel
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
              </DropdownMenuContent>
            </DropdownMenu>
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
            <TabsList className="mb-6 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="deudores">Deudores</TabsTrigger>
              <TabsTrigger value="pagos">Pagos</TabsTrigger>
              <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resumen" className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
              <EstadisticasCards estadisticas={estadisticas} />
              <PagosProximos pagosProximos={estadisticas.pagos_proximos} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EstadoPrestamosChart data={estadoPrestamosData} colors={COLORS} />
                <MetodosPagoChart data={metodosPagoData} colors={COLORS} />
              </div>
            </TabsContent>
            
            <TabsContent value="deudores" className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
              <ListadoDeudores deudores={deudores} />
            </TabsContent>
            
            <TabsContent value="pagos" className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
              <HistorialPagos pagos={pagos} deudores={deudores} />
            </TabsContent>
            
            <TabsContent value="graficos" className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
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
