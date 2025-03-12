
import { Deudor, Pago } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Calcular los datos para el gráfico de montos por mes
export const calcularMontosData = (deudores: Deudor[], pagos: Pago[]) => {
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
