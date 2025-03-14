import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase, Deudor } from "@/lib/supabase";
import { toast } from "sonner";
import { ChevronLeft, CalendarIcon, PlusCircle, X, Upload, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const deudorSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  celular: z.string().min(8, "El celular debe tener al menos 8 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  monto_prestado: z.coerce.number().positive("El monto debe ser mayor a 0"),
  fecha_prestamo: z.date(),
  tasa_interes: z.coerce.number().min(0, "La tasa debe ser mayor o igual a 0"),
  estado: z.enum(["activo", "vencido", "pagado"]),
});

const DeudorForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fechasPago, setFechasPago] = useState<Date[]>([]);
  const [nuevaFechaPago, setNuevaFechaPago] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const isEditMode = !!id;

  const { data: deudor, isLoading } = useQuery({
    queryKey: ["deudor", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("deudores")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Deudor;
    },
    enabled: isEditMode,
  });

  const form = useForm<z.infer<typeof deudorSchema>>({
    resolver: zodResolver(deudorSchema),
    defaultValues: {
      nombre: "",
      celular: "",
      email: "",
      monto_prestado: 0,
      fecha_prestamo: new Date(),
      tasa_interes: 0,
      estado: "activo" as const,
    },
  });

  useEffect(() => {
    if (deudor) {
      form.reset({
        nombre: deudor.nombre,
        celular: deudor.celular,
        email: deudor.email,
        monto_prestado: deudor.monto_prestado,
        fecha_prestamo: new Date(deudor.fecha_prestamo),
        tasa_interes: deudor.tasa_interes,
        estado: deudor.estado,
      });

      const fechasPagoDate = deudor.fechas_pago.map(fecha => new Date(fecha));
      setFechasPago(fechasPagoDate);
      
      if (deudor.foto_url) {
        setFotoPreview(deudor.foto_url);
      }
    }
  }, [deudor, form]);

  const handleAgregarFechaPago = () => {
    if (!nuevaFechaPago) return;
    
    const yaExiste = fechasPago.some(fecha => 
      fecha.toDateString() === nuevaFechaPago.toDateString()
    );
    
    if (yaExiste) {
      toast.error("Esta fecha ya está agregada");
      return;
    }
    
    setFechasPago([...fechasPago, nuevaFechaPago]);
    setNuevaFechaPago(undefined);
    setIsCalendarOpen(false);
  };

  const handleEliminarFechaPago = (index: number) => {
    const nuevasFechas = [...fechasPago];
    nuevasFechas.splice(index, 1);
    setFechasPago(nuevasFechas);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof deudorSchema>) => {
    if (fechasPago.length === 0) {
      toast.error("Debes agregar al menos una fecha de pago");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const fechasPagoString = fechasPago.map(fecha => 
        fecha.toISOString().split('T')[0]
      );
      
      let foto_url = deudor?.foto_url;
      if (foto) {
        const fileName = `${Date.now()}-${foto.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('fotos')
          .upload(`deudores/${fileName}`, foto);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('fotos')
          .getPublicUrl(`deudores/${fileName}`);
          
        foto_url = publicUrl;
      }
      
      const fechaPrestamo = new Date(values.fecha_prestamo);
      const hoy = new Date();
      const diasTranscurridos = Math.max(0, Math.floor((hoy.getTime() - fechaPrestamo.getTime()) / (1000 * 60 * 60 * 24)));
      
      const interesAnual = values.tasa_interes;
      const interesDiario = interesAnual / 365;
      const interesAcumulado = values.monto_prestado * interesDiario * diasTranscurridos;
      
      const deudorData = {
        nombre: values.nombre,
        celular: values.celular,
        email: values.email,
        monto_prestado: values.monto_prestado,
        fecha_prestamo: values.fecha_prestamo.toISOString().split('T')[0],
        fechas_pago: fechasPagoString,
        tasa_interes: values.tasa_interes,
        interes_acumulado: isEditMode ? deudor?.interes_acumulado : interesAcumulado,
        estado: values.estado,
        foto_url: foto_url
      };

      let error;
      
      if (isEditMode) {
        ({ error } = await supabase
          .from("deudores")
          .update(deudorData)
          .eq("id", id));
      } else {
        ({ error } = await supabase
          .from("deudores")
          .insert([deudorData]));
      }
      
      if (error) throw error;
      
      toast.success(`Deudor ${isEditMode ? "actualizado" : "creado"} correctamente`);
      queryClient.invalidateQueries({ queryKey: ["deudores"] });
      queryClient.invalidateQueries({ queryKey: ["deudor", id] });
      navigate("/deudores");
    } catch (error) {
      console.error("Error al guardar deudor:", error);
      toast.error(`Error al ${isEditMode ? "actualizar" : "crear"} deudor`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFecha = (date: Date) => {
    return format(date, "PPP", { locale: es });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      
      <div className="page-container max-w-3xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
            onClick={() => navigate("/deudores")}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver a deudores
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Editar Deudor" : "Nuevo Deudor"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode 
              ? "Actualiza la información del deudor y préstamo" 
              : "Registra un nuevo deudor y préstamo"}
          </p>
        </div>

        {isLoading && isEditMode ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <p className="text-xl font-medium">Cargando datos...</p>
            </div>
          </div>
        ) : (
          <div className="glass-morphism rounded-xl p-6 shadow-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Datos personales</h2>
                  
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 mb-6">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={fotoPreview || undefined} alt="Foto del deudor" />
                        <AvatarFallback className="text-2xl">
                          {form.getValues("nombre") ? getInitials(form.getValues("nombre")) : "??"}
                        </AvatarFallback>
                      </Avatar>
                      <label htmlFor="foto-upload" className="cursor-pointer">
                        <div className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <Image className="h-3 w-3" />
                          {fotoPreview ? "Cambiar foto" : "Agregar foto"}
                        </div>
                        <input
                          id="foto-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFotoChange}
                        />
                      </label>
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre del deudor" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="celular"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Celular</FormLabel>
                              <FormControl>
                                <Input placeholder="Número de celular" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correo electrónico</FormLabel>
                              <FormControl>
                                <Input placeholder="correo@ejemplo.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Datos del préstamo</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="monto_prestado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto prestado</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              type="number" 
                              step="0.01" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tasa_interes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tasa de interés mensual (%)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              type="number" 
                              step="0.01" 
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(value / 100);
                              }}
                              value={field.value * 100}
                            />
                          </FormControl>
                          <FormDescription>
                            Interés mensual, se calculará proporcional a los días.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fecha_prestamo"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de préstamo</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    formatFecha(field.value)
                                  ) : (
                                    <span>Selecciona una fecha</span>
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
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="activo">Activo</SelectItem>
                              <SelectItem value="vencido">Vencido</SelectItem>
                              <SelectItem value="pagado">Pagado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Fechas de pago</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {fechasPago.length > 0 ? (
                        fechasPago
                          .sort((a, b) => a.getTime() - b.getTime())
                          .map((fecha, index) => (
                            <Badge key={index} variant="outline" className="py-1.5 px-3 gap-1.5">
                              {formatFecha(fecha)}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleEliminarFechaPago(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))
                      ) : (
                        <div className="text-sm text-muted-foreground py-1">
                          No hay fechas de pago programadas
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => setIsCalendarOpen(true)}
                          >
                            <CalendarIcon className="h-4 w-4" />
                            Agregar fecha
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-3">
                            <Calendar
                              mode="single"
                              selected={nuevaFechaPago}
                              onSelect={setNuevaFechaPago}
                              initialFocus
                              className="pointer-events-auto"
                            />
                            <div className="mt-4 flex justify-end">
                              <Button
                                type="button"
                                size="sm"
                                disabled={!nuevaFechaPago}
                                onClick={handleAgregarFechaPago}
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {fechasPago.length === 0 && (
                      <p className="text-sm text-destructive">
                        Debes agregar al menos una fecha de pago
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/deudores")}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8"
                  >
                    {isSubmitting 
                      ? "Guardando..." 
                      : isEditMode 
                        ? "Actualizar Deudor" 
                        : "Guardar Deudor"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeudorForm;
