import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Printer, Save } from 'lucide-react';
import { useGetInventory } from '@workspace/api-client-react';

const formSchema = z.object({
  nombreFallecido: z.string().min(1, "Campo requerido"),
  cedula: z.string().min(1, "Campo requerido"),
  fechaFallecimiento: z.string().min(1, "Campo requerido"),
  familiarResponsable: z.string().min(1, "Campo requerido"),
  telefono: z.string().min(1, "Campo requerido"),
  salaAsignada: z.string().min(1, "Seleccione una sala"),
  vehiculoAsignado: z.string().min(1, "Seleccione un vehículo"),
  cofre: z.string().min(1, "Seleccione un cofre"),
  polizaCedula: z.string().optional(),
  planPoliza: z.string().optional(),
  observaciones: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GeneradorOrdenes() {
  const { data: inventory } = useGetInventory();
  const [printData, setPrintData] = useState<FormValues | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreFallecido: "",
      cedula: "",
      fechaFallecimiento: "",
      familiarResponsable: "",
      telefono: "",
      salaAsignada: "",
      vehiculoAsignado: "",
      cofre: "",
      polizaCedula: "",
      planPoliza: "",
      observaciones: "",
    }
  });

  const onSubmit = (data: FormValues) => {
    setPrintData(data);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card className="border-border print:hidden">
        <CardHeader>
          <CardTitle>Nueva Orden de Servicio</CardTitle>
          <CardDescription>Complete los datos para generar el documento formal de la orden de servicio funerario.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border/50 pb-6">
                <div className="col-span-2">
                  <h3 className="text-sm font-serif font-semibold text-primary uppercase tracking-wider mb-4 border-l-2 border-brand-gold pl-2">Datos del Fallecido</h3>
                </div>
                <FormField
                  control={form.control}
                  name="nombreFallecido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl><Input placeholder="Ej: Juan Pérez" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cedula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cédula de Identidad</FormLabel>
                      <FormControl><Input placeholder="Ej: V-12345678" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fechaFallecimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Fallecimiento</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border/50 pb-6">
                <div className="col-span-2">
                  <h3 className="text-sm font-serif font-semibold text-primary uppercase tracking-wider mb-4 border-l-2 border-brand-gold pl-2">Datos del Contratante / Familiar</h3>
                </div>
                <FormField
                  control={form.control}
                  name="familiarResponsable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Responsable</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Contacto</FormLabel>
                      <FormControl><Input placeholder="+58..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="polizaCedula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cédula Póliza (Opcional)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="planPoliza"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Póliza (Opcional)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-border/50 pb-6">
                <div className="col-span-3">
                  <h3 className="text-sm font-serif font-semibold text-primary uppercase tracking-wider mb-4 border-l-2 border-brand-gold pl-2">Logística y Materiales</h3>
                </div>
                <FormField
                  control={form.control}
                  name="salaAsignada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sala Asignada</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccione sala" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {inventory && Object.keys(inventory.salas).map(sala => (
                            <SelectItem key={sala} value={sala}>{sala}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehiculoAsignado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehículo Asignado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccione vehículo" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {inventory && Object.keys(inventory.vehiculos).map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cofre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cofre Seleccionado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccione cofre" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {inventory && Object.keys(inventory.cofres).map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Observaciones Especiales</FormLabel>
                      <FormControl><Textarea className="resize-none" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => form.reset()}>Limpiar</Button>
                <Button type="submit" className="bg-primary text-primary-foreground gap-2">
                  <Save className="w-4 h-4" /> Generar Orden
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Print Document Modal */}
      <Dialog open={!!printData} onOpenChange={(open) => !open && setPrintData(null)}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white text-black print:block print:h-auto print:max-w-none">
          
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 print:hidden">
            <DialogTitle className="text-gray-900">Vista Previa: Orden de Servicio</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPrintData(null)}>Cerrar</Button>
              <Button onClick={handlePrint} className="bg-brand-gold text-primary hover:bg-brand-gold/90 gap-2">
                <Printer className="w-4 h-4" /> Imprimir
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible">
            {/* THIS IS THE PRINT DOCUMENT */}
            <div id="print-area" className="max-w-2xl mx-auto bg-white" style={{ fontFamily: 'Georgia, serif' }}>
              
              {/* HEADER */}
              <div className="flex items-center justify-between border-b-2 border-black pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center font-bold text-3xl">S</div>
                  <div>
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-black">Serena</h1>
                    <p className="text-sm text-gray-600 uppercase tracking-widest">Servicios Funerarios</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>Orden No. {Math.floor(Math.random() * 10000).toString().padStart(5, '0')}</p>
                  <p>Fecha: {new Date().toLocaleDateString('es-VE')}</p>
                </div>
              </div>

              {/* BODY */}
              <h2 className="text-center font-bold text-xl uppercase tracking-widest mb-8 text-black">Orden de Servicio</h2>

              <div className="space-y-6">
                
                <section>
                  <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-widest text-black">I. Identificación del Fallecido</h3>
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-2 w-1/3 text-gray-600">Nombre Completo:</td>
                        <td className="py-2 border-b border-dotted border-gray-400 font-medium text-black">{printData?.nombreFallecido}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">Cédula de Identidad:</td>
                        <td className="py-2 border-b border-dotted border-gray-400 font-medium text-black">{printData?.cedula}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">Fecha de Fallecimiento:</td>
                        <td className="py-2 border-b border-dotted border-gray-400 font-medium text-black">{printData?.fechaFallecimiento}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <section>
                  <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-widest text-black">II. Identificación del Contratante</h3>
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-2 w-1/3 text-gray-600">Nombre Responsable:</td>
                        <td className="py-2 border-b border-dotted border-gray-400 font-medium text-black">{printData?.familiarResponsable}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">Teléfono:</td>
                        <td className="py-2 border-b border-dotted border-gray-400 font-medium text-black">{printData?.telefono}</td>
                      </tr>
                      {printData?.polizaCedula && (
                        <tr>
                          <td className="py-2 text-gray-600">Póliza (C.I.):</td>
                          <td className="py-2 border-b border-dotted border-gray-400 font-medium text-black">{printData?.polizaCedula} - Plan: {printData?.planPoliza || 'N/A'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </section>

                <section>
                  <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-widest text-black">III. Servicios Asignados</h3>
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-2 w-1/3 text-gray-600">Sala de Velación:</td>
                        <td className="py-2 border-b border-dotted border-gray-400 font-medium text-black">{printData?.salaAsignada}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">Cofre Seleccionado:</td>
                        <td className="py-2 border-b border-dotted border-gray-400 font-medium text-black">{printData?.cofre}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">Unidad de Traslado:</td>
                        <td className="py-2 border-b border-dotted border-gray-400 font-medium text-black">{printData?.vehiculoAsignado}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                {printData?.observaciones && (
                  <section>
                    <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-widest text-black">IV. Observaciones</h3>
                    <p className="text-sm italic text-gray-800 p-3 bg-gray-50 border border-gray-200 min-h-[60px]">
                      {printData.observaciones}
                    </p>
                  </section>
                )}
              </div>

              {/* SIGNATURES */}
              <div className="mt-24 pt-8 grid grid-cols-2 gap-12 text-center text-sm text-black">
                <div>
                  <div className="border-t border-black pt-2 mx-8">
                    Firma Contratante
                  </div>
                  <p className="text-xs text-gray-500 mt-1">C.I. ______________</p>
                </div>
                <div>
                  <div className="border-t border-black pt-2 mx-8">
                    Por Serena Servicios
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Sello Húmedo</p>
                </div>
              </div>

            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
