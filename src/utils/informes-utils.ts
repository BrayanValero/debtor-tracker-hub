
import { Deudor, Pago } from "@/lib/supabase";
import { differenceInDays } from "date-fns";

export const calcularMontosData = (deudores: Deudor[], pagos: Pago[]) => {
  const montosMap = new Map<string, { prestado: number; pagado: number }>();
  
  // Agrupar los préstamos por mes
  deudores.forEach(deudor => {
    const fecha = new Date(deudor.fecha_prestamo);
    const key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
    
    if (!montosMap.has(key)) {
      montosMap.set(key, { prestado: 0, pagado: 0 });
    }
    
    const data = montosMap.get(key)!;
    data.prestado += deudor.monto_prestado;
  });
  
  // Agrupar los pagos por mes
  pagos.forEach(pago => {
    const fecha = new Date(pago.fecha_pago);
    const key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
    
    if (!montosMap.has(key)) {
      montosMap.set(key, { prestado: 0, pagado: 0 });
    }
    
    const data = montosMap.get(key)!;
    data.pagado += pago.monto_pagado;
  });
  
  // Convertir a array y ordenar por fecha
  const sortedKeys = Array.from(montosMap.keys()).sort();
  
  // Formatear para el gráfico
  return sortedKeys.map(key => {
    const [year, month] = key.split('-').map(Number);
    const data = montosMap.get(key)!;
    
    return {
      name: `${month}/${year}`,
      prestado: data.prestado,
      pagado: data.pagado,
    };
  });
};

export const formatTooltipValue = (value: any) => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  return value;
};

// Función para calcular el interés acumulado hasta una fecha específica
export const calcularInteresHastaFecha = (
  deudor: Deudor,
  fechaFinal: Date
): number => {
  const fechaPrestamo = new Date(deudor.fecha_prestamo);
  
  // Si la fecha final es anterior a la fecha del préstamo, no hay interés
  if (fechaFinal < fechaPrestamo) {
    return 0;
  }
  
  // Calcular días transcurridos desde el préstamo hasta la fecha final
  const diasTranscurridos = differenceInDays(fechaFinal, fechaPrestamo);
  
  // Calcular interés diario (suponiendo que tasa_interes es mensual)
  const interesDiario = deudor.tasa_interes / 30;
  
  // Calcular interés acumulado
  const interesAcumulado = deudor.monto_prestado * interesDiario * diasTranscurridos;
  
  return interesAcumulado;
};

// Calcular el saldo pendiente incluyendo el interés proporcional
export const calcularSaldoPendiente = (
  deudor: Deudor,
  pagos: Pago[],
  fechaActual: Date = new Date()
): number => {
  // Calcular interés acumulado hasta la fecha actual
  const interesAcumulado = calcularInteresHastaFecha(deudor, fechaActual);
  
  // Calcular total pagado
  const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto_pagado, 0);
  
  // Calcular saldo pendiente
  const saldoPendiente = deudor.monto_prestado + interesAcumulado - totalPagado;
  
  return Math.max(0, saldoPendiente);
};
