
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Deudor, Pago, supabase } from "@/lib/supabase";
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  CreditCard, 
  Edit, 
  MoreVertical, 
  Phone, 
  Trash, 
  User, 
  Mail,
  PlusCircle
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeudorCardProps {
  deudor: Deudor;
  pagos: Pago[];
}

const DeudorCard = ({ deudor, pagos }: DeudorCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Calcular saldo pendiente
  const totalPagos = pagos
    .filter(pago => pago.deudor_id === deudor.id)
    .reduce((sum, pago) => sum + pago.monto_pagado, 0);
  
  const saldoPendiente = deudor.monto_prestado + deudor.interes_acumulado - totalPagos;

  // Formatear moneda
  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    }).format(valor);
  };

  // Obtener la próxima fecha de pago (si hay)
  const hoy = new Date();
  const proximasFechasPago = deudor.fechas_pago
    .filter(fecha => new Date(fecha) >= hoy)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  const proximaFechaPago = proximasFechasPago.length > 0 ? proximasFechasPago[0] : null;

  // Formatear fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Eliminar deudor
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("deudores")
        .delete()
        .eq("id", deudor.id);
      
      if (error) throw error;
      
      toast.success("Deudor eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["deudores"] });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error al eliminar deudor:", error);
      toast.error("Error al eliminar deudor");
    } finally {
      setIsDeleting(false);
    }
  };

  // Obtener color de estado
  const getEstadoStyles = () => {
    switch (deudor.estado) {
      case "activo":
        return { color: "bg-blue-500", icon: <CreditCard className="h-3 w-3" /> };
      case "vencido":
        return { color: "bg-red-500", icon: <AlertCircle className="h-3 w-3" /> };
      case "pagado":
        return { color: "bg-green-500", icon: <CheckCircle2 className="h-3 w-3" /> };
      default:
        return { color: "bg-gray-500", icon: null };
    }
  };

  const estadoStyles = getEstadoStyles();

  return (
    <>
      <Card className="hover-lift overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{deudor.nombre}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/deudores/${deudor.id}`} className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/pagos?deudor=${deudor.id}`} className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Registrar pago
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="flex items-center mt-1">
            <Badge 
              className={`${estadoStyles.color} hover:${estadoStyles.color} flex items-center gap-1`}
            >
              {estadoStyles.icon}
              <span className="capitalize">{deudor.estado}</span>
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Préstamo</div>
                <div className="text-lg font-bold">{formatMoneda(deudor.monto_prestado)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Saldo</div>
                <div className={`text-lg font-bold ${saldoPendiente <= 0 ? "text-green-600" : ""}`}>
                  {formatMoneda(saldoPendiente)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Interés</div>
                <div className="text-lg font-bold">{deudor.tasa_interes}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Acumulado</div>
                <div className="text-lg font-bold text-amber-600">{formatMoneda(deudor.interes_acumulado)}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Fecha de préstamo</div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                {formatFecha(deudor.fecha_prestamo)}
              </div>
            </div>

            {proximaFechaPago && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Próximo pago</div>
                <div className="flex items-center text-sm font-semibold text-primary">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatFecha(proximaFechaPago)}
                </div>
              </div>
            )}

            <div className="pt-2 space-y-2">
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                {deudor.celular}
              </div>
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                {deudor.email}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          <div className="flex justify-between items-center w-full">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/pagos?deudor=${deudor.id}`}>
                Ver pagos
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to={`/deudores/${deudor.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar deudor?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro de <span className="font-semibold">{deudor.nombre}</span> y todos sus pagos asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeudorCard;
