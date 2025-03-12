
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      deudores: {
        Row: {
          id: string
          nombre: string
          celular: string
          email: string
          monto_prestado: number
          fecha_prestamo: string
          fechas_pago: string[]
          tasa_interes: number
          interes_acumulado: number
          estado: "activo" | "vencido" | "pagado"
        }
        Insert: {
          id?: string
          nombre: string
          celular: string
          email: string
          monto_prestado: number
          fecha_prestamo: string
          fechas_pago: string[]
          tasa_interes: number
          interes_acumulado?: number
          estado?: "activo" | "vencido" | "pagado"
        }
        Update: {
          id?: string
          nombre?: string
          celular?: string
          email?: string
          monto_prestado?: number
          fecha_prestamo?: string
          fechas_pago?: string[]
          tasa_interes?: number
          interes_acumulado?: number
          estado?: "activo" | "vencido" | "pagado"
        }
      }
      pagos: {
        Row: {
          id: string
          deudor_id: string
          fecha_pago: string
          monto_pagado: number
          metodo_pago: "efectivo" | "transferencia" | "otro"
          comentario: string | null
        }
        Insert: {
          id?: string
          deudor_id: string
          fecha_pago: string
          monto_pagado: number
          metodo_pago?: "efectivo" | "transferencia" | "otro"
          comentario?: string | null
        }
        Update: {
          id?: string
          deudor_id?: string
          fecha_pago?: string
          monto_pagado?: number
          metodo_pago?: "efectivo" | "transferencia" | "otro"
          comentario?: string | null
        }
      }
    }
  }
}
