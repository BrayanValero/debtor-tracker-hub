
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";
import { differenceInDays } from "date-fns";

// Use Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ygcbqgzpbsmqtvsfqbjb.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnY2JxZ3pwYnNtcXR2c2ZxYmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NjQ1NTMsImV4cCI6MjA1NzI0MDU1M30.EKNpPSFVpGDEiX7keoDRkAdLhTW2SDAomGU3niNl9Sc";

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Deudor = {
  id: string;
  nombre: string;
  celular: string;
  email: string;
  monto_prestado: number;
  fecha_prestamo: string;
  fechas_pago: string[];
  tasa_interes: number;
  interes_acumulado: number;
  estado: "activo" | "vencido" | "pagado";
  saldo_pendiente?: number; // Campo calculado
  foto_url?: string; // Campo para foto
};

export type Pago = {
  id: string;
  deudor_id: string;
  fecha_pago: string;
  monto_pagado: number;
  metodo_pago: "efectivo" | "transferencia" | "otro";
  comentario?: string;
};

export type ResumenEstadisticas = {
  total_prestamos_activos: number;
  monto_total_activo: number;
  total_intereses: number;
  pagos_proximos: Array<Deudor & { proximo_pago: string }>;
};

// Función para calcular interés hasta la fecha de pago
export const calcularInteresProporcional = (
  deudor: Deudor,
  fechaPago: Date
): number => {
  const fechaPrestamo = new Date(deudor.fecha_prestamo);
  // Calcular días transcurridos desde el préstamo hasta el pago
  const diasTranscurridos = differenceInDays(fechaPago, fechaPrestamo);
  
  // Calcular el interés hasta la fecha de pago (tasa_interes ya es MENSUAL)
  const interesMensual = deudor.tasa_interes; 
  const interesDiario = interesMensual / 30; // Basado en un mes de 30 días
  const interesProporcional = deudor.monto_prestado * interesDiario * diasTranscurridos;
  
  return interesProporcional;
};
