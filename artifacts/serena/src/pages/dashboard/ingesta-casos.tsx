import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';

export default function IngestaCasos() {
  const [whatsappText, setWhatsappText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [pdfParsed, setPdfParsed] = useState<any>(null);

  const handleParseWhatsapp = () => {
    if (!whatsappText.trim()) return;
    
    setIsParsing(true);
    // Simulate AI parsing delay
    setTimeout(() => {
      setParsedData({
        fallecido: "Carlos Mendoza Rivas",
        cedula: "V-8455122",
        fecha: "2024-05-14",
        familiar: "Elena Mendoza (Hija)",
        telefono: "+58 414 123 4567"
      });
      setIsParsing(false);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      // Simulate OCR delay
      setTimeout(() => {
        setPdfParsed({
          fallecido: "María Teresa Silva",
          cedula: "V-5122344",
          fecha: "2024-05-15",
          familiar: "Roberto Silva",
          telefono: "No especificado en certificado"
        });
        setIsUploading(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="pdf" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <UploadCloud className="w-4 h-4 mr-2" />
            Certificado EV-14
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Texto Crudo de WhatsApp</CardTitle>
              <CardDescription>Pegue la conversación con el familiar para extraer los datos estructurados automáticamente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Ej: Buenas noches, necesito de sus servicios. Mi papá falleció hoy, se llamaba Carlos Mendoza, su cédula es 8455122. Mi nombre es Elena y mi número es este mismo."
                className="min-h-[150px] resize-none"
                value={whatsappText}
                onChange={(e) => setWhatsappText(e.target.value)}
              />
              <Button onClick={handleParseWhatsapp} disabled={isParsing || !whatsappText.trim()} className="bg-brand-gold text-primary hover:bg-brand-gold/90">
                {isParsing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</> : 'Procesar Texto'}
              </Button>
            </CardContent>
          </Card>

          {parsedData && (
            <Card className="border-brand-gold/50 bg-brand-gold/5 animate-in fade-in slide-in-from-bottom-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-gold" />
                  Datos Extraídos Exitosamente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">Nombre del Fallecido</Label>
                    <p className="font-medium text-primary">{parsedData.fallecido}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">Cédula</Label>
                    <p className="font-medium text-primary">{parsedData.cedula}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">Fecha de Fallecimiento</Label>
                    <p className="font-medium text-primary">{parsedData.fecha}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">Familiar Contacto</Label>
                    <p className="font-medium text-primary">{parsedData.familiar}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">Teléfono</Label>
                    <p className="font-medium text-primary">{parsedData.telefono}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="outline">Limpiar</Button>
                  <Button className="ml-2">Continuar a Generar Orden</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pdf" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Carga de Certificado EV-14</CardTitle>
              <CardDescription>Suba el certificado médico de defunción escaneado (PDF o Imagen).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 transition-colors relative cursor-pointer">
                <Input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-brand-gold animate-spin mb-4" />
                    <p className="text-sm font-medium text-primary">Analizando documento...</p>
                    <p className="text-xs text-muted-foreground mt-1">Extrayendo información mediante OCR</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium text-primary">Arrastre un archivo o haga clic para seleccionar</p>
                    <p className="text-xs text-muted-foreground mt-1">Soporta PDF, JPG, PNG hasta 10MB</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {pdfParsed && (
            <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Lectura OCR Completada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">Nombre del Fallecido</Label>
                    <p className="font-medium text-primary">{pdfParsed.fallecido}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">Cédula</Label>
                    <p className="font-medium text-primary">{pdfParsed.cedula}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">Fecha de Fallecimiento</Label>
                    <p className="font-medium text-primary">{pdfParsed.fecha}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">Familiar Informante</Label>
                    <p className="font-medium text-primary">{pdfParsed.familiar}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="outline">Subir otro</Button>
                  <Button className="ml-2">Continuar a Generar Orden</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
