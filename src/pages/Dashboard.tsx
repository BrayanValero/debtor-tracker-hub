
import { useQuery } from "@tanstack/react-query";
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Users,
  ArrowRight,
  Wallet
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase, Deudor, Pago } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface DeudorConSaldo extends Deudor {
  saldo_pendiente: number;
}

interface EstadisticasGenerales {
  total_prestamos: number;
  prestamos_activos: number;
  prestamos_vencidos: number;
  prestamos_pagados: number;
  monto_total_prestado: number;
  monto_por_cobrar: number;
  intereses_generados: number;
}

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales>({
    total_prestamos: 0,
    prestamos_activos: 0,
    prestamos_vencidos: 0,
    prestamos_pagados: 0,
    monto_total_prestado: 0,
    monto_por_cobrar: 0,
    intereses_generados: 0
  });

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

  const { data: pagos, isLoading: isLoadingPagos } = useQuery({
    queryKey: ["pagos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagos")
        .select("*")
        .order("fecha_pago", { ascending: false });
      
      if (error) throw error;
      return data as Pago[];
    }
  });

  // Calcular estadísticas cuando se carguen los datos
  useEffect(() => {
    if (deudores && pagos) {
      const deudoresConSaldo: DeudorConSaldo[] = deudores.map(deudor => {
        // Sumar todos los pagos realizados para este deudor
        const pagosTotales = pagos
          .filter(pago => pago.deudor_id === deudor.id)
          .reduce((sum, pago) => sum + pago.monto_pagado, 0);
        
        // Calcular saldo pendiente
        const saldoPendiente = 
          deudor.monto_prestado + 
          deudor.interes_acumulado - 
          pagosTotales;
        
        return {
          ...deudor,
          saldo_pendiente: Number(saldoPendiente.toFixed(2))
        };
      });

      // Cálculo de estadísticas generales
      const activos = deudoresConSaldo.filter(d => d.estado === "activo");
      const vencidos = deudoresConSaldo.filter(d => d.estado === "vencido");
      const pagados = deudoresConSaldo.filter(d => d.estado === "pagado");
      
      const montoTotalPrestado = deudoresConSaldo.reduce(
        (sum, d) => sum + d.monto_prestado, 
        0
      );
      
      const montoPorCobrar = deudoresConSaldo.reduce(
        (sum, d) => d.estado !== "pagado" ? sum + d.saldo_pendiente : sum, 
        0
      );
      
      const interesesGenerados = deudoresConSaldo.reduce(
        (sum, d) => sum + d.interes_acumulado, 
        0
      );

      setEstadisticas({
        total_prestamos: deudoresConSaldo.length,
        prestamos_activos: activos.length,
        prestamos_vencidos: vencidos.length,
        prestamos_pagados: pagados.length,
        monto_total_prestado: Number(montoTotalPrestado.toFixed(2)),
        monto_por_cobrar: Number(montoPorCobrar.toFixed(2)),
        intereses_generados: Number(interesesGenerados.toFixed(2))
      });
    }
  }, [deudores, pagos]);

  // Preparar datos para las gráficas
  const datosEstadoPrestamos = [
    { name: "Activos", value: estadisticas.prestamos_activos, color: "#3b82f6" },
    { name: "Vencidos", value: estadisticas.prestamos_vencidos, color: "#ef4444" },
    { name: "Pagados", value: estadisticas.prestamos_pagados, color: "#10b981" }
  ];

  const datosMontos = [
    { name: "Préstamos", monto: estadisticas.monto_total_prestado },
    { name: "Por cobrar", monto: estadisticas.monto_por_cobrar },
    { name: "Intereses", monto: estadisticas.intereses_generados }
  ];

  // Formatear moneda
  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    }).format(valor);
  };

  // Últimos préstamos para mostrar en dashboard
  const ultimosDeudores = deudores?.slice(0, 5) || [];
  const ultimosPagos = pagos?.slice(0, 5) || [];

  const isLoading = isLoadingDeudores || isLoadingPagos;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      
      <div className="page-container">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de la gestión de préstamos</p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{estadisticas.prestamos_activos}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    de {estadisticas.total_prestamos} préstamos totales
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monto por Cobrar</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{formatMoneda(estadisticas.monto_por_cobrar)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    pendiente de {formatMoneda(estadisticas.monto_total_prestado)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Intereses Generados</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{formatMoneda(estadisticas.intereses_generados)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    sobre {formatMoneda(estadisticas.monto_total_prestado)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Préstamos Vencidos</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{estadisticas.prestamos_vencidos}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    requieren atención inmediata
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráficas */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Distribución de Préstamos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[250px]">
                  <div className="animate-pulse h-[200px] w-[200px] rounded-full bg-muted"></div>
                </div>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosEstadoPrestamos}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {datosEstadoPrestamos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[250px] bg-muted animate-pulse"></div>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={datosMontos}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatMoneda(Number(value))} />
                      <Bar dataKey="monto" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Últimos préstamos y pagos */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Últimos Préstamos</CardTitle>
              <Link to="/deudores">
                <Button variant="link" className="p-0 h-auto">
                  Ver todos <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : ultimosDeudores.length > 0 ? (
                <div className="space-y-4">
                  {ultimosDeudores.map((deudor) => (
                    <Link 
                      key={deudor.id} 
                      to={`/deudores/${deudor.id}`}
                      className="flex items-center p-2 hover:bg-muted rounded-md transition-colors"
                    >
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{deudor.nombre}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{formatMoneda(deudor.monto_prestado)}</span>
                          <span>•</span>
                          <span>
                            {new Date(deudor.fecha_prestamo).toLocaleDateString('es-MX')}
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            {deudor.estado === "activo" && (
                              <><CreditCard className="mr-1 h-3 w-3 text-primary" /> Activo</>
                            )}
                            {deudor.estado === "vencido" && (
                              <><AlertCircle className="mr-1 h-3 w-3 text-destructive" /> Vencido</>
                            )}
                            {deudor.estado === "pagado" && (
                              <><CheckCircle2 className="mr-1 h-3 w-3 text-green-500" /> Pagado</>
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No hay préstamos registrados</p>
                  <Link to="/deudores/nuevo">
                    <Button variant="link" className="mt-2">
                      Crear nuevo préstamo
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Últimos Pagos</CardTitle>
              <Link to="/pagos">
                <Button variant="link" className="p-0 h-auto">
                  Ver todos <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : ultimosPagos.length > 0 ? (
                <div className="space-y-4">
                  {ultimosPagos.map((pago) => {
                    const deudor = deudores?.find(d => d.id === pago.deudor_id);
                    return (
                      <div 
                        key={pago.id} 
                        className="flex items-center p-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {deudor?.nombre || "Deudor desconocido"}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span className="font-medium text-green-600">
                              {formatMoneda(pago.monto_pagado)}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(pago.fecha_pago).toLocaleDateString('es-MX')}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{pago.metodo_pago}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No hay pagos registrados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
