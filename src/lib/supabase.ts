
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Obtener variables de entorno o usar valores de desarrollo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

// Advierte en la consola en lugar de bloquear la aplicación
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Faltan variables de entorno para Supabase. La aplicación funcionará en modo demo con datos simulados.');
}

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
