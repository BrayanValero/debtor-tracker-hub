
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase, Pago, Deudor } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  deudor_id: z.string().min(1, { message: "Debe seleccionar un deudor" }),
  fecha_pago: z.date({ required_error: "Debe seleccionar una fecha" }),
  monto_pagado: z.number({ required_error: "Debe ingresar un monto" })
    .positive({ message: "Debe ser un número positivo" }),
  metodo_pago: z.enum(["efectivo", "transferencia", "otro"], { 
    required_error: "Debe seleccionar un método de pago" 
  }),
  comentario: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PagoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deudores, setDeudores] = useState<Deudor[]>([]);
  const [deudorSeleccionado, setDeudorSeleccionado] = useState<Deudor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deudor_id: "",
      fecha_pago: new Date(),
      monto_pagado: 0,
      metodo_pago: "efectivo",
      comentario: "",
    },
  });

  useEffect(() => {
    const loadDeudores = async () => {
      try {
        const { data, error } = await supabase
          .from("deudores")
          .select("*")
          .order("nombre", { ascending: true });

        if (error) throw error;
        setDeudores(data as Deudor[]);
      } catch (error) {
        console.error("Error al cargar deudores:", error);
        toast.error("Error al cargar la lista de deudores");
      }
    };

    const loadPago = async () => {
      if (!isEditing) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("pagos")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        const pago = data as Pago;
        
        // Cargar datos del deudor asociado
        const { data: deudorData, error: deudorError } = await supabase
          .from("deudores")
          .select("*")
          .eq("id", pago.deudor_id)
          .single();

        if (deudorError) throw deudorError;
        
        setDeudorSeleccionado(deudorData as Deudor);
        
        // Actualizar formulario con datos del pago
        form.reset({
          deudor_id: pago.deudor_id,
          fecha_pago: new Date(pago.fecha_pago),
          monto_pagado: pago.monto_pagado,
          metodo_pago: pago.metodo_pago,
          comentario: pago.comentario || "",
        });
      } catch (error) {
        console.error("Error al cargar pago:", error);
        toast.error("Error al cargar los datos del pago");
        navigate("/pagos");
      } finally {
        setIsLoading(false);
      }
    };

    loadDeudores();
    loadPago();
  }, [id, isEditing, navigate, form]);

  useEffect(() => {
    // Actualizar deudor seleccionado cuando cambia el deudor_id en el formulario
    const subscription = form.watch((value) => {
      if (value.deudor_id) {
        const deudorEncontrado = deudores.find(d => d.id === value.deudor_id);
        setDeudorSeleccionado(deudorEncontrado || null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, deudores]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      
      const pagoData = {
        deudor_id: data.deudor_id,
        fecha_pago: format(data.fecha_pago, "yyyy-MM-dd"),
        monto_pagado: data.monto_pagado,
        metodo_pago: data.metodo_pago,
        comentario: data.comentario || "",
      };

      let response;
      if (isEditing) {
        response = await supabase
          .from("pagos")
          .update(pagoData)
          .eq("id", id);
      } else {
        response = await supabase
          .from("pagos")
          .insert(pagoData);
      }

      if (response.error) throw response.error;

      toast.success(
        isEditing
          ? "Pago actualizado correctamente"
          : "Pago registrado correctamente"
      );
      
      navigate("/pagos");
    } catch (error) {
      console.error("Error al guardar pago:", error);
      toast.error(`Error al ${isEditing ? "actualizar" : "registrar"} el pago: ${(error as any).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Editar Pago" : "Registrar Nuevo Pago"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Modifica la información del pago existente" : "Registra un nuevo pago de deudor"}
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{isEditing ? "Editar Pago" : "Datos del Pago"}</CardTitle>
            <CardDescription>
              Complete la información para registrar el pago
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-center">
                  <p className="text-muted-foreground">Cargando datos...</p>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="deudor_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deudor</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isEditing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar deudor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deudores.map((deudor) => (
                              <SelectItem key={deudor.id} value={deudor.id}>
                                {deudor.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Seleccione al deudor que realiza el pago
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {deudorSeleccionado && (
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <h3 className="font-medium mb-2">Información del deudor</h3>
                      <p>Monto prestado: ${deudorSeleccionado.monto_prestado.toFixed(2)}</p>
                      <p>Tasa de interés: {deudorSeleccionado.tasa_interes}% mensual</p>
                      <p>Fecha de préstamo: {format(new Date(deudorSeleccionado.fecha_prestamo), "dd/MM/yyyy")}</p>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="fecha_pago"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de pago</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Seleccionar fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monto_pagado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto pagado</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="pl-8"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Ingrese el monto recibido como pago
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metodo_pago"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de pago</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar método" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="efectivo">Efectivo</SelectItem>
                            <SelectItem value="transferencia">Transferencia</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comentario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comentario (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Añada cualquier observación relevante sobre el pago..." 
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/pagos")}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar Pago' : 'Registrar Pago')}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PagoForm;
