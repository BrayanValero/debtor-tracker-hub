
import { Deudor, Pago } from "@/lib/supabase";

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
