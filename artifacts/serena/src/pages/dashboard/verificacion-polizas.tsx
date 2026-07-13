import { useState } from 'react';
import { useGetPolicies, useGetPolicyByCedula, getGetPolicyByCedulaQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShieldCheck, CheckCircle2, AlertCircle, PhoneCall } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function VerificacionPolizas() {
  const [cedula, setCedula] = useState('');
  const [searchCedula, setSearchCedula] = useState('');

  const { data: searchResult, isLoading: isSearching, isError: isSearchError } = useGetPolicyByCedula(searchCedula, {
    query: {
      enabled: !!searchCedula,
      queryKey: getGetPolicyByCedulaQueryKey(searchCedula)
    }
  });

  const { data: allPolicies, isLoading: isLoadingAll } = useGetPolicies();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cedula.trim()) {
      setSearchCedula(cedula.trim());
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Buscar Póliza Específica</CardTitle>
          <CardDescription>Ingrese el número de cédula del titular para verificar cobertura y solvencia.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex max-w-md gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Cédula (Ej: V-14555666)" 
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={isSearching}>Consultar</Button>
          </form>

          {isSearching && (
            <div className="mt-6 flex items-center justify-center p-4">
              <div className="w-6 h-6 border-2 border-primary border-t-brand-gold rounded-full animate-spin" />
            </div>
          )}

          {isSearchError && (
            <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">No se encontró ninguna póliza para la cédula: {searchCedula}</p>
            </div>
          )}

          {searchResult && (
            <div className="mt-6 border border-border rounded-lg overflow-hidden bg-card animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-muted/30 p-5 flex justify-between items-start border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-brand-gold" />
                    <h3 className="text-xl font-serif font-medium text-primary">{searchResult.titular}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">C.I. {searchResult.cedula}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  searchResult.estatus.toLowerCase() === 'solvente' 
                    ? 'bg-green-500/10 text-green-700 border-green-500/20' 
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}>
                  {searchResult.estatus.toUpperCase()}
                </div>
              </div>
              
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4 md:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Aseguradora</p>
                      <p className="font-medium text-sm mt-1">{searchResult.aseguradora}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan</p>
                      <p className="font-medium text-sm mt-1">{searchResult.plan}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Límite</p>
                      <p className="font-medium text-sm mt-1 text-primary">${searchResult.limite_usd.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Servicios Cubiertos</p>
                    <ul className="grid grid-cols-2 gap-2">
                      {searchResult.cobertura.map((item, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-brand-gold/5 p-4 rounded-md border border-brand-gold/20 space-y-3">
                  <p className="text-xs text-brand-gold uppercase tracking-wider font-semibold">Contacto Aseguradora</p>
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-sm font-medium flex items-center gap-1 mt-0.5">
                      <PhoneCall className="w-3 h-3 text-muted-foreground" />
                      {searchResult.telefono_aseguradora || 'No disponible'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Persona Contacto</p>
                    <p className="text-sm font-medium mt-0.5">{searchResult.contacto_aseguradora || 'Atención general'}</p>
                  </div>
                  <Button variant="outline" className="w-full mt-2 text-xs h-8">Notificar Siniestro</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Registry */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Directorio de Pólizas</CardTitle>
          <CardDescription>Registro completo de pólizas activas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAll ? (
             <div className="py-8 flex justify-center">
               <div className="w-6 h-6 border-2 border-primary border-t-brand-gold rounded-full animate-spin" />
             </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titular</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Aseguradora</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Límite</TableHead>
                    <TableHead>Estatus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPolicies?.map((pol) => (
                    <TableRow key={pol.cedula}>
                      <TableCell className="font-medium text-primary">{pol.titular}</TableCell>
                      <TableCell className="text-muted-foreground">{pol.cedula}</TableCell>
                      <TableCell>{pol.aseguradora}</TableCell>
                      <TableCell className="text-muted-foreground">{pol.plan}</TableCell>
                      <TableCell className="text-right font-medium">${pol.limite_usd.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium border ${
                          pol.estatus.toLowerCase() === 'solvente' 
                            ? 'bg-green-500/10 text-green-700 border-green-500/20' 
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          {pol.estatus.toUpperCase()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {allPolicies?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No hay pólizas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
