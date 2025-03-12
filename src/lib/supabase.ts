
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan variables de entorno para Supabase");
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
