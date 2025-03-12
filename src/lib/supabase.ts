import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Use Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ygcbqgzpbsmqtvsfqbjb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnY2JxZ3pwYnNtcXR2c2ZxYmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NjQ1NTMsImV4cCI6MjA1NzI0MDU1M30.EKNpPSFVpGDEiX7keoDRkAdLhTW2SDAomGU3niNl9Sc';

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

// Keep the mock data for fallback if needed
export const mockData = {
  deudores: [
    {
      id: "1",
      nombre: "Juan Pérez",
      celular: "555-123-4567",
      email: "juan@ejemplo.com",
      monto_prestado: 5000,
      fecha_prestamo: "2023-01-15",
      fechas_pago: ["2023-02-15", "2023-03-15", "2023-04-15"],
      tasa_interes: 5,
      interes_acumulado: 250,
      estado: "activo",
      saldo_pendiente: 3250
    },
    {
      id: "2",
      nombre: "María González",
      celular: "555-987-6543",
      email: "maria@ejemplo.com",
      monto_prestado: 10000,
      fecha_prestamo: "2023-02-01",
      fechas_pago: ["2023-03-01", "2023-04-01", "2023-05-01"],
      tasa_interes: 4.5,
      interes_acumulado: 450,
      estado: "activo",
      saldo_pendiente: 7450
    },
    {
      id: "3",
      nombre: "Carlos Rodríguez",
      celular: "555-456-7890",
      email: "carlos@ejemplo.com",
      monto_prestado: 3000,
      fecha_prestamo: "2022-12-10",
      fechas_pago: ["2023-01-10", "2023-02-10"],
      tasa_interes: 6,
      interes_acumulado: 180,
      estado: "pagado",
      saldo_pendiente: 0
    }
  ] as Deudor[],
  
  pagos: [
    {
      id: "1",
      deudor_id: "1",
      fecha_pago: "2023-02-15",
      monto_pagado: 1000,
      metodo_pago: "transferencia",
      comentario: "Primer pago"
    },
    {
      id: "2",
      deudor_id: "1",
      fecha_pago: "2023-03-15",
      monto_pagado: 1000,
      metodo_pago: "efectivo"
    },
    {
      id: "3",
      deudor_id: "2",
      fecha_pago: "2023-03-01",
      monto_pagado: 3000,
      metodo_pago: "transferencia"
    },
    {
      id: "4",
      deudor_id: "3",
      fecha_pago: "2023-01-10",
      monto_pagado: 1500,
      metodo_pago: "efectivo"
    },
    {
      id: "5",
      deudor_id: "3",
      fecha_pago: "2023-02-10",
      monto_pagado: 1680,
      metodo_pago: "transferencia",
      comentario: "Pago final"
    }
  ] as Pago[],
  
  resumen: {
    total_prestamos_activos: 2,
    monto_total_activo: 15000,
    total_intereses: 700,
    pagos_proximos: [
      {
        id: "1",
        nombre: "Juan Pérez",
        celular: "555-123-4567",
        email: "juan@ejemplo.com",
        monto_prestado: 5000,
        fecha_prestamo: "2023-01-15",
        fechas_pago: ["2023-02-15", "2023-03-15", "2023-04-15"],
        tasa_interes: 5,
        interes_acumulado: 250,
        estado: "activo",
        saldo_pendiente: 3250,
        proximo_pago: "2023-04-15"
      },
      {
        id: "2",
        nombre: "María González",
        celular: "555-987-6543",
        email: "maria@ejemplo.com",
        monto_prestado: 10000,
        fecha_prestamo: "2023-02-01",
        fechas_pago: ["2023-03-01", "2023-04-01", "2023-05-01"],
        tasa_interes: 4.5,
        interes_acumulado: 450,
        estado: "activo",
        saldo_pendiente: 7450,
        proximo_pago: "2023-04-01"
      }
    ]
  } as ResumenEstadisticas
};
